// Radar de Ações da B3 (Dividendos e Valor) e BDRs Internacionais (EUA)
class StocksRadar {
  constructor() {
    this.stocksList = [
      // Ações Brasileiras (B3)
      {
        ticker: 'BBAS3',
        name: 'Banco do Brasil',
        sector: 'Financeiro / Bancos',
        type: 'stock',
        price: 27.80,
        pl: 4.4,
        pvp: 0.79,
        dy: 9.6,
        roe: 21.2,
        grahamPrice: 38.50, // Preço Teto de Benjamin Graham
        bazinPrice: 32.00,  // Preço Teto Décio Bazin (6% yield)
        description: 'Banco mais antigo do Brasil, líder no agronegócio com lucros recordes e valuation extremamente descontado.'
      },
      {
        ticker: 'PETR4',
        name: 'Petrobras PN',
        sector: 'Petróleo & Gás',
        type: 'stock',
        price: 36.90,
        pl: 4.2,
        pvp: 0.94,
        dy: 13.8,
        roe: 23.5,
        grahamPrice: 52.10,
        bazinPrice: 42.50,
        description: 'Gigante integrada de energia com baixo custo de extração no Pré-Sal e altíssimo fluxo de dividendos.'
      },
      {
        ticker: 'VALE3',
        name: 'Vale',
        sector: 'Mineração & Siderurgia',
        type: 'stock',
        price: 57.20,
        pl: 5.9,
        pvp: 1.12,
        dy: 8.5,
        roe: 19.8,
        grahamPrice: 74.00,
        bazinPrice: 65.00,
        description: 'Uma das maiores produtoras globais de minério de ferro de alta pureza. Receita 100% dolarizada.'
      },
      {
        ticker: 'TAEE11',
        name: 'Taesa',
        sector: 'Energia Elétrica / Transmissão',
        type: 'stock',
        price: 34.80,
        pl: 8.2,
        pvp: 1.60,
        dy: 9.7,
        roe: 19.5,
        grahamPrice: 36.20,
        bazinPrice: 38.00,
        description: 'Transmissão de energia pura com receitas ajustadas pela inflação (IPCA/IGP-M) e contratos de 30 anos.'
      },
      {
        ticker: 'ITUB4',
        name: 'Itaú Unibanco',
        sector: 'Financeiro / Bancos',
        type: 'stock',
        price: 35.10,
        pl: 7.9,
        pvp: 1.48,
        dy: 7.4,
        roe: 21.0,
        grahamPrice: 37.80,
        bazinPrice: 36.50,
        description: 'O maior banco privado da América Latina, reconhecido pela consistência histórica e rentabilidade resiliente.'
      },
      {
        ticker: 'CPFE3',
        name: 'CPFL Energia',
        sector: 'Energia Elétrica',
        type: 'stock',
        price: 33.60,
        pl: 7.1,
        pvp: 1.82,
        dy: 10.8,
        roe: 25.4,
        grahamPrice: 35.00,
        bazinPrice: 38.50,
        description: 'Empresa integrada de geração e distribuição de energia com excelente histórico de proventos e gestão controlada pela State Grid.'
      },
      {
        ticker: 'SAPR11',
        name: 'Sanepar',
        sector: 'Saneamento Básico',
        type: 'stock',
        price: 26.50,
        pl: 5.1,
        pvp: 0.69,
        dy: 7.8,
        roe: 14.2,
        grahamPrice: 41.20,
        bazinPrice: 31.00,
        description: 'Monopólio de saneamento no estado do Paraná com valuation historicamente amassado (P/VP 0.69).'
      },
      {
        ticker: 'WEGE3',
        name: 'WEG',
        sector: 'Bens Industriais / Motores',
        type: 'stock',
        price: 52.40,
        pl: 29.2,
        pvp: 7.90,
        dy: 1.7,
        roe: 31.5,
        grahamPrice: 22.00,
        bazinPrice: 15.00,
        description: 'Multinacional brasileira de excelência global em motores e transição energética. Foco em crescimento de lucros contínuo.'
      },

      // BDRs (Ações Americanas na B3) & ETFs Globais
      {
        ticker: 'NVDC34',
        name: 'Nvidia Corp (BDR)',
        sector: 'Tecnologia / Inteligência Artificial',
        type: 'bdr',
        price: 13.90,
        pl: 38.5,
        pvp: 18.2,
        dy: 0.2,
        roe: 65.0,
        grahamPrice: 0,
        bazinPrice: 0,
        description: 'Líder absoluta mundial em processadores gráficos (GPUs) e chips de inteligência artificial generativa.'
      },
      {
        ticker: 'AAPL34',
        name: 'Apple Inc (BDR)',
        sector: 'Tecnologia / Hardware & Serviços',
        type: 'bdr',
        price: 64.20,
        pl: 32.0,
        pvp: 45.0,
        dy: 0.6,
        roe: 145.0,
        grahamPrice: 0,
        bazinPrice: 0,
        description: 'O ecossistema de consumo mais valioso do planeta (iPhone, Mac, Apple Services), com geração de caixa gigantesca.'
      },
      {
        ticker: 'MSFT34',
        name: 'Microsoft Corp (BDR)',
        sector: 'Tecnologia / Software & Nuvem',
        type: 'bdr',
        price: 84.50,
        pl: 31.5,
        pvp: 11.2,
        dy: 0.8,
        roe: 38.0,
        grahamPrice: 0,
        bazinPrice: 0,
        description: 'Pilar da computação empresarial global com Azure Cloud, Windows, Office e parceria estratégica com OpenAI.'
      },
      {
        ticker: 'IVVB11',
        name: 'iShares S&P 500 ETF',
        sector: 'Índice Americano (S&P 500)',
        type: 'bdr',
        price: 345.00,
        pl: 24.0,
        pvp: 4.5,
        dy: 1.2,
        roe: 18.0,
        grahamPrice: 0,
        bazinPrice: 0,
        description: 'Dolarização automática: reúne as 500 maiores e mais lucrativas empresas dos Estados Unidos em uma única cota na B3.'
      }
    ];

    this.currentFilter = 'all'; // 'all', 'buy', 'sell'
    this.tableFilter = 'all';  // 'all', 'stocks', 'bdrs', 'dividends'
    this.searchQuery = '';
  }

