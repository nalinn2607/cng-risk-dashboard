// ============================================================
// CNG Holdings – Chart & UI Rendering Engine
// ============================================================
window._chartInstances = {};

// ── Chart.js Defaults ────────────────────────────────────
Chart.defaults.color = '#94a3b8'; // Premium crisp grey
Chart.defaults.font.family = 'Inter';
Chart.defaults.font.size = 11;
Chart.defaults.plugins.legend.labels.boxWidth = 10;
Chart.defaults.plugins.legend.labels.padding = 12;

const C = {
  blue: '#2563eb', cyan: '#22d3ee', green: '#10b981',
  yellow: '#f59e0b', orange: '#f97316', red: '#ef4444',
  purple: '#9333ea', pink: '#ec4899', magenta: '#e81cff',
  ghost: 'rgba(255,255,255,0.03)',
  gridLine: 'rgba(255,255,255,0.05)', // Extremely subtle grid
};

function makeChart(id, type, data, options = {}) {
  if (window._chartInstances[id]) window._chartInstances[id].destroy();
  const ctx = document.getElementById(id);
  if (!ctx) return null;
  const instance = new Chart(ctx, { type, data, options: deepMerge(defaultOpts(type), options) });
  window._chartInstances[id] = instance;
  return instance;
}

function defaultOpts(type) {
  const base = {
    responsive: true,
    maintainAspectRatio: false,
    layout: { padding: { top: 5, bottom: 20, left: 20, right: 20 } },
    plugins: {
      tooltip: {
        backgroundColor: 'rgba(8, 14, 50, 0.95)',
        borderColor: 'rgba(232, 28, 255, 0.4)',
        borderWidth: 1,
        padding: 12,
        titleFont: { size: 13, family: 'Space Grotesk' },
        bodyFont: { size: 12, family: 'Inter' }
      },
      legend: { display: false }
    },
  };
  if (['bar', 'line', 'scatter', 'radar'].includes(type)) {
    base.scales = {
      x: {
        grid: { color: C.gridLine },
        ticks: { maxRotation: 0, padding: 5, color: '#94a3b8' },
        title: { display: true, color: '#ffffff', font: { size: 10, weight: '700', family: 'Inter' } }
      },
      y: {
        grid: { color: C.gridLine },
        ticks: { padding: 5, color: '#94a3b8' },
        title: { display: true, color: '#ffffff', font: { size: 10, weight: '700', family: 'Inter' } }
      },
    };
  }
  return base;
}

function deepMerge(a, b) {
  const out = Object.assign({}, a);
  for (const k in b) {
    if (b[k] && typeof b[k] === 'object' && !Array.isArray(b[k]) && a[k]) out[k] = deepMerge(a[k], b[k]);
    else out[k] = b[k];
  }
  return out;
}

