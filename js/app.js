// Orquestrador Principal do Radar Alpha Multiativos
class App {
  constructor() {
    this.cryptoRadar = new CryptoRadar();
    this.fiiRadar = new FiiRadar();
    this.stocksRadar = new StocksRadar();
    this.fixedIncome = new FixedIncomeRadar();
    this.simulator = new PortfolioSimulator();
    this.activeTradeModal = null;
  }

  async init() {
    this.setupTabs();
    this.setupModals();
    this.setupGlobalSearch();

    // Inicializar os radares
    await this.cryptoRadar.init();
    await this.fiiRadar.init();
    this.stocksRadar.init();
    this.fixedIncome.init();
    this.simulator.updateUI();

    // Loop periódico para manter carteira sincronizada
    setInterval(() => {
      this.simulator.updateUI();
    }, 4000);

    // Atualizar cards de oportunidades de tempos em tempos
    setInterval(() => {
      this.cryptoRadar.renderOpportunities();
    }, 6000);
  }

  setupTabs() {
    const tabBtns = document.querySelectorAll('.tab-btn');
    tabBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const targetTab = btn.getAttribute('data-tab');

        tabBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        document.querySelectorAll('.tab-pane').forEach(pane => {
          pane.classList.remove('active');
        });

        const activePane = document.getElementById(targetTab);
        if (activePane) {
          activePane.classList.add('active');
        }

        if (targetTab === 'tab-simulator') {
          this.simulator.updateUI();
        }
      });
    });
  }

  setGlobalSignalFilter(filter, buttonElement) {
    if (buttonElement) {
      const parent = buttonElement.parentElement;
      parent.querySelectorAll('.filter-tag').forEach(b => b.classList.remove('active'));
      buttonElement.classList.add('active');
    }
    this.cryptoRadar.setSignalFilter(filter);
    this.fiiRadar.setSignalFilter(filter);
    this.stocksRadar.setSignalFilter(filter);
  }

  setupGlobalSearch() {
    const cryptoSearch = document.getElementById('crypto-search-input');
    cryptoSearch?.addEventListener('input', (e) => {
      this.cryptoRadar.setSearch(e.target.value);
    });

    const fiiSearch = document.getElementById('fii-search-input');
    fiiSearch?.addEventListener('input', (e) => {
      this.fiiRadar.setSearch(e.target.value);
    });

    const stockSearch = document.getElementById('stock-search-input');
    stockSearch?.addEventListener('input', (e) => {
      this.stocksRadar.setSearch(e.target.value);
    });
  }

  setupModals() {
    const modalOverlay = document.getElementById('trade-modal-overlay');
    const closeBtn = document.getElementById('modal-close-btn');

    closeBtn?.addEventListener('click', () => {
      modalOverlay.classList.remove('open');
    });

    modalOverlay?.addEventListener('click', (e) => {
      if (e.target === modalOverlay) {
        modalOverlay.classList.remove('open');
      }
    });

    const tradeForm = document.getElementById('trade-form');
    tradeForm?.addEventListener('submit', (e) => {
      e.preventDefault();
      if (!this.activeTradeModal) return;

      const { symbol, type, price } = this.activeTradeModal;
      const amountInput = document.getElementById('trade-amount-input');
      const amountBrl = parseFloat(amountInput.value);

      const success = this.simulator.buy(symbol, type, price, amountBrl);
      if (success) {
        modalOverlay.classList.remove('open');
      }
    });
  }

  openTradeModal(symbol, type, currentPrice) {
    this.activeTradeModal = { symbol, type, price: currentPrice };
    const modalOverlay = document.getElementById('trade-modal-overlay');
    const modalTitle = document.getElementById('modal-title');
    const modalAsset = document.getElementById('modal-asset-info');
    const modalCash = document.getElementById('modal-available-cash');
    const amountInput = document.getElementById('trade-amount-input');

    modalTitle.textContent = `Simular Compra de ${symbol}`;
    
    let priceText = '';
    if (type === 'crypto') {
      const priceBrl = currentPrice * this.simulator.usdToBrl;
      priceText = `Preço atual: $${this.cryptoRadar.formatPrice(currentPrice)} (aprox. R$ ${priceBrl.toFixed(2)})`;
      amountInput.placeholder = 'Ex: 1000 (em R$)';
      amountInput.value = '1000';
    } else if (type === 'fixed_income') {
      priceText = `Aplicação em Renda Fixa: ${symbol}`;
      amountInput.placeholder = 'Ex: 5000 (em R$)';
      amountInput.value = '5000';
    } else {
      priceText = `Cotação atual: R$ ${currentPrice.toFixed(2)} por unidade`;
      amountInput.placeholder = `Ex: ${(currentPrice * 10).toFixed(2)} (para 10 cotas/ações)`;
      amountInput.value = (currentPrice * 10).toFixed(2);
    }

    modalAsset.innerHTML = `
      <div style="font-size: 0.9rem; color: var(--accent-blue); margin-bottom: 6px;">
        ${priceText}
      </div>
    `;

    modalCash.textContent = `R$ ${this.simulator.state.cash.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;

    modalOverlay.classList.add('open');
    amountInput.focus();
  }

  openSellModal(symbol, maxQty) {
    const pos = this.simulator.state.positions[symbol];
    if (!pos) return;

    const qtyPrompt = pos.type === 'crypto' ? pos.qty.toFixed(4) : (pos.type === 'fixed_income' ? pos.qty.toFixed(2) : pos.qty);
    const qtyToSellStr = prompt(`Quantas unidades/valor de ${symbol} deseja vender? (Você possui: ${qtyPrompt})`, qtyPrompt);
    if (!qtyToSellStr) return;

    const qtyToSell = parseFloat(qtyToSellStr);
    if (isNaN(qtyToSell) || qtyToSell <= 0) {
      this.showToast('Quantidade inválida.', 'error');
      return;
    }

    this.simulator.sell(symbol, qtyToSell);
  }

  showToast(message, type = 'success') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast ${type === 'error' ? 'toast-error' : ''}`;
    toast.innerHTML = `
      <span>${type === 'error' ? '⚠️' : '✅'}</span>
      <span>${message}</span>
    `;

    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 3500);
  }
}

// Inicialização Global
window.addEventListener('DOMContentLoaded', () => {
  window.app = new App();
  window.app.init();
});
