// Radar de Criptomoedas com conexão WebSocket e REST da Binance
class CryptoRadar {
  constructor() {
    this.cryptoData = new Map();
    this.ws = null;
    this.currentFilter = 'all';
    this.searchQuery = '';
    this.topPairs = [
      'BTCUSDT', 'ETHUSDT', 'SOLUSDT', 'BNBUSDT', 'XRPUSDT', 
      'DOGEUSDT', 'ADAUSDT', 'AVAXUSDT', 'LINKUSDT', 'NEARUSDT',
      'SUIUSDT', 'PEPEUSDT', 'SHIBUSDT', 'DOTUSDT', 'INJUSDT',
      'RENDERUSDT', 'FETUSDT', 'TIAUSDT', 'ARBUSDT', 'OPUSDT'
    ];
    this.onPriceUpdate = null;
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
            const volume = parseFloat(t.q); // quote volume in USDT
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
      .filter(item => item.quoteVolume > 5000000); // Filtra moedas com liquidez mínima de $5M

    const opportunities = [];

    list.forEach(item => {
      const nearHigh = item.highPrice > 0 && (item.lastPrice >= item.highPrice * 0.985);
      const isSpike = item.priceChangePercent >= 5.0 && item.quoteVolume > 15000000;
      const isOversold = item.priceChangePercent <= -6.0;

      let score = 0;
      let tags = [];
      let thesis = '';

      if (isSpike) {
        score += 85;
        tags.push({ text: 'Volume Spike 🔥', class: 'badge-spike' });
        thesis = `Fluxo comprador forte com volume negociado superior a US$ ${(item.quoteVolume / 1000000).toFixed(1)}M nas últimas 24h.`;
      }

      if (nearHigh && item.priceChangePercent > 3) {
        score += 75;
        tags.push({ text: 'Rompimento 🚀', class: 'badge-breakout' });
        thesis = thesis || `Testando a máxima de 24h (${this.formatCurrency(item.highPrice)}). Pressão compradora indicando possível continuidade.`;
      }

      if (isOversold) {
        score += 70;
        tags.push({ text: 'Sobrevendido 💎', class: 'badge-discount' });
        thesis = `Queda acentuada de ${item.priceChangePercent.toFixed(1)}% nas últimas 24h. Oportunidade para avaliar repique técnico ou compra em suporte.`;
      }

      if (tags.length > 0) {
        opportunities.push({
          ...item,
          score,
          tags,
          thesis
        });
      }
    });

    return opportunities.sort((a, b) => b.score - a.score).slice(0, 9);
  }

  render() {
    this.renderOpportunities();
    this.renderCryptoTable();
    this.renderLiveTicker();
  }

  renderOpportunities() {
    const container = document.getElementById('crypto-opportunities-container');
    if (!container) return;

    const opps = this.getOpportunities();
    if (opps.length === 0) {
      container.innerHTML = `
        <div style="grid-column: 1/-1; text-align: center; padding: 40px; color: var(--text-dim);">
          Carregando oportunidades da Binance em tempo real...
        </div>`;
      return;
    }

    container.innerHTML = opps.map(coin => {
      const isPositive = coin.priceChangePercent >= 0;
      return `
        <div class="opportunity-card crypto-card" data-symbol="${coin.symbol}">
          <div>
            <div class="card-top">
              <div class="asset-identity">
                <div class="asset-icon" style="color: #00f59b; border-color: rgba(0, 245, 155, 0.2);">
                  ${coin.name.substring(0, 3)}
                </div>
                <div class="asset-names">
                  <h3>${coin.name}</h3>
                  <span>${coin.symbol} • Binance</span>
                </div>
              </div>
              <div class="tags-cluster">
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

            <div class="thesis-note">
              <strong>Tese do Garimpo:</strong> ${coin.thesis}
            </div>
          </div>

          <div class="card-actions">
            <button class="btn btn-primary btn-sm" onclick="window.app.openTradeModal('${coin.symbol}', 'crypto', ${coin.lastPrice})">
              Simular Compra
            </button>
            <a href="https://www.binance.com/pt-BR/trade/${coin.name}_USDT" target="_blank" rel="noopener" class="btn btn-outline btn-sm">
              Ver Gráfico ↗
            </a>
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

    if (this.currentFilter === 'gainers') {
      items = items.sort((a, b) => b.priceChangePercent - a.priceChangePercent);
    } else if (this.currentFilter === 'losers') {
      items = items.sort((a, b) => a.priceChangePercent - b.priceChangePercent);
    } else if (this.currentFilter === 'volume') {
      items = items.sort((a, b) => b.quoteVolume - a.quoteVolume);
    } else {
      // Default: top pairs first, then volume
      items = items.sort((a, b) => b.quoteVolume - a.quoteVolume);
    }

    tbody.innerHTML = items.slice(0, 30).map((coin, idx) => {
      const isPositive = coin.priceChangePercent >= 0;
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
            <button class="btn btn-outline btn-sm" onclick="window.app.openTradeModal('${coin.symbol}', 'crypto', ${coin.lastPrice})">
              Comprar
            </button>
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
        <div class="ticker-chip" onclick="window.app.openTradeModal('${coin.symbol}', 'crypto', ${coin.lastPrice})">
          <strong>${coin.name}</strong>
          <span>$${this.formatPrice(coin.lastPrice)}</span>
          <span style="color: ${isPositive ? 'var(--accent-green)' : 'var(--accent-red)'}">
            ${isPositive ? '▲' : '▼'}${coin.priceChangePercent.toFixed(1)}%
          </span>
        </div>
      `;
    }).join('');

    // Duplicate content for smooth marquee infinite loop
    track.innerHTML = html + html;
  }

  updateDOMPrices() {
    // Atualiza elementos específicos sem remontar a tabela inteira para máxima performance
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
            void parentRow.offsetWidth; // trigger reflow
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

  setFilter(filter) {
    this.currentFilter = filter;
    this.renderCryptoTable();
  }

  setSearch(q) {
    this.searchQuery = q;
    this.renderCryptoTable();
  }
}

window.CryptoRadar = CryptoRadar;
