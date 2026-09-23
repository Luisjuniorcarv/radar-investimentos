// Radar de Criptomoedas com Sinais de Compra, Venda e Links Diretos para a Área de Compra
class CryptoRadar {
  constructor() {
    this.cryptoData = new Map();
    this.ws = null;
    this.currentFilter = 'all'; // 'all', 'buy', 'sell'
    this.tableFilter = 'all';
    this.searchQuery = '';
    this.topPairs = [
      'BTCUSDT', 'ETHUSDT', 'SOLUSDT', 'BNBUSDT', 'XRPUSDT', 
      'DOGEUSDT', 'ADAUSDT', 'AVAXUSDT', 'LINKUSDT', 'NEARUSDT',
      'SUIUSDT', 'PEPEUSDT', 'SHIBUSDT', 'DOTUSDT', 'INJUSDT',
      'RENDERUSDT', 'FETUSDT', 'TIAUSDT', 'ARBUSDT', 'OPUSDT'
    ];
  }

  async init() {
    await this.fetchInitialData();
    this.connectWebSocket();
  }

  async fetchInitialData() {
    try {
      const res = await fetch('https://api.binance.com/api/v3/ticker/24hr');
      if (!res.ok) throw new Error('Falha ao carregar cotações iniciais');
      const allTickers = await res.json();
      
      allTickers.forEach(item => {
        if (item.symbol.endsWith('USDT')) {
          this.processTicker(item);
        }
      });
      this.render();
    } catch (err) {
      console.warn('Erro ao carregar REST Binance, usando fallback:', err);
    }
  }

  connectWebSocket() {
    try {
      this.ws = new WebSocket('wss://stream.binance.com:9443/ws/!miniTicker@arr');

      this.ws.onmessage = (event) => {
        const miniTickers = JSON.parse(event.data);
        let hasRelevantUpdate = false;

        miniTickers.forEach(t => {
          if (t.s.endsWith('USDT')) {
            const existing = this.cryptoData.get(t.s) || { symbol: t.s, name: t.s.replace('USDT', '') };
            const lastPrice = parseFloat(t.c);
            const openPrice = parseFloat(t.o);
            const highPrice = parseFloat(t.h);
            const lowPrice = parseFloat(t.l);
            const volume = parseFloat(t.q);
            const priceChangePercent = openPrice > 0 ? ((lastPrice - openPrice) / openPrice) * 100 : 0;

            const prevPrice = existing.lastPrice || lastPrice;
            existing.lastPrice = lastPrice;
            existing.priceChangePercent = priceChangePercent;
            existing.highPrice = highPrice;
            existing.lowPrice = lowPrice;
            existing.quoteVolume = volume;
            existing.trend = lastPrice > prevPrice ? 'up' : (lastPrice < prevPrice ? 'down' : existing.trend);
            existing.lastUpdated = Date.now();

            this.cryptoData.set(t.s, existing);

            if (this.topPairs.includes(t.s)) {
              hasRelevantUpdate = true;
            }
          }
        });

        if (hasRelevantUpdate) {
          this.renderLiveTicker();
          this.updateDOMPrices();
        }
      };

      this.ws.onerror = (err) => {
        console.error('WebSocket Binance erro:', err);
      };

      this.ws.onclose = () => {
        console.log('WebSocket Binance desconectado. Reconectando em 5s...');
        setTimeout(() => this.connectWebSocket(), 5000);
      };
    } catch (e) {
      console.error('Falha ao iniciar WebSocket:', e);
    }
  }

  processTicker(item) {
    const symbol = item.symbol;
    const name = symbol.replace('USDT', '');
    const lastPrice = parseFloat(item.lastPrice);
    const priceChangePercent = parseFloat(item.priceChangePercent);
    const highPrice = parseFloat(item.highPrice);
    const lowPrice = parseFloat(item.lowPrice);
    const quoteVolume = parseFloat(item.quoteVolume);

    this.cryptoData.set(symbol, {
      symbol,
      name,
      lastPrice,
      priceChangePercent,
      highPrice,
      lowPrice,
      quoteVolume,
      trend: priceChangePercent >= 0 ? 'up' : 'down',
      lastUpdated: Date.now()
    });
  }

