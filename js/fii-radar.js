// Radar de Fundos Imobiliários (FIIs da B3) com métricas de P/VP, Dividend Yield e Calculadora Bola de Neve
class FiiRadar {
  constructor() {
    this.fiiList = [
      {
        ticker: 'MXRF11',
        name: 'Maxi Renda FII',
        segment: 'Papel (CRI)',
        price: 9.06,
        pvp: 0.93,
        dy12m: 12.8,
        lastDividend: 0.09,
        liquidity: 'R$ 11.2M/dia',
        description: 'O maior FII em número de cotistas da B3. Carteira diversificada de CRIs de boa qualidade.'
      },
      {
        ticker: 'HGLG11',
        name: 'CSHG Logística',
        segment: 'Tijolo (Logística)',
        price: 156.40,
        pvp: 0.97,
        dy12m: 8.9,
        lastDividend: 1.10,
        liquidity: 'R$ 6.8M/dia',
        description: 'Referência em galpões logísticos de alto padrão (A+) no eixo SP-RJ. Vacância historicamente baixa.'
      },
      {
        ticker: 'XPML11',
        name: 'XP Malls FII',
        segment: 'Tijolo (Shoppings)',
        price: 104.20,
        pvp: 0.94,
        dy12m: 9.6,
        lastDividend: 0.92,
        liquidity: 'R$ 9.4M/dia',
        description: 'Portfólio com participação em mais de 16 grandes shopping centers premium pelo Brasil.'
      },
      {
        ticker: 'BTLG11',
        name: 'BTG Pactual Logística',
        segment: 'Tijolo (Logística)',
        price: 99.80,
        pvp: 0.96,
        dy12m: 9.4,
        lastDividend: 0.78,
        liquidity: 'R$ 8.1M/dia',
        description: 'Galpões logísticos estratégicos com locatários de peso (Amazon, Mercado Livre, Ambev).'
      },
      {
        ticker: 'KNIP11',
        name: 'Kinea Índice de Preços',
        segment: 'Papel (CRI / IPCA+)',
        price: 91.50,
        pvp: 0.95,
        dy12m: 11.5,
        lastDividend: 0.85,
        liquidity: 'R$ 7.5M/dia',
        description: 'Gerido pela Kinea (Itaú). Carteira com foco em CRIs atrelados à inflação (IPCA + spread).'
      },
      {
        ticker: 'KNCR11',
        name: 'Kinea Rendimentos Imobiliários',
        segment: 'Papel (CRI / CDI+)',
        price: 103.10,
        pvp: 1.01,
        dy12m: 13.2,
        lastDividend: 1.12,
        liquidity: 'R$ 9.8M/dia',
        description: 'Focado em títulos indexados ao CDI. Excelente pagador com juros em patamares elevados.'
      },
      {
        ticker: 'VISC11',
        name: 'Vinci Shopping Centers',
        segment: 'Tijolo (Shoppings)',
        price: 112.50,
        pvp: 0.92,
        dy12m: 9.8,
        lastDividend: 0.95,
        liquidity: 'R$ 5.9M/dia',
        description: 'Presença diversificada em 24 shopping centers com alta taxa de ocupação.'
      },
      {
        ticker: 'CPTS11',
        name: 'Capitânia Securities II',
        segment: 'Papel (CRI)',
        price: 7.92,
        pvp: 0.91,
        dy12m: 12.9,
        lastDividend: 0.08,
        liquidity: 'R$ 6.3M/dia',
        description: 'Fundo de papel negociado na base 10 (cota acessível) com carteira de CRIs High Grade e originação própria.'
      },
      {
        ticker: 'TGAR11',
        name: 'TG Ativo Real',
        segment: 'Desenvolvimento / Urbano',
        price: 118.90,
        pvp: 0.94,
        dy12m: 13.8,
        lastDividend: 1.35,
        liquidity: 'R$ 4.2M/dia',
        description: 'Fundo focado em loteamentos e empreendimentos no interior do Brasil, proporcionando yield elevado.'
      },
      {
        ticker: 'VGIR11',
        name: 'Valora RE III',
        segment: 'Papel (CRI / CDI+)',
        price: 9.55,
        pvp: 0.97,
        dy12m: 13.4,
        lastDividend: 0.11,
        liquidity: 'R$ 4.9M/dia',
        description: 'Focado em operações estruturadas indexadas a CDI+, com excelente histórico de dividendos.'
      },
      {
        ticker: 'XPLG11',
        name: 'XP Log FII',
        segment: 'Tijolo (Logística)',
        price: 97.30,
        pvp: 0.89,
        dy12m: 9.2,
        lastDividend: 0.74,
        liquidity: 'R$ 5.1M/dia',
        description: 'Galpões logísticos classe A com forte presença em condomínios industriais em São Paulo e Rio.'
      },
      {
        ticker: 'TRXF11',
        name: 'TRX Real Estate',
        segment: 'Tijolo (Renda Urbana)',
        price: 102.80,
        pvp: 0.99,
        dy12m: 10.4,
        lastDividend: 0.90,
        liquidity: 'R$ 6.0M/dia',
        description: 'Imóveis alugados para gigantes do varejo (Pão de Açúcar, Assaí, Leroy Merlin) em contratos atípicos longos.'
      },
      {
        ticker: 'VILG11',
        name: 'Vinci Logística',
        segment: 'Tijolo (Logística)',
        price: 89.20,
        pvp: 0.82,
        dy12m: 9.5,
        lastDividend: 0.70,
        liquidity: 'R$ 3.8M/dia',
        description: 'Um dos maiores descontos patrimoniais (P/VP 0.82) em galpões logísticos consolidados.'
      },
      {
        ticker: 'KFOF11',
        name: 'Kinea FOF',
        segment: 'FOF (Fundo de Fundos)',
        price: 88.40,
        pvp: 0.88,
        dy12m: 10.8,
        lastDividend: 0.80,
        liquidity: 'R$ 2.4M/dia',
        description: 'Fundo que compra cotas de outros FIIs. Proporciona dupla camada de desconto patrimonial.'
      },
      {
        ticker: 'HGRU11',
        name: 'CSHG Renda Urbana',
        segment: 'Tijolo (Varejo / Educacional)',
        price: 122.10,
        pvp: 0.98,
        dy12m: 9.7,
        lastDividend: 0.98,
        liquidity: 'R$ 4.7M/dia',
        description: 'Imóveis voltados para supermercados e universidades renomadas, com fluxos de caixa previsíveis.'
      }
    ];

    this.currentFilter = 'all';
    this.searchQuery = '';
  }

