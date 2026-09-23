// Gerenciador do Dashboard Executivo e Gráficos Interativos (TradingView & Chart.js)
class DashboardCharts {
  constructor() {
    this.portfolioChart = null;
    this.yieldComparisonChart = null;
    this.snowballGrowthChart = null;
    this.currentSymbol = 'BINANCE:BTCUSDT';
  }

  init() {
    this.initTradingViewWidget(this.currentSymbol);
    this.initChartJsAnalytics();
    this.setupAssetSwitcher();
  }

  initTradingViewWidget(symbol) {
    const container = document.getElementById('tradingview-widget-container');
    if (!container) return;

    this.currentSymbol = symbol;

    // Constrói o widget oficial do TradingView em iframe responsivo e moderno (Dark Theme)
    const tvUrl = new URL('https://s.tradingview.com/widgetembed/');
    tvUrl.searchParams.set('frameElementId', 'tradingview_widget');
    tvUrl.searchParams.set('symbol', symbol);
    tvUrl.searchParams.set('interval', 'D');
    tvUrl.searchParams.set('hidesidetoolbar', '0');
    tvUrl.searchParams.set('symboledit', '1');
    tvUrl.searchParams.set('saveimage', '1');
    tvUrl.searchParams.set('toolbarbg', 'rgba(16, 23, 38, 1)');
    tvUrl.searchParams.set('theme', 'dark');
    tvUrl.searchParams.set('style', '1'); // Velas (Candlesticks)
    tvUrl.searchParams.set('timezone', 'America/Sao_Paulo');
    tvUrl.searchParams.set('locale', 'br');

    container.innerHTML = `
      <iframe
        id="tradingview_iframe"
        src="${tvUrl.toString()}"
        style="width: 100%; height: 500px; border: none; border-radius: 12px; background: #0a0e17;"
        allowtransparency="true"
        frameborder="0">
      </iframe>
    `;
  }

  setupAssetSwitcher() {
    const buttons = document.querySelectorAll('.tv-asset-btn');
    buttons.forEach(btn => {
      btn.addEventListener('click', () => {
        buttons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const symbol = btn.getAttribute('data-symbol');
        this.initTradingViewWidget(symbol);
      });
    });
  }

  switchSymbol(symbol) {
    this.initTradingViewWidget(symbol);
    const chartTabBtn = document.querySelector('[data-tab="tab-dashboard"]');
    if (chartTabBtn) chartTabBtn.click();
    document.getElementById('tv-chart-wrapper')?.scrollIntoView({ behavior: 'smooth' });
  }

  initChartJsAnalytics() {
    if (typeof Chart === 'undefined') return;

    // Configuração de cores padrão escuras
    Chart.defaults.color = '#8ba0c2';
    Chart.defaults.font.family = "'Inter', sans-serif";

    this.renderPortfolioDonut();
    this.renderYieldComparisonBar();
    this.renderSnowballGrowthCurve();
  }