function alpha(hex, a) {
  const r = parseInt(hex.slice(1, 3), 16), g = parseInt(hex.slice(3, 5), 16), b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${a})`;
}

function tierBadge(tier) {
  const map = { Low: 'badge-green', Medium: 'badge-yellow', High: 'badge-orange', Critical: 'badge-red' };
  return `<span class="badge ${map[tier] || 'badge-blue'}">${tier}</span>`;
}

function fmtM(n) { return '$' + (n / 1e6).toFixed(1) + 'M'; }
function fmtK(n) { return (n / 1000).toFixed(0) + 'K'; }
function fmtPct(n) { return n.toFixed(1) + '%'; }
function fmtN(n) { return n.toLocaleString(); }

// ── Color scale for heatmap ──────────────────────────────
function heatColor(v, min = 0, max = 100) {
  const t = (v - min) / (max - min);
  if (t < 0.33) return `rgba(16,185,129,${0.3 + t * 0.7})`;
  if (t < 0.66) return `rgba(245,158,11,${0.3 + t * 0.5})`;
  return `rgba(239,68,68,${0.4 + t * 0.5})`;
}

// ============================================================
// TAB 1 · PORTFOLIO OVERVIEW
// ============================================================
function renderPortfolioKPIs() {
  const d = DashboardData.portfolio.kpis;
  const el = document.getElementById('portfolioKPIs');
  if (!el) return;
  el.innerHTML = [
    { icon: '💼', label: 'Active Loans', val: fmtN(d.totalActiveLoans), sub: 'Total portfolio', delta: '+2.4% MoM', dir: 'up' },
    { icon: '👥', label: 'Total Customers', val: fmtN(d.totalCustomers), sub: 'Unique borrowers', delta: '+1.8% MoM', dir: 'up' },
    { icon: '💵', label: 'Avg Loan Amount', val: '$' + d.avgLoanAmount.toLocaleString(), sub: 'Per customer', delta: '-0.3% MoM', dir: 'neutral' },
    { icon: '📅', label: 'Avg Tenure', val: d.avgTenure + ' mo', sub: 'Loan duration', delta: 'Stable', dir: 'neutral' },
    { icon: '⚠️', label: 'Charge-Off (MTD)', val: d.chargeOffRate.MTD + '%', sub: 'Month to date', delta: '+0.2pp', dir: 'down' },
    { icon: '♻️', label: 'Recovery Rate', val: d.recoveryRate + '%', sub: 'Collected / written-off', delta: '+1.2pp', dir: 'up' },
    { icon: '🔄', label: 'Roll 0→30 DPD', val: d.rollRates.r0_30 + '%', sub: '30-day roll rate', delta: '+0.4pp', dir: 'down' },
    { icon: '🔄', label: 'Roll 30→60 DPD', val: d.rollRates.r30_60 + '%', sub: '60-day roll rate', delta: '-0.8pp', dir: 'up' },
  ].map(k => `
    <div class="kpi-card">
      <div class="kpi-icon">${k.icon}</div>
      <div class="kpi-label">${k.label}</div>
      <div class="kpi-value">${k.val}</div>
      <div class="kpi-sub">${k.sub}</div>
      <div class="kpi-delta ${k.dir}">${k.dir === 'up' ? '▲' : k.dir === 'down' ? '▼' : '—'} ${k.delta}</div>
    </div>`).join('');
}

function renderPortfolioCharts() {
  const d = DashboardData.portfolio;

  // DPD Distribution bar
  makeChart('dpdDistChart', 'bar', {
    labels: ['Current (0 DPD)', '30-59 DPD', '60-89 DPD', '90+ DPD'],
    datasets: [{
      label: '% of Portfolio', data: [d.kpis.dpd.d0, d.kpis.dpd.d30, d.kpis.dpd.d60, d.kpis.dpd.d90],
      backgroundColor: [alpha(C.green, 0.8), alpha(C.yellow, 0.8), alpha(C.orange, 0.8), alpha(C.red, 0.8)],
      borderRadius: 6, borderSkipped: false
    }]
  }, {
    plugins: { legend: { display: false } },
    scales: {
      x: { title: { display: true, text: 'DPD Bucket' } },
      y: { title: { display: true, text: 'Portfolio %' }, ticks: { callback: v => v + '%' } }
    }
  });

  // Portfolio trend line
  makeChart('portfolioTrendChart', 'line', {
    labels: d.trend.map(t => t.month),
    datasets: [
      { label: 'Total Loans', data: d.trend.map(t => t.totalLoans), borderColor: C.blue, backgroundColor: alpha(C.blue, 0.1), fill: true, tension: 0.4, yAxisID: 'y' },
      { label: 'Charge-Off %', data: d.trend.map(t => t.chargeOff), borderColor: C.red, backgroundColor: alpha(C.red, 0.08), fill: true, tension: 0.4, yAxisID: 'y1' },
    ]
  }, {
    plugins: { legend: { display: true } },
    scales: {
      x: { title: { display: true, text: 'Reporting Month' } },
      y: { title: { display: true, text: 'Loan Count' }, grid: { color: C.gridLine }, ticks: { callback: v => fmtK(v) } },
      y1: { title: { display: true, text: 'Charge-Off %' }, position: 'right', grid: { display: false }, ticks: { callback: v => v + '%' } }
    }
  });

  // Product mix doughnut
  makeChart('productMixChart', 'doughnut', {
    labels: d.productMix.map(p => p.product),
    datasets: [{ data: d.productMix.map(p => p.pct), backgroundColor: [C.blue, C.cyan, C.purple, C.orange], hoverOffset: 8, borderWidth: 2, borderColor: '#111d35' }]
  }, { plugins: { legend: { display: true, position: 'bottom' } }, cutout: '65%' });

  // Roll Rate chart
  const rr = d.kpis.rollRates;
  makeChart('rollRateChart', 'bar', {
    labels: ['0→30', '30→60', '60→90', '90+→CO'],
    datasets: [{
      label: 'Roll Rate %', data: [rr.r0_30, rr.r30_60, rr.r60_90, rr.r90plus],
      backgroundColor: [alpha(C.green, 0.8), alpha(C.yellow, 0.8), alpha(C.orange, 0.8), alpha(C.red, 0.85)],
      borderRadius: 6
    }]
  }, {
    scales: {
      x: { title: { display: true, text: 'DPD Transition' } },
      y: { title: { display: true, text: 'Roll Rate %' }, ticks: { callback: v => v + '%' } }
    }
  });

  // Charge-off display
  const co = d.kpis.chargeOffRate;
  document.getElementById('coRateDisplay').innerHTML = [
    { label: 'MTD', val: co.MTD + '%', color: C.yellow },
    { label: 'QTD', val: co.QTD + '%', color: C.orange },
    { label: 'YTD', val: co.YTD + '%', color: C.red },
    { label: 'Recovery', val: d.kpis.recoveryRate + '%', color: C.green },
  ].map(i => `<div style="text-align:center">
    <div style="font-size:2rem;font-weight:800;color:${i.color}">${i.val}</div>
    <div style="font-size:0.72rem;color:var(--text-muted);text-transform:uppercase;letter-spacing:1px">${i.label}</div>
  </div>`).join('');
}

// ============================================================
// TAB 2 · EARLY WARNING SIGNALS
// ============================================================
function renderEWSTab() {
  const d = DashboardData.earlyWarning;

  // Alert rows
  document.getElementById('ewsAlerts').innerHTML = [
    { level: 'critical', dot: '#ef4444', msg: '<strong>2,840 customers</strong> triggered ≥3 simultaneous EW signals — action required within 24h' },
    { level: 'high', dot: '#f97316', msg: '<strong>NSF events spiked 34%</strong> in the last 7 days — income shock indicator elevated' },
    { level: 'medium', dot: '#f59e0b', msg: '<strong>Call avoidance rate at 28.4%</strong> — contactability risk increasing across 3 states' },
  ].map(a => `<div class="alert-row ${a.level}">
    <div class="alert-dot" style="background:${a.dot}"></div><div>${a.msg}</div></div>`).join('');

  // Score distribution
  makeChart('ewsScoreChart', 'bar', {
    labels: d.scores.map(s => s.scoreRange),
    datasets: [{
      label: 'Customers', data: d.scores.map(s => s.count),
      backgroundColor: d.scores.map((_, i) => i < 8 ? alpha(C.green, 0.75) : i < 14 ? alpha(C.yellow, 0.75) : alpha(C.red, 0.75)),
      borderRadius: 4
    }]
  }, {
    scales: {
      x: { title: { display: true, text: 'EWS Score Range' }, ticks: { maxRotation: 45 } },
      y: { title: { display: true, text: 'Customer Count' }, ticks: { callback: v => fmtK(v) } }
    }
  });

  // 30-day trend
  const T = d.timeline;
  makeChart('ewsTrendChart', 'line', {
    labels: T.map(t => t.date),
    datasets: [
      { label: 'High Risk', data: T.map(t => t.highRisk), borderColor: C.red, backgroundColor: alpha(C.red, 0.08), fill: true, tension: 0.4 },
      { label: 'NSF Events', data: T.map(t => t.nsf), borderColor: C.orange, fill: false, tension: 0.4, borderDash: [4, 3] },
      { label: 'Call Avoidance', data: T.map(t => t.callAvoidance), borderColor: C.purple, fill: false, tension: 0.4, borderDash: [4, 3] },
    ]
  }, {
    plugins: { legend: { display: true } },
    scales: {
      x: { title: { display: true, text: 'Timeline (Last 30 Days)' }, ticks: { maxTicksLimit: 10 } },
      y: { title: { display: true, text: 'Event Volume' }, ticks: { callback: v => fmtK(v) } }
    }
  });

  // Risk heatmap table
  const hm = d.heatmap;
  let htHtml = `<div style="overflow-x:auto"><table style="width:100%;border-collapse:collapse">
    <thead><tr><th style="padding:6px;text-align:left;font-size:0.68rem;color:var(--text-muted)">Segment</th>
    ${hm[0].signals.map(s => `<th style="padding:6px;font-size:0.65rem;color:var(--text-muted);text-align:center">${s.signal}</th>`).join('')}</tr></thead><tbody>`;
  hm.forEach(row => {
    htHtml += `<tr><td style="padding:6px;font-size:0.76rem;font-weight:600;color:var(--text-primary);white-space:nowrap">${row.segment}</td>`;
    row.signals.forEach(s => {
      const col = heatColor(s.intensity);
      htHtml += `<td style="padding:4px"><div class="heatmap-cell" style="background:${col}">${s.intensity}%</div></td>`;
    });
    htHtml += '</tr>';
  });
  htHtml += '</tbody></table></div>';
  document.getElementById('ewsHeatmapTable').innerHTML = htHtml;

  // KRI summary
  const kris = [
    { label: 'Missed Payment Reminders', val: '18.4%', weight: '×0.25', color: C.red },
    { label: 'Broken Promise-to-Pay %', val: '22.8%', weight: '×0.15', color: C.orange },
    { label: 'Bank Balance Drop >30%', val: '31.2%', weight: '×0.20', color: C.yellow },
    { label: 'Call Avoidance Pattern', val: '28.4%', weight: '×0.10', color: C.purple },
    { label: 'Loan Stacking Active', val: '14.7%', weight: '×0.30', color: C.red },
  ];
  document.getElementById('ewsKRIDisplay').innerHTML = kris.map(k => `
    <div class="shap-bar-item">
      <div class="shap-bar-label"><span>${k.label}</span><span class="val">${k.val} <span style="color:var(--text-muted)">${k.weight}</span></span></div>
      <div class="progress-bar-wrap"><div class="progress-bar-fill" style="width:${k.val};background:${k.color}"></div></div>
    </div>`).join('');
}

// ============================================================
// TAB 3 · DPD MIGRATION
// ============================================================
function renderDPDTab() {
  const d = DashboardData.dpd;

  // DPD bucket trend stacked
  makeChart('dpdTrendChart', 'bar', {
    labels: d.trend.map(t => t.month),
    datasets: [
      { label: '0-29 DPD', data: d.trend.map(t => t.d0), backgroundColor: alpha(C.green, 0.75), stack: 's' },
      { label: '30-59 DPD', data: d.trend.map(t => t.d30), backgroundColor: alpha(C.yellow, 0.75), stack: 's' },
      { label: '60-89 DPD', data: d.trend.map(t => t.d60), backgroundColor: alpha(C.orange, 0.75), stack: 's' },
      { label: '90+ DPD', data: d.trend.map(t => t.d90), backgroundColor: alpha(C.red, 0.75), stack: 's' },
    ]
  }, {
    plugins: { legend: { display: true } },
    scales: {
      y: { stacked: true, title: { display: true, text: '% of Total Portfolio' }, ticks: { callback: v => v + '%' } },
      x: { stacked: true, title: { display: true, text: 'Month' } }
    }
  });

  // Migration matrix
  const mm = d.migration;
  let mHtml = `<div style="overflow-x:auto;font-size:0.72rem">
    <table class="matrix-table" style="width:100%;border-collapse:collapse">
    <thead><tr><th style="padding:8px;color:var(--text-muted)">From ↓ / To →</th>
    ${mm.to.map(t => `<th style="padding:8px;color:var(--text-muted)">${t}</th>`).join('')}</tr></thead><tbody>`;
  mm.from.forEach((f, i) => {
    mHtml += `<tr><td style="padding:8px;font-weight:700;color:var(--text-primary)">${f}</td>`;
    mm.data[i].forEach(v => {
      if (v === 0) { mHtml += '<td></td>'; return; }
      const c = v > 40 ? C.red : v > 20 ? C.orange : v > 10 ? C.yellow : C.green;
      mHtml += `<td style="padding:6px"><div class="matrix-cell" style="background:${alpha(c, 0.25)};color:${c};margin:0 auto">${v}%</div></td>`;
    });
    mHtml += '</tr>';
  });
  mHtml += '</tbody></table></div>';
  document.getElementById('migrationMatrixDisplay').innerHTML = mHtml;

  // Cohort line chart
  const ch = d.cohorts;
  makeChart('cohortChart', 'line', {
    labels: ['M1', 'M2', 'M3', 'M4', 'M5', 'M6'],
    datasets: ch.map((c, i) => ({
      label: c.cohort,
      data: [c.m1, c.m2, c.m3, c.m4, c.m5, c.m6],
      borderColor: [C.blue, C.cyan, C.green, C.yellow, C.orange, C.red][i],
      tension: 0.4, fill: false, borderWidth: 2
    }))
  }, {
    plugins: { legend: { display: true } },
    scales: {
      x: { title: { display: true, text: 'Months on Book (MOB)' } },
      y: { title: { display: true, text: 'Cum. Loss %' }, ticks: { callback: v => v + '%' } }
    }
  });
}

// ============================================================
// TAB 4 · CHARGE-OFF PREDICTION
// ============================================================
function renderChargeOffTab() {
  // KPIs
  const high = DashboardData.chargeOff.customers.filter(c => ['High', 'Critical'].includes(c.riskTier)).length;
  document.getElementById('coKPIs').innerHTML = [
    { icon: '🚨', label: 'Critical Risk Customers', val: fmtN(DashboardData.chargeOff.customers.filter(c => c.riskTier === 'Critical').length), sub: 'Avg PD-90 > 70%', delta: '↑ 8.2% WoW', dir: 'down' },
    { icon: '⚠️', label: 'High Risk Customers', val: fmtN(DashboardData.chargeOff.customers.filter(c => c.riskTier === 'High').length), sub: 'Avg PD-60 > 50%', delta: '↑ 3.4%', dir: 'down' },
    { icon: '📊', label: 'Avg PD-30 (Portfolio)', val: '28.4%', sub: 'Probability of charge-off', delta: 'Model AUC: 0.84', dir: 'neutral' },
    { icon: '🤖', label: 'Model Accuracy', val: '83.7%', sub: 'XGBoost v2.4', delta: 'F1: 0.81', dir: 'up' },
  ].map(k => `<div class="kpi-card">
    <div class="kpi-icon">${k.icon}</div><div class="kpi-label">${k.label}</div>
    <div class="kpi-value" style="font-size:1.3rem;color:${k.dir === 'down' ? C.red : k.dir === 'up' ? C.green : 'var(--text-primary)'}">${k.val}</div>
    <div class="kpi-sub">${k.sub}</div><div class="kpi-delta ${k.dir}">${k.delta}</div></div>`).join('');

  // Risk score histogram
  const bins = Array.from({ length: 10 }, (_, i) => ({ r: `${i * 10}-${i * 10 + 9}`, n: Math.round(15000 * Math.exp(-2 * Math.pow((i - 3) / 3, 2)) + Math.random() * 500) }));
  makeChart('riskHistChart', 'bar', {
    labels: bins.map(b => b.r),
    datasets: [{
      label: 'Customers', data: bins.map(b => b.n),
      backgroundColor: bins.map((_, i) => i < 4 ? alpha(C.green, 0.75) : i < 7 ? alpha(C.yellow, 0.75) : alpha(C.red, 0.78)),
      borderRadius: 5
    }]
  }, {
    scales: {
      x: { title: { display: true, text: 'Risk Score (PDx100)' } },
      y: { title: { display: true, text: 'Customer Frequency' }, ticks: { callback: v => fmtK(v) } }
    }
  });

  // SHAP
  const shap = DashboardData.chargeOff.shap.slice(0, 8);
  document.getElementById('shapDisplay').innerHTML = shap.map(s => `
    <div class="shap-bar-item">
      <div class="shap-bar-label"><span>${s.feature}</span><span class="val">${(s.importance * 100).toFixed(0)}%</span></div>
      <div class="progress-bar-wrap"><div class="progress-bar-fill" style="width:${(s.importance * 100).toFixed(0)}%;background:${s.importance > 0.25 ? C.red : s.importance > 0.15 ? C.orange : C.blue}"></div></div>
    </div>`).join('');

  renderCustomerTable();
}

function renderCustomerTable() {
  const search = (document.getElementById('searchCustomer')?.value || '').toLowerCase();
  const tier = document.getElementById('filterTier')?.value || '';
  let rows = DashboardData.chargeOff.customers.filter(c => {
    const matchS = !search || c.id.toLowerCase().includes(search);
    const matchT = !tier || c.riskTier === tier;
    return matchS && matchT;
  }).slice(0, 50);
  const html = `<table>
    <thead><tr><th>ID</th><th>Product</th><th>State</th><th>Channel</th><th>DPD</th><th>PD-30</th><th>PD-60</th><th>PD-90</th><th>Risk Tier</th><th>Top Risk Drivers</th></tr></thead>
    <tbody>${rows.map(r => `<tr>
      <td class="bold" style="font-family:JetBrains Mono;font-size:0.72rem">${r.id}</td>
      <td>${r.product}</td><td>${r.state}</td><td>${r.channel}</td>
      <td style="color:${r.dpd > 60 ? C.red : r.dpd > 30 ? C.orange : C.green};font-weight:700">${r.dpd}</td>
      <td>${r.pd30}%</td><td>${r.pd60}%</td><td>${r.pd90}%</td>
      <td>${tierBadge(r.riskTier)}</td>
      <td style="font-size:0.7rem;color:var(--text-muted)">${r.topRisks.join(', ')}</td>
    </tr>`).join('')}</tbody></table>`;
  document.getElementById('customerTableWrap').innerHTML = html;
}

// ============================================================
// TAB 5 · LOSS FORECAST
// ============================================================
function renderLossTab() {
  const d = DashboardData.loss;
  document.getElementById('lossKPIs').innerHTML = [
    { icon: '💸', label: 'Expected Loss (90D)', val: fmtM(d.summary.el), sub: 'CECL model estimate', delta: '↑4.2% vs last Q', dir: 'down' },
    { icon: '📉', label: 'LGD Estimate', val: d.summary.lgd + '%', sub: 'Loss given default', delta: 'Model: 0.614', dir: 'neutral' },
    { icon: '🏦', label: 'Exposure at Default', val: fmtM(d.summary.ead), sub: 'Total EAD', delta: 'Portfolio EAD', dir: 'neutral' },
    { icon: '⏰', label: '30D Loss Forecast', val: fmtM(d.summary.lossForecast30), sub: 'Expected 30-day', delta: 'Confidence: 87%', dir: 'neutral' },
    { icon: '��', label: '60D Loss Forecast', val: fmtM(d.summary.lossForecast60), sub: 'Expected 60-day', delta: 'Confidence: 81%', dir: 'neutral' },
    { icon: '🔮', label: 'Lifetime Loss Est.', val: fmtM(d.summary.lifetimeLoss), sub: 'CECL lifetime', delta: 'LTV adjusted', dir: 'neutral' },
  ].map(k => `<div class="kpi-card">
    <div class="kpi-icon">${k.icon}</div><div class="kpi-label">${k.label}</div>
    <div class="kpi-value" style="font-size:1.3rem">${k.val}</div>
    <div class="kpi-sub">${k.sub}</div>
    <div class="kpi-delta ${k.dir}">${k.delta}</div></div>`).join('');

  makeChart('lossCurveChart', 'line', {
    labels: d.curve.map(c => c.horizon),
    datasets: [
      { label: 'Expected', data: d.curve.map(c => c.expected), borderColor: C.blue, backgroundColor: alpha(C.blue, 0.12), fill: true, tension: 0.4, borderWidth: 2 },
      { label: 'Upside', data: d.curve.map(c => c.upside), borderColor: C.green, fill: false, tension: 0.4, borderDash: [5, 4] },
      { label: 'Downside', data: d.curve.map(c => c.downside), borderColor: C.red, fill: false, tension: 0.4, borderDash: [5, 4] },
    ]
  }, {
    plugins: { legend: { display: true } },
    scales: {
      x: { title: { display: true, text: 'Forecast Horizon (Months)' } },
      y: { title: { display: true, text: 'Cumulative Loss ($M)' }, ticks: { callback: v => '$' + v + 'M' } }
    }
  });

  makeChart('lossProductChart', 'bar', {
    labels: d.byProduct.map(p => p.product),
    datasets: [{
      label: 'Expected Loss', data: d.byProduct.map(p => p.el / 1e6),
      backgroundColor: [C.blue, C.cyan, C.purple, C.orange].map(c => alpha(c, 0.8)), borderRadius: 6
    }]
  }, {
    scales: {
      x: { title: { display: true, text: 'Loan Product' } },
      y: { title: { display: true, text: 'Expected Loss ($M)' }, ticks: { callback: v => '$' + v + 'M' } }
    }
  });

  makeChart('lossSegmentChart', 'doughnut', {
    labels: d.bySegment.map(s => s.segment),
    datasets: [{
      data: d.bySegment.map(s => s.el / 1e6),
      backgroundColor: [C.green, C.yellow, C.red, C.purple, C.pink, C.orange].map(c => alpha(c, 0.82)),
      borderWidth: 2, borderColor: '#111d35'
    }]
  }, { plugins: { legend: { display: true, position: 'bottom' } }, cutout: '50%' });
}

// ============================================================
// TAB 6 · BEHAVIOURAL SEGMENTATION
// ============================================================
function renderSegmentTab() {
  const d = DashboardData.segmentation;

  // Scatter
  const colors = ['#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#f97316'];
  const segNames = ['Reliable Thin-File', 'Temporary Hardship', 'Chronic Delinquent', 'Strategic Defaulter', 'Fraud Risk', 'Pawn-Default Risk'];
  const samplePts = d.clusters.points.filter((_, i) => i % 8 === 0);
  makeChart('scatterChart', 'scatter', {
    datasets: [0, 1, 2, 3, 4, 5].map(si => ({
      label: segNames[si],
      data: samplePts.filter(p => p.seg === si).map(p => ({ x: p.x, y: p.y })),
      backgroundColor: alpha(colors[si], 0.6),
      pointRadius: 4,
    }))
  }, {
    plugins: { legend: { display: true, position: 'bottom' } },
    scales: {
      x: { title: { display: true, text: 'Risk Score (X-Axis)' }, min: 0, max: 100, grid: { color: C.gridLine } },
      y: { title: { display: true, text: 'Engagement Score (Y-Axis)' }, min: 0, max: 100, grid: { color: C.gridLine } },
    }
  });

  // Segment size doughnut
  const sz = d.sizes;
  makeChart('segmentSizeChart', 'doughnut', {
    labels: sz.map(s => s.segment),
    datasets: [{ data: sz.map(s => s.size), backgroundColor: colors.map(c => alpha(c, 0.82)), borderWidth: 2, borderColor: '#111d35', hoverOffset: 8 }]
  }, { plugins: { legend: { display: true, position: 'bottom' } }, cutout: '55%' });

  // Table
  document.getElementById('segmentDetailTable').innerHTML = `
    <table><thead><tr><th>Segment</th><th>Customers</th><th>% Portfolio</th><th>Charge-Off %</th><th>Recovery %</th><th>Risk</th></tr></thead>
    <tbody>${sz.map((s, i) => `<tr>
      <td class="bold" style="color:${colors[i]}">${s.segment}</td>
      <td>${fmtN(s.size)}</td>
      <td>${((s.size / 201847) * 100).toFixed(1)}%</td>
      <td style="color:${s.chargeOff > 30 ? C.red : s.chargeOff > 10 ? C.orange : C.green};font-weight:700">${s.chargeOff}%</td>
      <td style="color:${s.recovery > 50 ? C.green : s.recovery > 30 ? C.yellow : C.red};font-weight:700">${s.recovery}%</td>
      <td>${tierBadge(s.chargeOff > 40 ? 'Critical' : s.chargeOff > 20 ? 'High' : s.chargeOff > 8 ? 'Medium' : 'Low')}</td>
    </tr>`).join('')}</tbody></table>`;
}

// ============================================================
// TAB 7 · PRODUCT RISK
// ============================================================
function renderProductTab() {
  const d = DashboardData.productRisk;
  const prodColors = [C.blue, C.cyan, C.purple, C.orange];

  // KPI cards per product
  document.getElementById('productKPICards').innerHTML = `<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:12px">` +
    d.map((p, i) => `<div class="card" style="border-top:3px solid ${prodColors[i]}">
      <div style="font-size:0.72rem;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:${prodColors[i]};margin-bottom:8px">${p.product}</div>
      <div class="stat-row"><span class="stat-label">Avg DPD</span><span class="stat-val" style="color:${p.avgDPD > 30 ? C.red : C.yellow}">${p.avgDPD}</span></div>
      <div class="stat-row"><span class="stat-label">Charge-Off</span><span class="stat-val" style="color:${p.chargeOff > 5 ? C.red : C.green}">${p.chargeOff}%</span></div>
      <div class="stat-row"><span class="stat-label">Recovery</span><span class="stat-val" style="color:${p.recovery > 50 ? C.green : C.yellow}">${p.recovery}%</span></div>
      <div class="stat-row"><span class="stat-label">PD</span><span class="stat-val">${p.pd}%</span></div>
      <div class="stat-row" style="border:none"><span class="stat-label">LGD</span><span class="stat-val">${p.lgd}%</span></div>
    </div>`).join('') + '</div>';

  makeChart('productCOChart', 'bar', {
    labels: d.map(p => p.product),
    datasets: [
      { label: 'Charge-Off %', data: d.map(p => p.chargeOff), backgroundColor: prodColors.map(c => alpha(c, 0.8)), borderRadius: 8 },
    ]
  }, {
    scales: {
      x: { title: { display: true, text: 'Loan Product' } },
      y: { title: { display: true, text: 'Charge-Off Rate' }, ticks: { callback: v => v + '%' } }
    }
  });

  makeChart('productDPDChart', 'bar', {
    labels: d.map(p => p.product),
    datasets: [
      { label: 'Avg DPD', data: d.map(p => p.avgDPD), backgroundColor: prodColors.map(c => alpha(c, 0.7)), borderRadius: 6, yAxisID: 'y' },
      { label: 'Recovery %', data: d.map(p => p.recovery), backgroundColor: prodColors.map(c => alpha(c, 0.4)), borderRadius: 6, yAxisID: 'y1' },
    ]
  }, {
    plugins: { legend: { display: true } },
    scales: {
      x: { title: { display: true, text: 'Loan Product' } },
      y: { title: { display: true, text: 'Avg Days Past Due' }, grid: { color: C.gridLine } },
      y1: { title: { display: true, text: 'Recovery Rate' }, position: 'right', grid: { display: false }, ticks: { callback: v => v + '%' } }
    }
  });

  document.getElementById('productTableWrap').innerHTML = `
    <table><thead><tr><th>Product</th><th>Avg DPD</th><th>PD</th><th>LGD</th><th>Charge-Off %</th><th>Recovery %</th><th>Roll 30→60</th></tr></thead>
    <tbody>${d.map((p, i) => `<tr>
      <td class="bold" style="color:${prodColors[i]}">${p.product}</td>
      <td style="color:${p.avgDPD > 30 ? C.red : C.yellow};font-weight:700">${p.avgDPD}</td>
      <td>${p.pd}%</td><td>${p.lgd}%</td>
      <td style="color:${p.chargeOff > 5 ? C.red : C.green};font-weight:700">${p.chargeOff}%</td>
      <td style="color:${p.recovery > 50 ? C.green : C.yellow};font-weight:700">${p.recovery}%</td>
      <td>${p.rollRate30_60}%</td>
    </tr>`).join('')}</tbody></table>`;
}