  async init() {
    this.render();
    this.setupSnowballCalculator();
    this.updateLiveQuotes();
  }

  async updateLiveQuotes() {
    // Tenta atualizar cotações de alguns FIIs em lote via Yahoo Finance Query pública
    const topTickers = ['MXRF11.SA', 'HGLG11.SA', 'XPML11.SA', 'BTLG11.SA'];
    for (const sym of topTickers) {
      try {
        const res = await fetch(`https://query1.finance.yahoo.com/v8/finance/chart/${sym}?interval=1d&range=1d`);
        if (res.ok) {
          const data = await res.json();
          const meta = data.chart?.result?.[0]?.meta;
          if (meta && meta.regularMarketPrice) {
            const rawTicker = sym.replace('.SA', '');
            const fii = this.fiiList.find(f => f.ticker === rawTicker);
            if (fii) {
              fii.price = meta.regularMarketPrice;
            }
          }
        }
      } catch (e) {
        // silencioso para não poluir console
      }
    }
    this.render();
  }

  getOpportunities() {
    return this.fiiList.map(fii => {
      let score = 0;
      let tags = [];
      let thesis = '';

      const isDeepDiscount = fii.pvp <= 0.92;
      const isDiscount = fii.pvp < 1.00;
      const isHighYield = fii.dy12m >= 11.5;

      if (isDiscount && isHighYield) {
        score += 90;
        tags.push({ text: 'Oportunidade de Ouro 🌟', class: 'badge-yield' });
        thesis = `Combinação excelente de desconto patrimonial (P/VP ${fii.pvp.toFixed(2)}) com dividendos expressivos de ${fii.dy12m.toFixed(1)}% ao ano.`;
      } else if (isDeepDiscount) {
        score += 80;
        tags.push({ text: 'Super Desconto 💎', class: 'badge-discount' });
        thesis = `Negociando com ${(100 - (fii.pvp * 100)).toFixed(0)}% de desconto sobre o valor real do patrimônio líquido do fundo.`;
      } else if (isHighYield) {
        score += 75;
        tags.push({ text: 'Alto Dividend Yield 💰', class: 'badge-yield' });
        thesis = `Dividendos de ${fii.dy12m.toFixed(1)}% a.a., superando amplamente o CDI e a poupança com isenção de IR nos rendimentos.`;
      } else {
        score += 50;
        tags.push({ text: 'Preço Justo ⚖️', class: 'badge-breakout' });
        thesis = `Ativo de alta qualidade e liquidez com rentabilidade e valuation equilibrados.`;
      }

      return {
        ...fii,
        score,
        tags,
        thesis
      };
    }).sort((a, b) => b.score - a.score);
  }