  getOpportunities() {
    const list = Array.from(this.cryptoData.values())
      .filter(item => item.quoteVolume > 5000000); // Liquidez mínima de $5M

    const opportunities = [];

    list.forEach(item => {
      const nearHigh = item.highPrice > 0 && (item.lastPrice >= item.highPrice * 0.985);
      const nearLow = item.lowPrice > 0 && (item.lastPrice <= item.lowPrice * 1.02);
      const isSpikeBuy = item.priceChangePercent >= 5.0 && item.quoteVolume > 15000000;
      const isOversoldBuy = item.priceChangePercent <= -6.0;
      const isOverboughtSell = item.priceChangePercent >= 12.0; // Alta exagerada -> risco de correção
      const isBreakdownSell = item.priceChangePercent <= -8.5 && nearLow; // Perda de suporte

      // SINAL DE VENDA / REALIZAÇÃO
      if (isOverboughtSell) {
        opportunities.push({
          ...item,
          signalType: 'sell',
          score: 95,
          tags: [
            { text: '🔴 SINAL DE VENDA / REALIZAÇÃO', class: 'badge-signal-sell' },
            { text: 'Sobrecomprado ⚠️', class: 'badge-spike' }
          ],
          thesis: `Alta expressiva de +${item.priceChangePercent.toFixed(1)}% nas 24h. O ativo atingiu níveis de euforia (sobrecompra). Momento técnico propício para realizar lucros parciais antes de uma retração.`
        });
      } else if (isBreakdownSell) {
        opportunities.push({
          ...item,
          signalType: 'sell',
          score: 85,
          tags: [
            { text: '🔴 ALERTA DE RISCO / STOP', class: 'badge-signal-sell' },
            { text: 'Perda de Suporte 🛑', class: 'badge-spike' }
          ],
          thesis: `Queda brusca de ${item.priceChangePercent.toFixed(1)}% colada na mínima do dia. Pressão vendedora intensa — momento de avaliar stop loss de proteção de patrimônio.`
        });
      }
      
      // SINAL DE COMPRA / OPORTUNIDADE
      else if (isOversoldBuy) {
        opportunities.push({
          ...item,
          signalType: 'buy',
          score: 88,
          tags: [
            { text: '🟢 SINAL DE COMPRA', class: 'badge-signal-buy' },
            { text: 'Sobrevendido 💎', class: 'badge-discount' }
          ],
          thesis: `Queda acentuada de ${item.priceChangePercent.toFixed(1)}% nas 24h. Indicadores em nível de sobrevenda extrema. Excelente janela para compras parciais visando repique técnico.`
        });
      } else if (isSpikeBuy) {
        opportunities.push({
          ...item,
          signalType: 'buy',
          score: 86,
          tags: [
            { text: '🟢 SINAL DE COMPRA', class: 'badge-signal-buy' },
            { text: 'Volume Spike 🔥', class: 'badge-spike' }
          ],
          thesis: `Entrada maciça de capital com volume superior a US$ ${(item.quoteVolume / 1000000).toFixed(1)}M. Força compradora demonstrando ímpeto de alta.`
        });
      } else if (nearHigh && item.priceChangePercent > 3) {
        opportunities.push({
          ...item,
          signalType: 'buy',
          score: 75,
          tags: [
            { text: '🟢 SINAL DE COMPRA', class: 'badge-signal-buy' },
            { text: 'Rompimento 🚀', class: 'badge-breakout' }
          ],
          thesis: `Ativo rompendo a resistência das últimas 24h (${this.formatCurrency(item.highPrice)}). Fluxo comprador dominante.`
        });
      }
    });

    return opportunities.sort((a, b) => b.score - a.score);
  }

  render() {
    this.renderOpportunities();
    this.renderCryptoTable();
    this.renderLiveTicker();
  }