// ============================================================
// TAB 8 · GEOGRAPHIC RISK
// ============================================================
function renderGeoTab() {
  const d = DashboardData.geoRisk.sort((a, b) => b.riskScore - a.riskScore);

  document.getElementById('geoAlerts').innerHTML = d.filter(s => s.layoffRisk === 'High').slice(0, 3).map(s =>
    `<div class="alert-row high"><div class="alert-dot" style="background:${C.orange}"></div>
     <div><strong>${s.state}</strong>: Layoff risk HIGH — Charge-off ${s.chargeOff}%, Roll Rate ${s.rollRate}%, Unemployment ${s.unemployment}%</div></div>`
  ).join('');

  // Geo grid
  const maxCO = Math.max(...d.map(s => s.chargeOff));
  document.getElementById('geoHeatmapGrid').innerHTML = `<div class="geo-grid">` +
    d.map(s => {
      const bg = heatColor(s.chargeOff, 1, maxCO);
      return `<div class="geo-cell" style="background:${bg}" title="${s.state}: CO ${s.chargeOff}%, Roll ${s.rollRate}%">
        <div class="state-code">${s.state}</div>
        <div class="state-val">CO: ${s.chargeOff}%</div>
        <div class="state-val">${fmtN(s.activeLoans)} loans</div>
      </div>`;
    }).join('') + '</div>';

  const top10 = d.slice(0, 10);
  makeChart('geoBarChart', 'bar', {
    labels: top10.map(s => s.state),
    datasets: [{
      label: 'Risk Score', data: top10.map(s => s.riskScore),
      backgroundColor: top10.map(s => s.riskScore > 70 ? alpha(C.red, 0.8) : s.riskScore > 50 ? alpha(C.orange, 0.8) : alpha(C.yellow, 0.8)),
      borderRadius: 6
    }]
  }, {
    scales: {
      x: { title: { display: true, text: 'State' } },
      y: { title: { display: true, text: 'Risk Score (0-100)' }, max: 100, ticks: { callback: v => v } }
    }
  });

  document.getElementById('geoTableWrap').innerHTML = `
    <div style="max-height:280px;overflow-y:auto">
    <table><thead><tr><th>State</th><th>Risk Score</th><th>Charge-Off %</th><th>Roll Rate</th><th>Loans</th><th>Unemployment</th><th>Layoff Risk</th></tr></thead>
    <tbody>${d.slice(0, 15).map(s => `<tr>
      <td class="bold">${s.state}</td>
      <td><span style="font-weight:700;color:${s.riskScore > 70 ? C.red : s.riskScore > 50 ? C.orange : C.green}">${s.riskScore}</span></td>
      <td>${s.chargeOff}%</td><td>${s.rollRate}%</td>
      <td>${fmtN(s.activeLoans)}</td><td>${s.unemployment}%</td>
      <td>${tierBadge(s.layoffRisk === 'High' ? 'Critical' : s.layoffRisk === 'Medium' ? 'Medium' : 'Low')}</td>
    </tr>`).join('')}</tbody></table></div>`;
}

