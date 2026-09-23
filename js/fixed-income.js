// Módulo de Renda Fixa, Tesouro Direto e Simulador Comparativo de Juros Compostos
class FixedIncomeRadar {
  constructor() {
    this.rates = {
      selic: 10.50,
      cdi: 10.40,
      ipca: 4.10,
      poupanca: 6.17
    };

    this.products = [
      {
        name: 'Tesouro Selic 2029',
        issuer: 'Governo Federal (Tesouro Nacional)',
        type: 'Pos-fixado',
        profitability: 'Selic + 0.14% a.a.',
        annualRate: 10.64,
        liquidity: 'D+0 (Diária)',
        minimumInvest: 160.00,
        taxExempt: false,
        bestFor: 'Reserva de Emergência e dinheiro de curto prazo com risco zero soberano.',
        link: 'https://www.tesourodireto.com.br/titulos/precos-e-taxas.htm'
      },
      {
        name: 'Tesouro IPCA+ 2035',
        issuer: 'Governo Federal (Tesouro Nacional)',
        type: 'Híbrido (Inflação)',
        profitability: 'IPCA + 6.38% a.a.',
        annualRate: 10.48, // 4.10% inflação + 6.38%
        liquidity: 'D+1 (Vencimento)',
        minimumInvest: 45.00,
        taxExempt: false,
        bestFor: 'Aposentadoria e proteção contra desvalorização do Real (garante juro real de mais de 6% acima da inflação).',
        link: 'https://www.tesourodireto.com.br/titulos/precos-e-taxas.htm'
      },
      {
        name: 'Tesouro Prefixado 2027',
        issuer: 'Governo Federal (Tesouro Nacional)',
        type: 'Prefixado',
        profitability: '11.85% a.a. fixo',
        annualRate: 11.85,
        liquidity: 'D+1 (Vencimento)',
        minimumInvest: 35.00,
        taxExempt: false,
        bestFor: 'Quem quer travar quase 12% ao ano garantido caso a taxa de juros caia nos próximos anos.',
        link: 'https://www.tesourodireto.com.br/titulos/precos-e-taxas.htm'
      },
      {
        name: 'LCI / LCA 93% do CDI',
        issuer: 'Bancos Médios/Grandes',
        type: 'Isento de IR',
        profitability: '93% do CDI (Isento de IR)',
        annualRate: 11.75, // Equivalente a CDB 115% com IR
        liquidity: 'Após 9 meses',
        minimumInvest: 1000.00,
        taxExempt: true,
        bestFor: 'Investidores que odeiam pagar Imposto de Renda. O rendimento cai limpo na conta.',
        link: 'https://www.b3.com.br/pt_br/produtos-e-servicos/negociacao/renda-fixa/lci.htm'
      },
      {
        name: 'CDB 110% do CDI (com FGC)',
        issuer: 'Bancos Digitais / Sofisa / Daycoval',
        type: 'Pos-fixado',
        profitability: '11.44% a.a. (110% CDI)',
        annualRate: 11.44,
        liquidity: 'Diária ou 1 ano',
        minimumInvest: 100.00,
        taxExempt: false,
        bestFor: 'Rendimento superior à Selic com garantia de até R$ 250.000 pelo FGC (Fundo Garantidor de Créditos).',
        link: 'https://www.fgc.org.br/'
      }
    ];
  }

  init() {
    this.renderProducts();
    this.setupComparator();
  }

  renderProducts() {
    const container = document.getElementById('fixed-income-grid');
    if (!container) return;

    container.innerHTML = this.products.map(p => `
      <div class="opportunity-card" style="border-top: 3px solid var(--accent-blue);">
        <div>
          <div class="card-top">
            <div class="asset-identity">
              <div class="asset-icon" style="color: var(--accent-blue); border-color: rgba(0, 210, 255, 0.2);">
                🏛️
              </div>
              <div class="asset-names">
                <h3>${p.name}</h3>
                <span>${p.issuer}</span>
              </div>
            </div>
            <span class="badge ${p.taxExempt ? 'badge-discount' : 'badge-yield'}">
              ${p.taxExempt ? 'Isento de IR 💎' : p.type}
            </span>
          </div>

          <div class="price-row">
            <div class="price-main" style="color: var(--accent-green); font-size: 1.25rem;">
              ${p.profitability}
            </div>
          </div>

          <div class="metrics-grid">
            <div class="metric-item">
              <span class="label">Liquidez</span>
              <span class="value">${p.liquidity}</span>
            </div>
            <div class="metric-item">
              <span class="label">Aporte Mínimo</span>
              <span class="value">R$ ${p.minimumInvest.toFixed(2)}</span>
            </div>
          </div>

          <div class="thesis-note">
            <strong>Ideal para:</strong> ${p.bestFor}
          </div>
        </div>

        <div class="card-actions">
          <a href="${p.link}" target="_blank" rel="noopener" class="btn btn-broker btn-sm">
            🛒 Onde Investir ↗
          </a>
          <button class="btn btn-outline btn-sm" onclick="window.app.openTradeModal('${p.name}', 'fixed_income', 1000)">
            💼 Simular Aporte
          </button>
        </div>
      </div>
    `).join('');
  }

  setupComparator() {
    const initialInput = document.getElementById('sim-initial-amount');
    const monthlyInput = document.getElementById('sim-monthly-amount');
    const periodSelect = document.getElementById('sim-period-select');

    const runComparison = () => {
      const initial = parseFloat(initialInput?.value) || 0;
      const monthly = parseFloat(monthlyInput?.value) || 0;
      const years = parseInt(periodSelect?.value) || 3;
      const months = years * 12;

      const calcCompound = (annualRate) => {
        const monthlyRate = Math.pow(1 + annualRate / 100, 1 / 12) - 1;
        let total = initial;
        for (let m = 0; m < months; m++) {
          total = total * (1 + monthlyRate) + monthly;
        }
        return total;
      };

      const totalInvestedOutOfPocket = initial + (monthly * months);

      // Taxas anuais estimadas líquidas
      const resPoupanca = calcCompound(this.rates.poupanca);
      const resSelic = calcCompound(this.rates.selic * 0.825); // Desconto de IR médio ~17.5%
      const resIpca = calcCompound(10.5); // IPCA+ líquido
      const resFiis = calcCompound(11.8); // FIIs/Fiagros com dividendos reinvestidos (isento IR)

      const updateCard = (idPrefix, finalVal) => {
        const profit = finalVal - totalInvestedOutOfPocket;
        const profitPct = totalInvestedOutOfPocket > 0 ? (profit / totalInvestedOutOfPocket) * 100 : 0;

        const valEl = document.getElementById(`${idPrefix}-final`);
        const profitEl = document.getElementById(`${idPrefix}-profit`);

        if (valEl) valEl.textContent = 'R$ ' + finalVal.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        if (profitEl) profitEl.textContent = `+ R$ ${profit.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} (+${profitPct.toFixed(1)}%)`;
      };

      const outOfPocketEl = document.getElementById('sim-total-invested-display');
      if (outOfPocketEl) {
        outOfPocketEl.textContent = 'R$ ' + totalInvestedOutOfPocket.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
      }

      updateCard('res-poupanca', resPoupanca);
      updateCard('res-selic', resSelic);
      updateCard('res-ipca', resIpca);
      updateCard('res-fiis', resFiis);
    };

    initialInput?.addEventListener('input', runComparison);
    monthlyInput?.addEventListener('input', runComparison);
    periodSelect?.addEventListener('change', runComparison);
    runComparison();
  }
}

window.FixedIncomeRadar = FixedIncomeRadar;