  renderPortfolioDonut() {
    const ctx = document.getElementById('chart-portfolio-donut');
    if (!ctx) return;

    const sim = window.app.simulator;
    const p = sim.getCurrentPortfolioValue();

    const data = [
      p.cash,
      p.allocation.crypto || 0,
      (p.allocation.fii || 0) + (p.allocation.fiagro || 0),
      p.allocation.stock || 0,
      p.allocation.bdr || 0,
      p.allocation.fixed_income || 0
    ];

    if (this.portfolioChart) {
      this.portfolioChart.data.datasets[0].data = data;
      this.portfolioChart.update();
      return;
    }

    this.portfolioChart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Caixa Disponível', 'Criptomoedas', 'FIIs & Fiagros', 'Ações B3', 'BDRs EUA', 'Renda Fixa'],
        datasets: [{
          data: data,
          backgroundColor: [
            '#00d2ff', // Azul Caixa
            '#00f59b', // Verde Cripto
            '#ffb800', // Âmbar FIIs
            '#9d4edd', // Roxo Ações
            '#ff4d6d', // Vermelho BDRs
            '#48cae4'  // Ciano Renda Fixa
          ],
          borderWidth: 2,
          borderColor: '#101726'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: { boxWidth: 12, padding: 14 }
          },
          tooltip: {
            callbacks: {
              label: (ctx) => {
                const val = ctx.raw || 0;
                const total = ctx.dataset.data.reduce((a, b) => a + b, 0);
                const pct = total > 0 ? ((val / total) * 100).toFixed(1) : 0;
                return ` ${ctx.label}: R$ ${val.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} (${pct}%)`;
              }
            }
          }
        },
        cutout: '70%'
      }
    });
  }

  renderYieldComparisonBar() {
    const ctx = document.getElementById('chart-yield-comparison');
    if (!ctx) return;

    if (this.yieldComparisonChart) return;

    this.yieldComparisonChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['RZAG11 (Agro)', 'VGIA11 (Agro)', 'PETR4 (Ação)', 'MXRF11 (FII)', 'TGAR11 (FII)', 'Tesouro IPCA+', 'Selic / CDI', 'Poupança'],
        datasets: [{
          label: 'Dividend Yield / Rendimento Anual (%)',
          data: [15.4, 14.8, 13.8, 12.8, 13.8, 10.5, 10.4, 6.17],
          backgroundColor: [
            'rgba(255, 184, 0, 0.85)',
            'rgba(255, 184, 0, 0.85)',
            'rgba(157, 78, 221, 0.85)',
            'rgba(0, 245, 155, 0.85)',
            'rgba(0, 245, 155, 0.85)',
            'rgba(0, 210, 255, 0.85)',
            'rgba(72, 202, 228, 0.85)',
            'rgba(255, 77, 109, 0.85)'
          ],
          borderRadius: 6,
          borderWidth: 1,
          borderColor: 'rgba(255, 255, 255, 0.1)'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (ctx) => ` Rendimento: ${ctx.raw}% ao ano`
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            grid: { color: 'rgba(255, 255, 255, 0.05)' },
            ticks: {
              callback: (val) => val + '%'
            }
          },
          x: {
            grid: { display: false }
          }
        }
      }
    });
  }

  renderSnowballGrowthCurve() {
    const ctx = document.getElementById('chart-snowball-growth');
    if (!ctx) return;

    if (this.snowballGrowthChart) return;

    // Simulação de R$ 10.000 iniciais + R$ 500/mês reinvestindo proventos a 12% a.a. ao longo de 5 anos
    const labels = ['Início', 'Ano 1', 'Ano 2', 'Ano 3', 'Ano 4', 'Ano 5'];
    const reinvestingData = [10000, 17800, 27300, 38700, 52300, 68600]; // Com juros compostos
    const withoutReinvest = [10000, 16000, 22000, 28000, 34000, 40000]; // Apenas o dinheiro do bolso

    this.snowballGrowthChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'Com Bola de Neve (Dividendos Reinvestidos)',
            data: reinvestingData,
            borderColor: '#00f59b',
            backgroundColor: 'rgba(0, 245, 155, 0.1)',
            fill: true,
            tension: 0.35,
            borderWidth: 3,
            pointBackgroundColor: '#00f59b',
            pointRadius: 4
          },
          {
            label: 'Apenas Dinheiro Aportado do Bolso',
            data: withoutReinvest,
            borderColor: '#8ba0c2',
            borderDash: [5, 5],
            fill: false,
            tension: 0.1,
            borderWidth: 2,
            pointRadius: 3
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'bottom' },
          tooltip: {
            callbacks: {
              label: (ctx) => ` ${ctx.dataset.label}: R$ ${ctx.raw.toLocaleString('pt-BR')}`
            }
          }
        },
        scales: {
          y: {
            grid: { color: 'rgba(255, 255, 255, 0.05)' },
            ticks: {
              callback: (val) => 'R$ ' + (val / 1000).toFixed(0) + 'k'
            }
          },
          x: {
            grid: { display: false }
          }
        }
      }
    });
  }

  updatePortfolioChart() {
    this.renderPortfolioDonut();
  }
}

window.DashboardCharts = DashboardCharts;