// ============================================================
// TAB 9 · CHANNEL RISK
// ============================================================
function renderChannelTab() {
  const d = DashboardData.channelRisk;
  document.getElementById('channelCards').innerHTML = `<div style="display:grid;grid-template-columns:1fr 1fr;gap:16px">` +
    d.map((ch, i) => `<div class="card" style="border-top:3px solid ${[C.blue, C.cyan][i]}">
      <div style="font-size:0.9rem;font-weight:800;margin-bottom:12px;color:${[C.blue, C.cyan][i]}">${ch.channel === 'Online' ? '🌐' : '🏪'} ${ch.channel}</div>
      <div class="stat-row"><span class="stat-label">Active Loans</span><span class="stat-val">${fmtN(ch.activeLoans)}</span></div>
      <div class="stat-row"><span class="stat-label">Avg Loan</span><span class="stat-val">$${ch.avgLoan.toLocaleString()}</span></div>
      <div class="stat-row"><span class="stat-label">Avg DPD</span><span class="stat-val" style="color:${ch.avgDPD > 25 ? C.orange : C.green}">${ch.avgDPD}</span></div>
      <div class="stat-row"><span class="stat-label">Charge-Off %</span><span class="stat-val" style="color:${ch.chargeOff > 4 ? C.red : C.yellow}">${ch.chargeOff}%</span></div>
      <div class="stat-row"><span class="stat-label">Recovery %</span><span class="stat-val" style="color:${ch.recovery > 37 ? C.green : C.yellow}">${ch.recovery}%</span></div>
    </div>`).join('') + '</div>';

  makeChart('channelDPDChart', 'line', {
    labels: d[0].trend.map(t => t.month),
    datasets: d.map((ch, i) => ({
      label: ch.channel, data: ch.trend.map(t => t.dpd),
      borderColor: [C.blue, C.cyan][i], backgroundColor: alpha([C.blue, C.cyan][i], 0.08),
      fill: i === 0, tension: 0.4
    }))
  }, {
    plugins: { legend: { display: true } },
    scales: {
      x: { title: { display: true, text: 'Timeline' } },
      y: { title: { display: true, text: 'Average DPD' } }
    }
  });

  makeChart('channelCOChart', 'line', {
    labels: d[0].trend.map(t => t.month),
    datasets: d.map((ch, i) => ({
      label: ch.channel, data: ch.trend.map(t => t.co),
      borderColor: [C.orange, C.purple][i], fill: false, tension: 0.4
    }))
  }, {
    plugins: { legend: { display: true } },
    scales: {
      x: { title: { display: true, text: 'Timeline' } },
      y: { title: { display: true, text: 'Charge-Off Frequency' }, ticks: { callback: v => v + '%' } }
    }
  });

  makeChart('channelRadarChart', 'radar', {
    labels: ['Avg DPD', 'Charge-Off', 'Recovery', 'Roll Rate', 'Avg Loan ($00)'],
    datasets: d.map((ch, i) => ({
      label: ch.channel,
      data: [ch.avgDPD, ch.chargeOff * 5, ch.recovery / 3, ch.rollRate, ch.avgLoan / 100],
      borderColor: [C.blue, C.cyan][i], backgroundColor: alpha([C.blue, C.cyan][i], 0.15), pointBackgroundColor: [C.blue, C.cyan][i]
    }))
  }, { plugins: { legend: { display: true } }, scales: { r: { grid: { color: C.gridLine }, ticks: { display: false }, title: { display: true, text: 'Metric Value' } } } });
}

