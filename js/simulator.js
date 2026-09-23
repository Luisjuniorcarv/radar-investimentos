// Simulador de Investimentos (Paper Trading / Carteira Virtual)
class PortfolioSimulator {
  constructor() {
    this.storageKey = 'radar_alpha_portfolio_v1';
    this.usdToBrl = 5.65; // Cotação de conversão de dólar para cotações cripto
    this.state = this.loadState();
  }

  loadState() {
    const saved = localStorage.getItem(this.storageKey);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Erro ao ler estado do simulador:', e);
      }
    }

    return {
      initialCash: 25000.00,
      cash: 25000.00,
      positions: {}, // { 'BTCUSDT': { symbol: 'BTCUSDT', type: 'crypto', qty: 0.05, avgPriceUsd: 65000, avgPriceBrl: 367250 } }
      history: []
    };
  }

  saveState() {
    localStorage.setItem(this.storageKey, JSON.stringify(this.state));
    this.updateUI();
  }

  resetPortfolio() {
    if (confirm('Deseja realmente reiniciar sua carteira virtual para R$ 25.000,00?')) {
      this.state = {
        initialCash: 25000.00,
        cash: 25000.00,
        positions: {},
        history: []
      };
      this.saveState();
      window.app.showToast('Carteira virtual reiniciada com sucesso!');
    }
  }

  buy(symbol, type, price, amountBrl) {
    if (amountBrl <= 0 || isNaN(amountBrl)) {
      window.app.showToast('Valor de compra inválido.', 'error');
      return false;
    }

    if (amountBrl > this.state.cash) {
      window.app.showToast('Saldo insuficiente em caixa!', 'error');
      return false;
    }

    let unitPriceBrl = price;
    let qty = 0;

    if (type === 'crypto') {
      unitPriceBrl = price * this.usdToBrl;
      qty = amountBrl / unitPriceBrl;
    } else {
      // FII (compra por cotas inteiras)
      const shares = Math.floor(amountBrl / price);
      if (shares <= 0) {
        window.app.showToast(`Valor insuficiente para comprar 1 cota de ${symbol} (R$ ${price.toFixed(2)})`, 'error');
        return false;
      }
      qty = shares;
      amountBrl = shares * price;
    }

    this.state.cash -= amountBrl;

    const existing = this.state.positions[symbol] || {
      symbol,
      type,
      qty: 0,
      totalInvestedBrl: 0,
      avgPriceBrl: 0
    };

    const newTotalInvested = existing.totalInvestedBrl + amountBrl;
    const newQty = existing.qty + qty;
    const newAvgPrice = newTotalInvested / newQty;

    this.state.positions[symbol] = {
      symbol,
      type,
      qty: newQty,
      totalInvestedBrl: newTotalInvested,
      avgPriceBrl: newAvgPrice
    };

    this.state.history.unshift({
      id: Date.now(),
      date: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      type: 'COMPRA',
      symbol,
      qty,
      unitPriceBrl,
      totalBrl: amountBrl
    });

    this.saveState();
    window.app.showToast(`Compra realizada: ${qty.toFixed(type === 'crypto' ? 4 : 0)} de ${symbol}`);
    return true;
  }

  sell(symbol, sellQty) {
    const pos = this.state.positions[symbol];
    if (!pos || pos.qty < sellQty || sellQty <= 0) {
      window.app.showToast('Quantidade inválida para venda.', 'error');
      return false;
    }

    // Obter preço atual
    let currentPriceBrl = 0;
    if (pos.type === 'crypto') {
      const coin = window.app.cryptoRadar.cryptoData.get(symbol);
      currentPriceBrl = (coin ? coin.lastPrice : (pos.avgPriceBrl / this.usdToBrl)) * this.usdToBrl;
    } else {
      const fii = window.app.fiiRadar.fiiList.find(f => f.ticker === symbol);
      currentPriceBrl = fii ? fii.price : pos.avgPriceBrl;
    }

    const totalSaleBrl = sellQty * currentPriceBrl;
    this.state.cash += totalSaleBrl;

    pos.qty -= sellQty;
    pos.totalInvestedBrl = pos.qty * pos.avgPriceBrl;

    if (pos.qty <= 0.000001) {
      delete this.state.positions[symbol];
    }

    this.state.history.unshift({
      id: Date.now(),
      date: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      type: 'VENDA',
      symbol,
      qty: sellQty,
      unitPriceBrl: currentPriceBrl,
      totalBrl: totalSaleBrl
    });

    this.saveState();
    window.app.showToast(`Venda concluída de ${symbol}: R$ ${totalSaleBrl.toFixed(2)}`);
    return true;
  }

  getCurrentPortfolioValue() {
    let assetsValue = 0;

    Object.values(this.state.positions).forEach(pos => {
      let currentPriceBrl = 0;
      if (pos.type === 'crypto') {
        const coin = window.app.cryptoRadar.cryptoData.get(pos.symbol);
        const lastUsd = coin ? coin.lastPrice : (pos.avgPriceBrl / this.usdToBrl);
        currentPriceBrl = lastUsd * this.usdToBrl;
      } else {
        const fii = window.app.fiiRadar.fiiList.find(f => f.ticker === pos.symbol);
        currentPriceBrl = fii ? fii.price : pos.avgPriceBrl;
      }
      assetsValue += pos.qty * currentPriceBrl;
    });

    const totalEquity = this.state.cash + assetsValue;
    const totalProfitBrl = totalEquity - this.state.initialCash;
    const totalProfitPct = ((totalEquity - this.state.initialCash) / this.state.initialCash) * 100;

    return {
      cash: this.state.cash,
      assetsValue,
      totalEquity,
      totalProfitBrl,
      totalProfitPct
    };
  }

  updateUI() {
    const portfolio = this.getCurrentPortfolioValue();

    // Top Bar Widget
    const topBarDisplay = document.getElementById('wallet-display-value');
    if (topBarDisplay) {
      topBarDisplay.textContent = 'R$ ' + portfolio.totalEquity.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }

    // Portfolio Dashboard Cards
    const cashEl = document.getElementById('port-cash');
    const assetsEl = document.getElementById('port-assets');
    const totalEl = document.getElementById('port-total');
    const profitEl = document.getElementById('port-profit');

    if (cashEl) cashEl.textContent = 'R$ ' + portfolio.cash.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    if (assetsEl) assetsEl.textContent = 'R$ ' + portfolio.assetsValue.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    if (totalEl) totalEl.textContent = 'R$ ' + portfolio.totalEquity.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    if (profitEl) {
      const isPositive = portfolio.totalProfitBrl >= 0;
      profitEl.textContent = `${isPositive ? '+' : ''}R$ ${portfolio.totalProfitBrl.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} (${portfolio.totalProfitPct.toFixed(2)}%)`;
      profitEl.style.color = isPositive ? 'var(--accent-green)' : 'var(--accent-red)';
    }

    this.renderPositionsTable();
    this.renderHistoryTable();
  }

  renderPositionsTable() {
    const tbody = document.getElementById('portfolio-positions-body');
    if (!tbody) return;

    const positions = Object.values(this.state.positions);
    if (positions.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="7" style="text-align: center; padding: 30px; color: var(--text-dim);">
            Nenhum ativo na carteira simulada. Use os botões <strong>"Simular Compra"</strong> no Radar de Cripto ou FIIs para praticar!
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = positions.map(pos => {
      let currentPriceBrl = 0;
      if (pos.type === 'crypto') {
        const coin = window.app.cryptoRadar.cryptoData.get(pos.symbol);
        currentPriceBrl = (coin ? coin.lastPrice : (pos.avgPriceBrl / this.usdToBrl)) * this.usdToBrl;
      } else {
        const fii = window.app.fiiRadar.fiiList.find(f => f.ticker === pos.symbol);
        currentPriceBrl = fii ? fii.price : pos.avgPriceBrl;
      }

      const totalCurrentBrl = pos.qty * currentPriceBrl;
      const profitBrl = totalCurrentBrl - pos.totalInvestedBrl;
      const profitPct = pos.totalInvestedBrl > 0 ? (profitBrl / pos.totalInvestedBrl) * 100 : 0;
      const isPos = profitBrl >= 0;

      return `
        <tr>
          <td>
            <strong>${pos.symbol}</strong>
            <span class="badge" style="margin-left: 6px; font-size: 0.65rem;">${pos.type.toUpperCase()}</span>
          </td>
          <td class="mono">${pos.type === 'crypto' ? pos.qty.toFixed(4) : pos.qty.toFixed(0)}</td>
          <td class="mono">R$ ${pos.avgPriceBrl.toFixed(2)}</td>
          <td class="mono">R$ ${currentPriceBrl.toFixed(2)}</td>
          <td class="mono" style="font-weight: 700;">R$ ${totalCurrentBrl.toFixed(2)}</td>
          <td class="mono" style="color: ${isPos ? 'var(--accent-green)' : 'var(--accent-red)'}; font-weight: 700;">
            ${isPos ? '+' : ''}R$ ${profitBrl.toFixed(2)} (${profitPct.toFixed(2)}%)
          </td>
          <td>
            <button class="btn btn-outline btn-sm" onclick="window.app.openSellModal('${pos.symbol}', ${pos.qty})">
              Vender
            </button>
          </td>
        </tr>
      `;
    }).join('');
  }

  renderHistoryTable() {
    const tbody = document.getElementById('portfolio-history-body');
    if (!tbody) return;

    if (this.state.history.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="5" style="text-align: center; padding: 20px; color: var(--text-dim);">
            Nenhuma operação recente registrada.
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = this.state.history.slice(0, 15).map(h => `
      <tr>
        <td style="color: var(--text-dim);">${h.date}</td>
        <td>
          <span class="badge ${h.type === 'COMPRA' ? 'badge-discount' : 'badge-spike'}">${h.type}</span>
        </td>
        <td><strong>${h.symbol}</strong></td>
        <td class="mono">${typeof h.qty === 'number' ? (h.qty % 1 === 0 ? h.qty : h.qty.toFixed(4)) : h.qty}</td>
        <td class="mono">R$ ${h.totalBrl.toFixed(2)}</td>
      </tr>
    `).join('');
  }
}

window.PortfolioSimulator = PortfolioSimulator;