  render() {
    this.renderOpportunities();
    this.renderFiiTable();
    this.populateFiiSelect();
  }

  renderOpportunities() {
    const container = document.getElementById('fii-opportunities-container');
    if (!container) return;

    const opps = this.getOpportunities().slice(0, 6);

    container.innerHTML = opps.map(fii => {
      const isGold = fii.score >= 85;
      return `
        <div class="opportunity-card ${isGold ? 'gold-opportunity' : ''}">
          <div>
            <div class="card-top">
              <div class="asset-identity">
                <div class="asset-icon" style="color: #ffb800; border-color: rgba(255, 184, 0, 0.2);">
                  🏢
                </div>
                <div class="asset-names">
                  <h3>${fii.ticker}</h3>
                  <span>${fii.name} • ${fii.segment}</span>
                </div>
              </div>
              <div class="tags-cluster">
                ${fii.tags.map(t => `<span class="badge ${t.class}">${t.text}</span>`).join('')}
              </div>
            </div>

            <div class="price-row">
              <div class="price-main">R$ ${fii.price.toFixed(2)}</div>
              <div class="price-change positive">
                DY 12M: ${fii.dy12m.toFixed(1)}%
              </div>
            </div>

            <div class="metrics-grid">
              <div class="metric-item">
                <span class="label">P/VP (Patrimônio)</span>
                <span class="value" style="color: ${fii.pvp < 1 ? 'var(--accent-green)' : 'var(--text-main)'}">
                  ${fii.pvp.toFixed(2)} ${fii.pvp < 1 ? `(${(100 - fii.pvp * 100).toFixed(0)}% desc.)` : ''}
                </span>
              </div>
              <div class="metric-item">
                <span class="label">Último Rendimento</span>
                <span class="value">R$ ${fii.lastDividend.toFixed(2)} / cota</span>
              </div>
            </div>

            <div class="thesis-note ${isGold ? 'alert-gold' : ''}">
              <strong>Tese do Garimpo:</strong> ${fii.thesis}
            </div>
          </div>

          <div class="card-actions">
            <button class="btn btn-primary btn-sm" onclick="window.app.openTradeModal('${fii.ticker}', 'fii', ${fii.price})">
              Simular Compra
            </button>
            <button class="btn btn-outline btn-sm" onclick="window.app.fiiRadar.selectForCalculator('${fii.ticker}')">
              Calcular Renda 🧮
            </button>
          </div>
        </div>
      `;
    }).join('');
  }