// ============================================================
// TAB 10 · VULNERABILITY SCORE
// ============================================================
function renderVulnerabilityTab() {
  const d = DashboardData.vulnerability;

  makeChart('vulnTierChart', 'doughnut', {
    labels: d.tierDist.map(t => t.tier),
    datasets: [{
      data: d.tierDist.map(t => t.pct),
      backgroundColor: d.tierDist.map(t => alpha(t.color, 0.82)),
      borderWidth: 2, borderColor: '#111d35', hoverOffset: 10
    }]
  }, { plugins: { legend: { display: true, position: 'bottom' } }, cutout: '58%' });

  makeChart('vulnCategoryChart', 'bar', {
    labels: d.categories.map(c => c.name),
    datasets: [{
      label: 'Avg Vulnerability Score', data: d.categories.map(c => c.avgScore),
      backgroundColor: d.categories.map(c => c.avgScore > 65 ? alpha(C.red, 0.8) : c.avgScore > 50 ? alpha(C.orange, 0.8) : alpha(C.yellow, 0.75)),
      borderRadius: 6
    }]
  }, {
    scales: {
      x: { title: { display: true, text: 'Vulnerability Category' }, ticks: { maxRotation: 30 } },
      y: { title: { display: true, text: 'Composite Score' }, max: 100 }
    }
  });

  document.getElementById('vulnTableWrap').innerHTML = `
    <table><thead><tr><th>Category</th><th>Avg Vuln Score</th><th>Avg DPD</th><th>Charge-Off %</th><th>Recovery %</th><th>Severity</th></tr></thead>
    <tbody>${d.categories.map(c => `<tr>
      <td class="bold">${c.name}</td>
      <td><div style="display:flex;align-items:center;gap:8px">
        <div class="progress-bar-wrap" style="width:80px"><div class="progress-bar-fill" style="width:${c.avgScore}%;background:${c.avgScore > 65 ? C.red : c.avgScore > 50 ? C.orange : C.yellow}"></div></div>
        <span style="font-family:JetBrains Mono;font-weight:700">${c.avgScore}</span>
      </div></td>
      <td style="color:${c.avgDPD > 50 ? C.red : C.orange}">${c.avgDPD}</td>
      <td style="color:${c.chargeOff > 20 ? C.red : C.orange}">${c.chargeOff}%</td>
      <td style="color:${c.recovery > 35 ? C.green : C.yellow}">${c.recovery}%</td>
      <td>${tierBadge(c.avgScore > 70 ? 'Critical' : c.avgScore > 55 ? 'High' : c.avgScore > 40 ? 'Medium' : 'Low')}</td>
    </tr>`).join('')}</tbody></table>`;
}

