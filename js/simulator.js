// Simulador de Investimentos Multiativos (Cripto, FIIs, Fiagros, Ações B3, BDRs e Renda Fixa)
class PortfolioSimulator {
  constructor() {
    this.storageKey = 'radar_alpha_portfolio_v2';
    this.usdToBrl = 5.65;
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
      initialCash: 50000.00, // R$ 50.000 para permitir montar uma carteira diversificada
      cash: 50000.00,
      positions: {},
      history: []
    };
  }

  saveState() {
    localStorage.setItem(this.storageKey, JSON.stringify(this.state));
    this.updateUI();
  }

  resetPortfolio() {
    if (confirm('Deseja realmente reiniciar sua carteira virtual para R$ 50.000,00?')) {
      this.state = {
        initialCash: 50000.00,
        cash: 50000.00,
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
    } else if (type === 'fixed_income') {
      qty = amountBrl;
      unitPriceBrl = 1.00;
    } else {
      // Ações, FIIs, Fiagros, BDRs (compra por unidades/cotas inteiras)
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
      avgPriceBrl: 0,
      buyDate: Date.now()
    };

    const newTotalInvested = existing.totalInvestedBrl + amountBrl;
    const newQty = existing.qty + qty;
    const newAvgPrice = newTotalInvested / newQty;

    this.state.positions[symbol] = {
      symbol,
      type,
      qty: newQty,
      totalInvestedBrl: newTotalInvested,
      avgPriceBrl: newAvgPrice,
      buyDate: existing.buyDate || Date.now()
    };

    this.state.history.unshift({
      id: Date.now(),
      date: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      type: 'COMPRA',
      assetType: type,
      symbol,
      qty,
      unitPriceBrl,
      totalBrl: amountBrl
    });

    this.saveState();
    window.app.showToast(`Compra realizada: ${qty % 1 === 0 ? qty : qty.toFixed(4)} de ${symbol}`);
    return true;
  }

  sell(symbol, sellQty) {
    const pos = this.state.positions[symbol];
    if (!pos || pos.qty < sellQty || sellQty <= 0) {
      window.app.showToast('Quantidade inválida para venda.', 'error');
      return false;
    }

    const currentPriceBrl = this.getCurrentAssetPrice(pos.symbol, pos.type, pos.avgPriceBrl);
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
      assetType: pos.type,
      symbol,
      qty: sellQty,
      unitPriceBrl: currentPriceBrl,
      totalBrl: totalSaleBrl
    });

    this.saveState();
    window.app.showToast(`Venda concluída de ${symbol}: R$ ${totalSaleBrl.toFixed(2)}`);
    return true;
  }

  getCurrentAssetPrice(symbol, type, fallback) {
    if (type === 'crypto') {
      const coin = window.app.cryptoRadar?.cryptoData?.get(symbol);
      return coin ? coin.lastPrice * this.usdToBrl : fallback;
    } else if (type === 'fii' || type === 'fiagro') {
      const fii = window.app.fiiRadar?.fiiList?.find(f => f.ticker === symbol);
      return fii ? fii.price : fallback;
    } else if (type === 'stock' || type === 'bdr') {
      const stock = window.app.stocksRadar?.stocksList?.find(s => s.ticker === symbol);
      return stock ? stock.price : fallback;
    } else if (type === 'fixed_income') {
      // Rendimento aproximado de 10.5% a.a. sobre o principal
      return 1.00;
    }
    return fallback;
  }

  getCurrentPortfolioValue() {
    let assetsValue = 0;
    const allocation = {
      crypto: 0,
      fii: 0,
      fiagro: 0,
      stock: 0,
      bdr: 0,
      fixed_income: 0
    };

    Object.values(this.state.positions).forEach(pos => {
      const currentPriceBrl = this.getCurrentAssetPrice(pos.symbol, pos.type, pos.avgPriceBrl);
      const val = pos.qty * currentPriceBrl;
      assetsValue += val;

      const cat = pos.type || 'stock';
      allocation[cat] = (allocation[cat] || 0) + val;
    });

    const totalEquity = this.state.cash + assetsValue;
    const totalProfitBrl = totalEquity - this.state.initialCash;
    const totalProfitPct = ((totalEquity - this.state.initialCash) / this.state.initialCash) * 100;

    return {
      cash: this.state.cash,
      assetsValue,
      totalEquity,
      totalProfitBrl,
      totalProfitPct,
      allocation
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

    this.renderAllocationBar(portfolio);
    this.renderPositionsTable();
    this.renderHistoryTable();
  }

  renderAllocationBar(portfolio) {
    const bar = document.getElementById('portfolio-allocation-bar');
    if (!bar) return;

    const total = portfolio.totalEquity;
    if (total <= 0) return;

    const cashPct = ((portfolio.cash / total) * 100).toFixed(1);
    const cryptoPct = (((portfolio.allocation.crypto || 0) / total) * 100).toFixed(1);
    const fiiPct = ((((portfolio.allocation.fii || 0) + (portfolio.allocation.fiagro || 0)) / total) * 100).toFixed(1);
    const stockPct = (((portfolio.allocation.stock || 0) / total) * 100).toFixed(1);
    const bdrPct = (((portfolio.allocation.bdr || 0) / total) * 100).toFixed(1);
    const fixedPct = (((portfolio.allocation.fixed_income || 0) / total) * 100).toFixed(1);

    bar.innerHTML = `
      <div style="display: flex; height: 12px; border-radius: 6px; overflow: hidden; background: #1a263d; margin-bottom: 12px;">
        <div style="width: ${cashPct}%; background: #00d2ff;" title="Caixa: ${cashPct}%"></div>
        <div style="width: ${cryptoPct}%; background: #00f59b;" title="Cripto: ${cryptoPct}%"></div>
        <div style="width: ${fiiPct}%; background: #ffb800;" title="FIIs & Agro: ${fiiPct}%"></div>
        <div style="width: ${stockPct}%; background: #9d4edd;" title="Ações B3: ${stockPct}%"></div>
        <div style="width: ${bdrPct}%; background: #ff4d6d;" title="BDRs EUA: ${bdrPct}%"></div>
        <div style="width: ${fixedPct}%; background: #48cae4;" title="Renda Fixa: ${fixedPct}%"></div>
      </div>
      <div style="display: flex; gap: 14px; flex-wrap: wrap; font-size: 0.78rem; color: var(--text-muted);">
        <span><strong style="color: #00d2ff;">● Caixa:</strong> ${cashPct}%</span>
        <span><strong style="color: #00f59b;">● Cripto:</strong> ${cryptoPct}%</span>
        <span><strong style="color: #ffb800;">● FIIs & Agro:</strong> ${fiiPct}%</span>
        <span><strong style="color: #9d4edd;">● Ações B3:</strong> ${stockPct}%</span>
        <span><strong style="color: #ff4d6d;">● BDRs EUA:</strong> ${bdrPct}%</span>
        <span><strong style="color: #48cae4;">● Renda Fixa:</strong> ${fixedPct}%</span>
      </div>
    `;
  }

  renderPositionsTable() {
    const tbody = document.getElementById('portfolio-positions-body');
    if (!tbody) return;

    const positions = Object.values(this.state.positions);
    if (positions.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="7" style="text-align: center; padding: 30px; color: var(--text-dim);">
            Nenhum ativo na carteira simulada. Use os botões <strong>"Simular"</strong> em qualquer ativo para montar seu portfólio!
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = positions.map(pos => {
      const currentPriceBrl = this.getCurrentAssetPrice(pos.symbol, pos.type, pos.avgPriceBrl);
      const totalCurrentBrl = pos.qty * currentPriceBrl;
      const profitBrl = totalCurrentBrl - pos.totalInvestedBrl;
      const profitPct = pos.totalInvestedBrl > 0 ? (profitBrl / pos.totalInvestedBrl) * 100 : 0;
      const isPos = profitBrl >= 0;

      const typeBadges = {
        crypto: '🪙 Cripto',
        fii: '🏢 FII',
        fiagro: '🌾 Fiagro',
        stock: '📈 Ação',
        bdr: '🇺🇸 BDR',
        fixed_income: '🏛️ Renda Fixa'
      };

      return `
        <tr>
          <td>
            <strong>${pos.symbol}</strong>
            <span class="badge" style="margin-left: 6px; font-size: 0.65rem;">${typeBadges[pos.type] || pos.type.toUpperCase()}</span>
          </td>
          <td class="mono">${pos.type === 'crypto' ? pos.qty.toFixed(4) : (pos.type === 'fixed_income' ? 'R$ ' + pos.qty.toFixed(2) : pos.qty.toFixed(0))}</td>
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