  init() {
    this.render();
  }

  getOpportunities() {
    return this.stocksList.map(stock => {
      let score = 0;
      let tags = [];
      let thesis = '';
      let signalType = 'buy';

      const isBdr = stock.type === 'bdr';
      const isGrahamDiscount = stock.grahamPrice > 0 && stock.price < stock.grahamPrice * 0.80; // 20% de margem de segurança
      const isBazinDiscount = stock.bazinPrice > 0 && stock.price < stock.bazinPrice;
      const isHighDY = stock.dy >= 8.5;
      const isOverpriced = stock.pl >= 28.0;

      if (isOverpriced && !isBdr && stock.dy < 3.0) {
        signalType = 'sell';
        score = 80;
        tags.push({ text: '🔴 ALERTA DE VALUATION CARO', class: 'badge-signal-sell' });
        tags.push({ text: `P/L Elevado (${stock.pl.toFixed(1)}x) ⚠️`, class: 'badge-spike' });
        thesis = `Negociando a múltiplos altos (${stock.pl.toFixed(1)}x lucros). Para investidores focados em dividendos, há risco de correção ou custo de oportunidade frente a ativos com DY maior.`;
      } else if (isGrahamDiscount && isHighDY) {
        signalType = 'buy';
        score = 94;
        tags.push({ text: '🟢 SINAL DE COMPRA FORTE', class: 'badge-signal-buy' });
        tags.push({ text: 'Graham & Bazin 👑', class: 'badge-yield' });
        thesis = `Cotação com margem de segurança de ${(((stock.grahamPrice - stock.price) / stock.grahamPrice) * 100).toFixed(0)}% frente ao Preço Teto de Graham (R$ ${stock.grahamPrice.toFixed(2)}) e dividendos de ${stock.dy.toFixed(1)}% ao ano.`;
      } else if (isHighDY) {
        signalType = 'buy';
        score = 88;
        tags.push({ text: '🟢 Vaca Leiteira (Dividendos)', class: 'badge-signal-buy' });
        tags.push({ text: `DY ${stock.dy.toFixed(1)}% a.a. 💰`, class: 'badge-discount' });
        thesis = `Fluxo de proventos massivo aos acionistas, superando a taxa básica de juros e com forte geração de caixa operacional.`;
      } else if (isBdr) {
        signalType = 'buy';
        score = 82;
        tags.push({ text: '🟢 Dolarização / Global', class: 'badge-signal-buy' });
        tags.push({ text: 'Líder Mundial 🇺🇸', class: 'badge-breakout' });
        thesis = `Ativo de proteção em moeda forte (Dólar) com liderança tecnológica global inabalável.`;
      } else {
        signalType = 'buy';
        score = 60;
        tags.push({ text: 'Qualidade & Valor ⚖️', class: 'badge-breakout' });
        thesis = `Empresa sólida para diversificação de portfólio de longo prazo.`;
      }

      return {
        ...stock,
        signalType,
        score,
        tags,
        thesis
      };
    }).sort((a, b) => b.score - a.score);
  }

  render() {
    this.renderOpportunities();
    this.renderStocksTable();
  }