// ============================================================
// TAB 11 · FINANCIAL HEALTH SCORE
// ============================================================
function renderFHSTab() {
  const d = DashboardData.fhs;

  // Pillar bars
  const pillarColors = [C.green, C.blue, C.orange, C.purple, C.cyan, C.yellow];
  document.getElementById('pillarBars').innerHTML = d.pillars.map((p, i) => `
    <div class="pillar-bar">
      <div class="pillar-name">${p.pillar} <span style="color:var(--text-muted);">(${(p.weight * 100).toFixed(0)}%)</span></div>
      <div class="pillar-track"><div class="pillar-fill" style="width:${p.avgScore}%;background:${pillarColors[i]}"></div></div>
      <div class="pillar-val" style="color:${pillarColors[i]}">${p.avgScore}</div>
    </div>`).join('');

  // Score distribution
  makeChart('fhsDistChart', 'bar', {
    labels: d.distribution.map(b => b.range),
    datasets: [{
      label: 'Customers', data: d.distribution.map(b => b.count),
      backgroundColor: d.distribution.map((_, i) => i < 7 ? alpha(C.red, 0.75) : i < 11 ? alpha(C.orange, 0.75) : i < 15 ? alpha(C.yellow, 0.75) : alpha(C.green, 0.8)),
      borderRadius: 4
    }]
  }, {
    scales: {
      x: { title: { display: true, text: 'Financial Health Score' }, ticks: { maxRotation: 45 } },
      y: { title: { display: true, text: 'Customer Count' }, ticks: { callback: v => fmtK(v) } }
    }
  });

  // Tier trend
  const T = d.trend;
  makeChart('fhsTrendChart', 'line', {
    labels: T.map(t => t.month),
    datasets: [
      { label: 'Excellent', data: T.map(t => t.excellent), borderColor: C.green, fill: false, tension: 0.4 },
      { label: 'Good', data: T.map(t => t.good), borderColor: C.blue, fill: false, tension: 0.4 },
      { label: 'Watchlist', data: T.map(t => t.watchlist), borderColor: C.yellow, fill: false, tension: 0.4 },
      { label: 'High Risk', data: T.map(t => t.highRisk), borderColor: C.orange, fill: false, tension: 0.4 },
      { label: 'Critical', data: T.map(t => t.critical), borderColor: C.red, fill: false, tension: 0.4 },
    ]
  }, {
    plugins: { legend: { display: true } },
    scales: {
      x: { title: { display: true, text: 'Trend (MTD)' } },
      y: { title: { display: true, text: '% of Segments' }, ticks: { callback: v => v + '%' } }
    }
  });

  // vs Charge-off
  makeChart('fhsVsCOChart', 'bar', {
    labels: d.vsChargeOff.map(b => b.fhsBucket),
    datasets: [{
      label: 'Charge-Off %', data: d.vsChargeOff.map(b => b.chargeOff),
      backgroundColor: d.vsChargeOff.map((_, i) => i < 4 ? alpha(C.red, 0.8) : i < 7 ? alpha(C.orange, 0.7) : alpha(C.green, 0.75)),
      borderRadius: 5
    }]
  }, {
    scales: {
      x: { title: { display: true, text: 'FHS Score Bucket' }, ticks: { maxRotation: 45 } },
      y: { title: { display: true, text: 'Expected Charge-Off' }, ticks: { callback: v => v + '%' } }
    }
  });

  // vs DPD
  makeChart('fhsVsDPDChart', 'bar', {
    labels: d.vsDPD.map(b => b.fhsTier),
    datasets: [{
      label: 'Avg DPD', data: d.vsDPD.map(b => b.avgDPD),
      backgroundColor: [C.green, C.blue, C.yellow, C.orange, C.red].map(c => alpha(c, 0.8)), borderRadius: 6
    }]
  }, {
    scales: {
      x: { title: { display: true, text: 'FHS Tier' } },
      y: { title: { display: true, text: 'Observed Avg DPD' }, ticks: { callback: v => v + ' DPD' } }
    }
  });

  // Product FHS
  makeChart('fhsProductChart', 'bar', {
    labels: d.byProduct.map(p => p.product),
    datasets: [
      { label: 'Excellent', data: d.byProduct.map(p => p.excellent), backgroundColor: alpha(C.green, 0.8), stack: 's', borderRadius: 4 },
      { label: 'Good', data: d.byProduct.map(p => p.good), backgroundColor: alpha(C.blue, 0.8), stack: 's' },
      { label: 'Watchlist', data: d.byProduct.map(p => p.watchlist), backgroundColor: alpha(C.yellow, 0.8), stack: 's' },
      { label: 'High Risk', data: d.byProduct.map(p => p.highRisk), backgroundColor: alpha(C.orange, 0.8), stack: 's' },
      { label: 'Critical', data: d.byProduct.map(p => p.critical), backgroundColor: alpha(C.red, 0.8), stack: 's', borderRadius: 4 },
    ]
  }, {
    plugins: { legend: { display: true } },
    scales: {
      x: { stacked: true, title: { display: true, text: 'Product' } },
      y: { stacked: true, title: { display: true, text: 'FHS Mix %' }, ticks: { callback: v => v + '%' } }
    }
  });

  // Tier actions
  const tiers = [
    { tier: 'Excellent (80–100)', color: C.green, actions: ['✔ Offer better loan terms', '✔ Upsell installment loan', '✔ Loyalty rewards program'] },
    { tier: 'Good (65–79)', color: C.blue, actions: ['✔ Monitor regularly', '✔ Send proactive reminders', '✔ Maintain credit limit'] },
    { tier: 'Watchlist (50–64)', color: C.yellow, actions: ['✔ Early intervention call', '✔ Offer hardship plan', '✔ Reduce loan exposure'] },
    { tier: 'High Risk (35–49)', color: C.orange, actions: ['✔ Intensive collections', '✔ Payment restructuring', '✔ Skip tracing initiation'] },
    { tier: 'Critical (0–34)', color: C.red, actions: ['✔ Legal escalation', '✔ Repossess collateral', '✔ Write-off planning'] },
  ];
  document.getElementById('fhsTierActions').innerHTML = `<div style="display:grid;grid-template-columns:repeat(5,1fr);gap:10px">` +
    tiers.map(t => `<div style="border-top:3px solid ${t.color};padding:12px;background:var(--bg-surface);border-radius:8px">
      <div style="font-size:0.76rem;font-weight:700;color:${t.color};margin-bottom:8px">${t.tier}</div>
      ${t.actions.map(a => `<div style="font-size:0.72rem;color:var(--text-secondary);padding:2px 0">${a}</div>`).join('')}
    </div>`).join('') + '</div>';
}