  renderFiiTable() {
    const tbody = document.getElementById('fii-table-body');
    if (!tbody) return;

    let items = [...this.fiiList];

    if (this.searchQuery) {
      const q = this.searchQuery.toUpperCase();
      items = items.filter(f => f.ticker.includes(q) || f.name.toUpperCase().includes(q) || f.segment.toUpperCase().includes(q));
    }

    if (this.currentFilter === 'pvp') {
      items = items.sort((a, b) => a.pvp - b.pvp); // Mais barato primeiro
    } else if (this.currentFilter === 'dy') {
      items = items.sort((a, b) => b.dy12m - a.dy12m); // Maior dividendo primeiro
    } else if (this.currentFilter === 'tijolo') {
      items = items.filter(f => f.segment.includes('Tijolo'));
    } else if (this.currentFilter === 'papel') {
      items = items.filter(f => f.segment.includes('Papel'));
    }

    tbody.innerHTML = items.map((fii, idx) => {
      const pvpClass = fii.pvp < 0.95 ? 'color: var(--accent-green); font-weight: 700;' : (fii.pvp > 1.05 ? 'color: var(--accent-red);' : '');
      return `
        <tr>
          <td style="color: var(--text-dim); font-size: 0.78rem;">#${idx + 1}</td>
          <td>
            <strong style="color: var(--accent-blue); font-size: 0.95rem; font-family: var(--font-mono);">${fii.ticker}</strong>
            <div style="font-size: 0.78rem; color: var(--text-muted);">${fii.name}</div>
          </td>
          <td><span class="badge" style="background: rgba(255,255,255,0.06);">${fii.segment}</span></td>
          <td class="mono" style="font-weight: 700;">R$ ${fii.price.toFixed(2)}</td>
          <td class="mono" style="${pvpClass}">${fii.pvp.toFixed(2)}</td>
          <td class="mono" style="color: var(--accent-green); font-weight: 700;">${fii.dy12m.toFixed(1)}%</td>
          <td class="mono">R$ ${fii.lastDividend.toFixed(2)}</td>
          <td style="color: var(--text-muted); font-size: 0.8rem;">${fii.liquidity}</td>
          <td>
            <button class="btn btn-outline btn-sm" onclick="window.app.openTradeModal('${fii.ticker}', 'fii', ${fii.price})">
              Investir
            </button>
          </td>
        </tr>
      `;
    }).join('');
  }

  populateFiiSelect() {
    const select = document.getElementById('calc-fii-select');
    if (!select) return;

    const currentVal = select.value;
    select.innerHTML = this.fiiList.map(f => `
      <option value="${f.ticker}">${f.ticker} - ${f.name} (R$ ${f.price.toFixed(2)})</option>
    `).join('');

    if (currentVal) select.value = currentVal;
  }

  setupSnowballCalculator() {
    const inputAmount = document.getElementById('calc-invest-amount');
    const selectFii = document.getElementById('calc-fii-select');

    const updateCalc = () => {
      const amount = parseFloat(inputAmount?.value) || 0;
      const ticker = selectFii?.value;
      const fii = this.fiiList.find(f => f.ticker === ticker) || this.fiiList[0];

      if (!fii) return;

      const numShares = Math.floor(amount / fii.price);
      const monthlyIncome = numShares * fii.lastDividend;
      const annualIncome = monthlyIncome * 12;

      // Efeito Bola de Neve: Quantas cotas são necessárias para comprar 1 cota por mês apenas com os dividendos?
      const sharesForFreeShare = Math.ceil(fii.price / fii.lastDividend);
      const capitalForSnowball = sharesForFreeShare * fii.price;
      const isSnowballAchieved = numShares >= sharesForFreeShare;

      document.getElementById('calc-shares-count').textContent = numShares.toLocaleString('pt-BR') + ' cotas';
      document.getElementById('calc-monthly-income').textContent = 'R$ ' + monthlyIncome.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
      document.getElementById('calc-annual-income').textContent = 'R$ ' + annualIncome.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
      
      const snowballDisplay = document.getElementById('calc-snowball-status');
      if (snowballDisplay) {
        if (isSnowballAchieved) {
          snowballDisplay.innerHTML = `
            <span style="color: var(--accent-green); font-weight: 700;">
              🎉 Bola de Neve Atingida! Seus dividendos já compram ${(monthlyIncome / fii.price).toFixed(1)} novas cotas todo mês sozinhos!
            </span>
          `;
        } else {
          const needed = sharesForFreeShare - numShares;
          snowballDisplay.innerHTML = `
            <span>Faltam <strong>${needed} cotas</strong> (R$ ${(needed * fii.price).toFixed(2)}) para o fundo se pagar e comprar 1 cota sozinho todo mês.</span>
          `;
        }
      }
    };

    inputAmount?.addEventListener('input', updateCalc);
    selectFii?.addEventListener('change', updateCalc);
    updateCalc();
  }

  selectForCalculator(ticker) {
    const select = document.getElementById('calc-fii-select');
    if (select) {
      select.value = ticker;
      select.dispatchEvent(new Event('change'));
      document.getElementById('snowball-section')?.scrollIntoView({ behavior: 'smooth' });
    }
  }

  setFilter(filter) {
    this.currentFilter = filter;
    this.renderFiiTable();
  }

  setSearch(q) {
    this.searchQuery = q;
    this.renderFiiTable();
  }
}

window.FiiRadar = FiiRadar;