  renderOpportunities() {
    const container = document.getElementById('stocks-opportunities-container');
    if (!container) return;

    let opps = this.getOpportunities();

    if (this.currentFilter === 'buy') {
      opps = opps.filter(o => o.signalType === 'buy');
    } else if (this.currentFilter === 'sell') {
      opps = opps.filter(o => o.signalType === 'sell');
    }

    container.innerHTML = opps.slice(0, 6).map(stock => {
      const isSell = stock.signalType === 'sell';
      const statusInvestUrl = `https://statusinvest.com.br/acoes/${stock.ticker.toLowerCase()}`;

      return `
        <div class="opportunity-card ${isSell ? 'signal-sell' : 'signal-buy'}">
          <div>
            <div class="card-top">
              <div class="asset-identity">
                <div class="asset-icon" style="color: ${isSell ? '#ff4d6d' : '#00d2ff'}; border-color: rgba(0, 210, 255, 0.2);">
                  ${stock.type === 'bdr' ? '🇺🇸' : '📈'}
                </div>
                <div class="asset-names">
                  <h3>${stock.ticker}</h3>
                  <span>${stock.name} • ${stock.sector}</span>
                </div>
              </div>
              <div class="tags-cluster" style="display: flex; flex-direction: column; align-items: flex-end; gap: 4px;">
                ${stock.tags.map(t => `<span class="badge ${t.class}">${t.text}</span>`).join('')}
              </div>
            </div>

            <div class="price-row">
              <div class="price-main">R$ ${stock.price.toFixed(2)}</div>
              <div class="price-change ${isSell ? 'negative' : 'positive'}">
                ${stock.type === 'bdr' ? 'BDR Global' : `DY: ${stock.dy.toFixed(1)}% a.a.`}
              </div>
            </div>

            <div class="metrics-grid">
              <div class="metric-item">
                <span class="label">P/L (Múltiplo de Lucro)</span>
                <span class="value">${stock.pl.toFixed(1)}x</span>
              </div>
              <div class="metric-item">
                <span class="label">${stock.grahamPrice > 0 ? 'Preço Teto Graham' : 'ROE (Rentabilidade)'}</span>
                <span class="value" style="color: var(--accent-green);">
                  ${stock.grahamPrice > 0 ? `R$ ${stock.grahamPrice.toFixed(2)}` : `${stock.roe.toFixed(1)}%`}
                </span>
              </div>
            </div>

            <div class="thesis-note ${isSell ? 'alert-sell' : ''}">
              <strong>${isSell ? '⚠️ Alerta de Risco:' : '💡 Tese do Garimpo:'}</strong> ${stock.thesis}
            </div>
          </div>

          <div class="card-actions">
            <a href="${statusInvestUrl}" target="_blank" rel="noopener" class="btn ${isSell ? 'btn-danger' : 'btn-broker'} btn-sm">
              🛒 Ir para Compra (Status Invest) ↗
            </a>
            <button class="btn btn-outline btn-sm" onclick="window.app.openTradeModal('${stock.ticker}', '${stock.type}', ${stock.price})">
              💼 Simular
            </button>
          </div>
        </div>
      `;
    }).join('');
  }

  renderStocksTable() {
    const tbody = document.getElementById('stocks-table-body');
    if (!tbody) return;

    let items = [...this.stocksList];

    if (this.searchQuery) {
      const q = this.searchQuery.toUpperCase();
      items = items.filter(s => s.ticker.includes(q) || s.name.toUpperCase().includes(q) || s.sector.toUpperCase().includes(q));
    }

    if (this.tableFilter === 'stocks') {
      items = items.filter(s => s.type === 'stock');
    } else if (this.tableFilter === 'bdrs') {
      items = items.filter(s => s.type === 'bdr');
    } else if (this.tableFilter === 'dividends') {
      items = items.sort((a, b) => b.dy - a.dy);
    } else if (this.tableFilter === 'pl') {
      items = items.sort((a, b) => a.pl - b.pl);
    }

    tbody.innerHTML = items.map((stock, idx) => {
      const statusInvestUrl = `https://statusinvest.com.br/${stock.type === 'bdr' ? 'bdrs' : 'acoes'}/${stock.ticker.toLowerCase()}`;
      return `
        <tr>
          <td style="color: var(--text-dim); font-size: 0.78rem;">#${idx + 1}</td>
          <td>
            <strong style="color: var(--accent-blue); font-size: 0.95rem; font-family: var(--font-mono);">${stock.ticker}</strong>
            <div style="font-size: 0.78rem; color: var(--text-muted);">${stock.name}</div>
          </td>
          <td><span class="badge" style="background: rgba(255,255,255,0.06);">${stock.sector}</span></td>
          <td class="mono" style="font-weight: 700;">R$ ${stock.price.toFixed(2)}</td>
          <td class="mono">${stock.pl.toFixed(1)}x</td>
          <td class="mono">${stock.pvp.toFixed(2)}</td>
          <td class="mono" style="color: var(--accent-green); font-weight: 700;">${stock.dy > 0 ? stock.dy.toFixed(1) + '%' : '-'}</td>
          <td class="mono">${stock.roe.toFixed(1)}%</td>
          <td>
            <div style="display: flex; gap: 6px;">
              <a href="${statusInvestUrl}" target="_blank" rel="noopener" class="btn btn-broker btn-sm">
                🛒 Negociar
              </a>
              <button class="btn btn-outline btn-sm" onclick="window.app.openTradeModal('${stock.ticker}', '${stock.type}', ${stock.price})">
                💼 Simular
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join('');
  }

  setSignalFilter(filter) {
    this.currentFilter = filter;
    this.renderOpportunities();
  }

  setTableFilter(filter) {
    this.tableFilter = filter;
    this.renderStocksTable();
  }

  setSearch(q) {
    this.searchQuery = q;
    this.renderStocksTable();
  }
}

window.StocksRadar = StocksRadar;