// ============================================================
// TAB 12 · AI ACTION RECOMMENDATIONS
// ============================================================
function renderActionsTab() {
  const d = DashboardData.actions;
  document.getElementById('actionCards').innerHTML = d.actions.map(a => `
    <div class="action-card" style="border-left-color:${a.color}">
      <div class="action-card-header">
        <div>
          <h4>${a.segment}</h4>
          <div class="count">${fmtN(a.count)} customers</div>
        </div>
        <div style="display:flex;gap:6px;flex-direction:column;align-items:flex-end">
          ${tierBadge(a.priority)}
          <span style="font-size:0.65rem;color:var(--text-muted)">${a.urgency}</span>
        </div>
      </div>
      <ul class="action-list">${a.actions.map(act => `<li>${act}</li>`).join('')}</ul>
      <div class="action-meta">
        <div class="action-metric"><strong class="roi-positive">$${(a.savings / 1e6).toFixed(1)}M</strong>Projected Savings</div>
        <div class="action-metric"><strong class="roi-positive">${a.roi}×</strong>ROI</div>
        <div class="action-metric"><strong style="color:${C.red}">-${a.chargeOffReduction}pp</strong>CO Reduction</div>
        <div class="action-metric"><strong style="color:var(--accent-cyan)">${a.contactMethod}</strong>Channel</div>
      </div>
    </div>`).join('');

  makeChart('roiChart', 'bar', {
    labels: d.actions.map(a => a.segment),
    datasets: [{
      label: 'Projected Savings ($M)', data: d.actions.map(a => a.savings / 1e6),
      backgroundColor: d.actions.map(a => alpha(a.color, 0.8)), borderRadius: 6
    }]
  }, {
    scales: {
      x: { title: { display: true, text: 'Segment Strategy' }, ticks: { maxRotation: 30, font: { size: 10 } } },
      y: { title: { display: true, text: 'Savings Estimate ($M)' }, ticks: { callback: v => '$' + v + 'M' } }
    }
  });

  makeChart('roiTimelineChart', 'line', {
    labels: d.roiTimeline.map(m => m.month),
    datasets: [
      { label: 'Projected', data: d.roiTimeline.map(m => m.projected / 1e6), borderColor: C.blue, fill: false, tension: 0.4, borderDash: [5, 4] },
      { label: 'Actual', data: d.roiTimeline.map(m => m.actual != null ? m.actual / 1e6 : null), borderColor: C.green, fill: false, tension: 0.4, spanGaps: false },
    ]
  }, {
    plugins: { legend: { display: true } },
    scales: {
      x: { title: { display: true, text: 'Forecast vs Performance' } },
      y: { title: { display: true, text: 'Savings Realized ($M)' }, ticks: { callback: v => '$' + v + 'M' } }
    }
  });

  makeChart('coReductionChart', 'bar', {
    labels: d.actions.map(a => a.segment),
    datasets: [{
      label: 'Charge-Off Reduction (pp)', data: d.actions.map(a => a.chargeOffReduction),
      backgroundColor: d.actions.map(a => alpha(a.color, 0.8)), borderRadius: 6
    }]
  }, {
    scales: {
      x: { title: { display: true, text: 'Target Segment' }, ticks: { maxRotation: 30, font: { size: 10 } } },
      y: { title: { display: true, text: 'CO Reduction (Percentage Points)' }, ticks: { callback: v => '-' + v + 'pp' } }
    }
  });
}

// ============================================================
// INITIALIZATION — Render all tabs on load
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
  renderPortfolioKPIs();
  renderPortfolioCharts();
  renderEWSTab();
  renderDPDTab();
  renderChargeOffTab();
  renderLossTab();
  renderSegmentTab();
  renderProductTab();
  renderGeoTab();
  renderChannelTab();
  renderVulnerabilityTab();
  renderFHSTab();
  renderActionsTab();

  // Auto-refresh every 45 seconds
  setInterval(() => {
    refreshData();
    renderPortfolioKPIs();
    document.getElementById('lastUpdate').textContent = 'just now';
  }, 45000);
});