  renderOpportunities() {
    const container = document.getElementById('crypto-opportunities-container');
    if (!container) return;

    let opps = this.getOpportunities();

    if (this.currentFilter === 'buy') {
      opps = opps.filter(o => o.signalType === 'buy');
    } else if (this.currentFilter === 'sell') {
      opps = opps.filter(o => o.signalType === 'sell');
    }

    if (opps.length === 0) {
      container.innerHTML = `
        <div style="grid-column: 1/-1; text-align: center; padding: 40px; color: var(--text-dim);">
          Nenhuma oportunidade detectada no filtro selecionado no momento.
        </div>`;
      return;
    }

    container.innerHTML = opps.slice(0, 9).map(coin => {
      const isPositive = coin.priceChangePercent >= 0;
      const isSell = coin.signalType === 'sell';
      const binanceTradeUrl = `https://www.binance.com/pt-BR/trade/${coin.name}_USDT?type=spot`;

      return `
        <div class="opportunity-card ${isSell ? 'signal-sell' : 'signal-buy'}" data-symbol="${coin.symbol}">
          <div>
            <div class="card-top">
              <div class="asset-identity">
                <div class="asset-icon" style="color: ${isSell ? '#ff4d6d' : '#00f59b'}; border-color: ${isSell ? 'rgba(255, 77, 109, 0.3)' : 'rgba(0, 245, 155, 0.3)'};">
                  ${coin.name.substring(0, 3)}
                </div>
                <div class="asset-names">
                  <h3>${coin.name}</h3>
                  <span>${coin.symbol} • Binance</span>
                </div>
              </div>
              <div class="tags-cluster" style="display: flex; flex-direction: column; align-items: flex-end; gap: 4px;">
                ${coin.tags.map(t => `<span class="badge ${t.class}">${t.text}</span>`).join('')}
              </div>
            </div>

            <div class="price-row">
              <div class="price-main">$<span class="live-price" data-sym="${coin.symbol}">${this.formatPrice(coin.lastPrice)}</span></div>
              <div class="price-change ${isPositive ? 'positive' : 'negative'}">
                ${isPositive ? '▲ +' : '▼ '}${coin.priceChangePercent.toFixed(2)}%
              </div>
            </div>

            <div class="metrics-grid">
              <div class="metric-item">
                <span class="label">Volume 24h</span>
                <span class="value">$${this.formatVolume(coin.quoteVolume)}</span>
              </div>
              <div class="metric-item">
                <span class="label">Máx / Mín 24h</span>
                <span class="value">$${this.formatPrice(coin.highPrice)} / $${this.formatPrice(coin.lowPrice)}</span>
              </div>
            </div>

            <div class="thesis-note ${isSell ? 'alert-sell' : ''}">
              <strong>${isSell ? '⚠️ Tese de Venda / Risco:' : '💡 Tese de Compra:'}</strong> ${coin.thesis}
            </div>
          </div>

          <div class="card-actions">
            <a href="${binanceTradeUrl}" target="_blank" rel="noopener" class="btn ${isSell ? 'btn-danger' : 'btn-broker'} btn-sm" title="Abrir direto no livro de ofertas da Binance">
              🛒 Ir para Compra na Binance ↗
            </a>
            <button class="btn btn-outline btn-sm" onclick="window.app.openTradeModal('${coin.symbol}', 'crypto', ${coin.lastPrice})">
              💼 Simular na Carteira
            </button>
          </div>
        </div>
      `;
    }).join('');
  }

  renderCryptoTable() {
    const tbody = document.getElementById('crypto-table-body');
    if (!tbody) return;

    let items = Array.from(this.cryptoData.values())
      .filter(item => {
        if (this.searchQuery) {
          const q = this.searchQuery.toUpperCase();
          return item.symbol.includes(q) || item.name.includes(q);
        }
        return this.topPairs.includes(item.symbol) || item.quoteVolume > 15000000;
      });

    if (this.tableFilter === 'gainers') {
      items = items.sort((a, b) => b.priceChangePercent - a.priceChangePercent);
    } else if (this.tableFilter === 'losers') {
      items = items.sort((a, b) => a.priceChangePercent - b.priceChangePercent);
    } else if (this.tableFilter === 'volume') {
      items = items.sort((a, b) => b.quoteVolume - a.quoteVolume);
    } else {
      items = items.sort((a, b) => b.quoteVolume - a.quoteVolume);
    }

    tbody.innerHTML = items.slice(0, 30).map((coin, idx) => {
      const isPositive = coin.priceChangePercent >= 0;
      const binanceTradeUrl = `https://www.binance.com/pt-BR/trade/${coin.name}_USDT?type=spot`;

      return `
        <tr data-symbol="${coin.symbol}">
          <td style="color: var(--text-dim); font-size: 0.78rem;">#${idx + 1}</td>
          <td>
            <div style="display: flex; align-items: center; gap: 8px;">
              <strong style="color: var(--text-main); font-size: 0.95rem;">${coin.name}</strong>
              <span style="font-size: 0.75rem; color: var(--text-dim);">USDT</span>
            </div>
          </td>
          <td class="mono" style="font-weight: 700;">
            $<span class="live-price" data-sym="${coin.symbol}">${this.formatPrice(coin.lastPrice)}</span>
          </td>
          <td class="mono ${isPositive ? 'price-change positive' : 'price-change negative'}" style="display: inline-block; margin-top: 10px;">
            ${isPositive ? '+' : ''}${coin.priceChangePercent.toFixed(2)}%
          </td>
          <td class="mono" style="color: var(--text-muted);">$${this.formatPrice(coin.highPrice)}</td>
          <td class="mono" style="color: var(--text-muted);">$${this.formatPrice(coin.lowPrice)}</td>
          <td class="mono">$${this.formatVolume(coin.quoteVolume)}</td>
          <td>
            <div style="display: flex; gap: 6px;">
              <a href="${binanceTradeUrl}" target="_blank" rel="noopener" class="btn btn-broker btn-sm" title="Ir para a área de compra na corretora">
                🛒 Comprar
              </a>
              <button class="btn btn-outline btn-sm" onclick="window.app.openTradeModal('${coin.symbol}', 'crypto', ${coin.lastPrice})" title="Testar na carteira simulada">
                💼 Simular
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join('');
  }

  renderLiveTicker() {
    const track = document.getElementById('live-ticker-track');
    if (!track) return;

    const featured = ['BTCUSDT', 'ETHUSDT', 'SOLUSDT', 'BNBUSDT', 'XRPUSDT', 'DOGEUSDT', 'ADAUSDT'];
    const html = featured.map(sym => {
      const coin = this.cryptoData.get(sym);
      if (!coin) return '';
      const isPositive = coin.priceChangePercent >= 0;
      return `
        <div class="ticker-chip" onclick="window.open('https://www.binance.com/pt-BR/trade/${coin.name}_USDT?type=spot', '_blank')">
          <strong>${coin.name}</strong>
          <span>$${this.formatPrice(coin.lastPrice)}</span>
          <span style="color: ${isPositive ? 'var(--accent-green)' : 'var(--accent-red)'}">
            ${isPositive ? '▲' : '▼'}${coin.priceChangePercent.toFixed(1)}%
          </span>
        </div>
      `;
    }).join('');

    track.innerHTML = html + html;
  }

  updateDOMPrices() {
    const elements = document.querySelectorAll('.live-price');
    elements.forEach(el => {
      const sym = el.getAttribute('data-sym');
      const coin = this.cryptoData.get(sym);
      if (coin) {
        const formatted = this.formatPrice(coin.lastPrice);
        if (el.textContent !== formatted) {
          el.textContent = formatted;
          const parentRow = el.closest('tr') || el.closest('.opportunity-card');
          if (parentRow) {
            parentRow.classList.remove('flash-up', 'flash-down');
            void parentRow.offsetWidth;
            parentRow.classList.add(coin.trend === 'up' ? 'flash-up' : 'flash-down');
          }
        }
      }
    });
  }

  formatPrice(price) {
    if (!price && price !== 0) return '0.00';
    if (price >= 1000) return price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    if (price >= 1) return price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 4 });
    if (price >= 0.0001) return price.toFixed(6);
    return price.toFixed(8);
  }

  formatCurrency(val) {
    return '$' + this.formatPrice(val);
  }

  formatVolume(val) {
    if (!val) return '0.00';
    if (val >= 1000000000) return (val / 1000000000).toFixed(2) + 'B';
    if (val >= 1000000) return (val / 1000000).toFixed(1) + 'M';
    if (val >= 1000) return (val / 1000).toFixed(1) + 'K';
    return val.toFixed(2);
  }

  setSignalFilter(filter) {
    this.currentFilter = filter;
    this.renderOpportunities();
  }

  setTableFilter(filter) {
    this.tableFilter = filter;
    this.renderCryptoTable();
  }

  setSearch(q) {
    this.searchQuery = q;
    this.renderCryptoTable();
  }
}

window.CryptoRadar = CryptoRadar;
