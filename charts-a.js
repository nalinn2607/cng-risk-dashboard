// ============================================================
// CNG Risk Dashboard – Charts Part A (Tabs 1-6)
// ============================================================
window._chartInstances = {};
Chart.defaults.color = '#94afd4';
Chart.defaults.font.family = 'Inter';
Chart.defaults.font.size = 11;
Chart.defaults.plugins.legend.labels.boxWidth = 10;
Chart.defaults.plugins.legend.labels.padding = 14;

const C = {
    blue: '#1d6ef5', cyan: '#06b6d4', green: '#10b981',
    yellow: '#f59e0b', orange: '#f97316', red: '#ef4444',
    purple: '#8b5cf6', pink: '#ec4899', teal: '#14b8a6',
    grid: 'rgba(30,50,90,0.5)'
};

function mkChart(id, type, data, opts = {}) {
    if (window._chartInstances[id]) window._chartInstances[id].destroy();
    const ctx = document.getElementById(id);
    if (!ctx) return null;
    const base = {
        responsive: true, maintainAspectRatio: false,
        layout: { padding: { bottom: 15, left: 10, right: 10, top: 5 } },
        plugins: { tooltip: { backgroundColor: '#0c1628', borderColor: '#1e3a68', borderWidth: 1, padding: 10, cornerRadius: 8 }, legend: { display: false } }
    };
    if (['bar', 'line', 'scatter'].includes(type)) base.scales = {
        x: { grid: { color: C.grid }, ticks: { maxRotation: 0, padding: 5 }, title: { display: true, color: '#8ba1cc', font: { size: 10, weight: '700' } } },
        y: { grid: { color: C.grid }, beginAtZero: false, ticks: { padding: 5 }, title: { display: true, color: '#8ba1cc', font: { size: 10, weight: '700' } } }
    };
    const merged = deep(base, opts);
    const inst = new Chart(ctx, { type, data, options: merged });
    window._chartInstances[id] = inst;
    return inst;
}
function deep(a, b) {
    const o = { ...a };
    for (const k in b) {
        if (b[k] && typeof b[k] === 'object' && !Array.isArray(b[k]) && a[k]) o[k] = deep(a[k], b[k]);
        else o[k] = b[k];
    }
    return o;
}
function a(hex, op) {
    const r = parseInt(hex.slice(1, 3), 16), g = parseInt(hex.slice(3, 5), 16), b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r},${g},${b},${op})`;
}
function heatColor(v, mn = 0, mx = 100) {
    const t = (v - mn) / (mx - mn);
    if (t < 0.33) return `rgba(16,185,129,${0.3 + t * 0.7})`;
    if (t < 0.66) return `rgba(245,158,11,${0.3 + t * 0.5})`;
    return `rgba(239,68,68,${0.4 + t * 0.5})`;
}
function tierBadge(t) {
    const m = { Low: 'badge-green', Medium: 'badge-yellow', High: 'badge-orange', Critical: 'badge-red' };
    return `<span class="badge ${m[t] || 'badge-blue'}">${t}</span>`;
}
function fmtM(n) { return '$' + (n / 1e6).toFixed(1) + 'M'; }
function fmtK(n) { return (n / 1000).toFixed(0) + 'K'; }
function fmtN(n) { return n.toLocaleString(); }

// Animated counter
function countUp(el, target, decimals = 0, prefix = '', suffix = '') {
    if (!el) return;
    const dur = 1200, start = performance.now();
    const from = 0;
    function step(now) {
        const p = Math.min((now - start) / dur, 1);
        const ease = 1 - Math.pow(1 - p, 3);
        const val = from + (target - from) * ease;
        el.textContent = prefix + (decimals ? val.toFixed(decimals) : Math.round(val).toLocaleString()) + suffix;
        if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
}

// ── TAB 1: PORTFOLIO OVERVIEW ─────────────────────────────────
function renderPortfolioKPIs() {
    const d = DashboardData.portfolio.kpis;
    const el = document.getElementById('portfolioKPIs');
    if (!el) return;
    const kpis = [
        { icon: '💼', label: 'Active Loans', val: d.totalActiveLoans, suf: '', pre: '', dec: 0, sub: 'Total portfolio', delta: '+2.4% MoM', dir: 'up', color: C.blue },
        { icon: '👥', label: 'Total Customers', val: d.totalCustomers, suf: '', pre: '', dec: 0, sub: 'Unique borrowers', delta: '+1.8% MoM', dir: 'up', color: C.cyan },
        { icon: '💰', label: 'Total AUM', val: 352.6, suf: 'M', pre: '$', dec: 1, sub: 'Assets under mgmt', delta: '+3.1% QoQ', dir: 'up', color: C.green },
        { icon: '💵', label: 'Avg Loan Amount', val: d.avgLoanAmount, suf: '', pre: '$', dec: 0, sub: 'Per customer', delta: '-0.3% MoM', dir: 'neutral', color: C.yellow },
        { icon: '⚠️', label: 'Charge-Off MTD', val: d.chargeOffRate.MTD, suf: '%', pre: '', dec: 1, sub: 'Month to date', delta: '+0.2pp', dir: 'down', color: C.red },
        { icon: '♻️', label: 'Recovery Rate', val: d.recoveryRate, suf: '%', pre: '', dec: 1, sub: 'Collected/written-off', delta: '+1.2pp', dir: 'up', color: C.green },
        { icon: '📊', label: 'NPL Ratio', val: d.npl, suf: '%', pre: '', dec: 1, sub: 'Non-performing loans', delta: '+0.4pp', dir: 'down', color: C.orange },
        { icon: '🔄', label: 'Roll 0→30 DPD', val: d.rollRates.r0_30, suf: '%', pre: '', dec: 1, sub: '30-day roll rate', delta: '+0.4pp', dir: 'down', color: C.red },
    ];
    el.innerHTML = kpis.map((k, i) => `
    <div class="kpi-card" style="--kpi-accent:linear-gradient(90deg,${k.color},${a(k.color, 0.3)});--kpi-glow:${a(k.color, 0.06)}">
      <div class="kpi-icon">${k.icon}</div>
      <div class="kpi-label">${k.label}</div>
      <div class="kpi-value" id="kv${i}" style="color:${k.color}">0</div>
      <div class="kpi-sub">${k.sub}</div>
      <div class="kpi-delta ${k.dir}">${k.dir === 'up' ? '▲' : k.dir === 'down' ? '▼' : '—'} ${k.delta}</div>
    </div>`).join('');
    kpis.forEach((k, i) => countUp(document.getElementById('kv' + i), k.val, k.dec, k.pre, k.suf));
}

function renderPortfolioCharts() {
    const d = DashboardData.portfolio;
    mkChart('dpdDistChart', 'bar', {
        labels: ['Current (0 DPD)', '30-59 DPD', '60-89 DPD', '90+ DPD'],
        datasets: [{
            label: '% Portfolio', data: [d.kpis.dpd.d0, d.kpis.dpd.d30, d.kpis.dpd.d60, d.kpis.dpd.d90],
            backgroundColor: [a(C.green, .8), a(C.yellow, .8), a(C.orange, .8), a(C.red, .8)],
            borderRadius: 8, borderSkipped: false
        }]
    }, {
        plugins: { legend: { display: false } },
        scales: {
            x: { title: { text: 'DPD Bucket' } },
            y: { title: { text: 'Portfolio %' }, ticks: { callback: v => v + '%' }, beginAtZero: true }
        }
    });

    mkChart('portfolioTrendChart', 'line', {
        labels: d.trend.map(t => t.month),
        datasets: [
            { label: 'Total Loans', data: d.trend.map(t => t.totalLoans), borderColor: C.blue, backgroundColor: a(C.blue, .1), fill: true, tension: .4, yAxisID: 'y' },
            { label: 'Charge-Off %', data: d.trend.map(t => t.chargeOff), borderColor: C.red, backgroundColor: a(C.red, .07), fill: true, tension: .4, yAxisID: 'y1' },
            { label: 'Recovery %', data: d.trend.map(t => t.recovery), borderColor: C.green, fill: false, tension: .4, yAxisID: 'y1', borderDash: [4, 3] },
        ]
    }, {
        plugins: { legend: { display: true } }, scales: {
            x: { title: { text: 'Reporting Month' } },
            y: { title: { text: 'Loan Count' }, grid: { color: C.grid }, ticks: { callback: v => fmtK(v) } },
            y1: { title: { text: 'CO / Recov Rate' }, position: 'right', grid: { display: false }, ticks: { callback: v => v + '%' } }
        }
    });

    mkChart('productMixChart', 'doughnut', {
        labels: d.productMix.map(p => p.product),
        datasets: [{
            data: d.productMix.map(p => p.pct), backgroundColor: [C.blue, C.cyan, C.purple, C.orange],
            hoverOffset: 12, borderWidth: 3, borderColor: '#0c1628'
        }]
    }, { plugins: { legend: { display: true, position: 'bottom' } }, cutout: '68%' });

    mkChart('rollRateChart', 'bar', {
        labels: ['0→30', '30→60', '60→90', '90+→CO'],
        datasets: [{
            label: 'Roll Rate %',
            data: [d.kpis.rollRates.r0_30, d.kpis.rollRates.r30_60, d.kpis.rollRates.r60_90, d.kpis.rollRates.r90plus],
            backgroundColor: [a(C.green, .8), a(C.yellow, .8), a(C.orange, .8), a(C.red, .85)], borderRadius: 8
        }]
    }, {
        scales: {
            x: { title: { text: 'Transition' } },
            y: { title: { text: 'Roll Rate %' }, ticks: { callback: v => v + '%' }, beginAtZero: true }
        }
    });

    const co = d.kpis.chargeOffRate;
    document.getElementById('coRateDisplay').innerHTML = [
        { label: 'MTD', val: co.MTD + '%', color: C.yellow },
        { label: 'QTD', val: co.QTD + '%', color: C.orange },
        { label: 'YTD', val: co.YTD + '%', color: C.red },
        { label: 'Recovery', val: d.kpis.recoveryRate + '%', color: C.green },
    ].map(i => `<div style="text-align:center;padding:8px 16px">
    <div style="font-size:2.2rem;font-weight:900;color:${i.color};font-family:'Space Grotesk',sans-serif;letter-spacing:-2px">${i.val}</div>
    <div style="font-size:.68rem;color:var(--text-muted);text-transform:uppercase;letter-spacing:1px;margin-top:4px">${i.label}</div>
  </div>`).join('<div style="width:1px;background:var(--border);margin:8px 0"></div>');
}

// ── TAB 2: EARLY WARNING SIGNALS ──────────────────────────────
function renderEWSTab() {
    const d = DashboardData.earlyWarning;
    document.getElementById('ewsAlerts').innerHTML = [
        { level: 'critical', dot: 'critical', msg: '<strong>2,840 customers</strong> triggered ≥3 simultaneous EW signals — action required within 24h', time: '2 min ago' },
        { level: 'high', dot: 'high', msg: '<strong>NSF events spiked 34%</strong> in last 7 days — income shock indicator elevated', time: '18 min ago' },
        { level: 'medium', dot: 'medium', msg: '<strong>Call avoidance at 28.4%</strong> — contactability risk increasing across 3 states', time: '1h ago' },
    ].map(a => `<div class="alert-row ${a.level}" style="cursor:pointer">
    <div class="alert-dot ${a.dot}"></div><div style="flex:1">${a.msg}</div>
    <span class="alert-time">${a.time}</span>
  </div>`).join('');

    mkChart('ewsScoreChart', 'bar', {
        labels: d.scores.map(s => s.scoreRange),
        datasets: [{
            label: 'Customers', data: d.scores.map(s => s.count),
            backgroundColor: d.scores.map((_, i) => i < 8 ? a(C.green, .75) : i < 14 ? a(C.yellow, .75) : a(C.red, .75)),
            borderRadius: 4
        }]
    }, {
        scales: {
            x: { title: { text: 'EWS Score Range' }, ticks: { maxRotation: 45 } },
            y: { title: { text: 'Customer Count' }, ticks: { callback: v => fmtK(v) }, beginAtZero: true }
        }
    });

    const T = d.timeline;
    mkChart('ewsTrendChart', 'line', {
        labels: T.map(t => t.date),
        datasets: [
            { label: 'High Risk', data: T.map(t => t.highRisk), borderColor: C.red, backgroundColor: a(C.red, .08), fill: true, tension: .4 },
            { label: 'NSF Events', data: T.map(t => t.nsf), borderColor: C.orange, fill: false, tension: .4, borderDash: [4, 3] },
            { label: 'Call Avoid', data: T.map(t => t.callAvoidance), borderColor: C.purple, fill: false, tension: .4, borderDash: [4, 3] },
            { label: 'Stacking', data: T.map(t => t.loanStacking || 0), borderColor: C.pink, fill: false, tension: .4, borderDash: [2, 4] },
        ]
    }, {
        plugins: { legend: { display: true } },
        scales: {
            x: { title: { text: 'Observed Date' }, ticks: { maxTicksLimit: 10 } },
            y: { title: { text: 'Event Volume' }, ticks: { callback: v => fmtK(v) }, beginAtZero: true }
        }
    });

    const hm = d.heatmap;
    let ht = `<div style="overflow-x:auto"><table style="width:100%;border-collapse:collapse">
    <thead><tr><th style="padding:8px;text-align:left;font-size:.65rem;color:var(--text-muted)">Segment</th>
    ${hm[0].signals.map(s => `<th style="padding:8px;font-size:.62rem;color:var(--text-muted);text-align:center">${s.signal}</th>`).join('')}
    </tr></thead><tbody>`;
    hm.forEach(row => {
        ht += `<tr><td style="padding:8px;font-size:.76rem;font-weight:700;color:var(--text-primary);white-space:nowrap">${row.segment}</td>`;
        row.signals.forEach(s => {
            ht += `<td style="padding:4px"><div class="heatmap-cell" style="background:${heatColor(s.intensity)}">${s.intensity}%</div></td>`;
        });
        ht += '</tr>';
    });
    ht += '</tbody></table></div>';
    document.getElementById('ewsHeatmapTable').innerHTML = ht;

    const kris = d.kris || [
        { label: 'Missed Payment Reminders', val: 18.4, color: C.red },
        { label: 'Broken Promise-to-Pay %', val: 22.8, color: C.orange },
        { label: 'Bank Balance Drop >30%', val: 31.2, color: C.yellow },
        { label: 'Call Avoidance Pattern', val: 28.4, color: C.purple },
        { label: 'Loan Stacking Active', val: 14.7, color: C.red },
    ];
    document.getElementById('ewsKRIDisplay').innerHTML = kris.map(k => `
    <div class="shap-bar-item">
      <div class="shap-bar-label"><span>${k.label}</span>
        <span class="val">${k.val}%
          <span style="color:${(k.trend || 0) > 0 ? C.red : C.green};font-size:.65rem;margin-left:4px">${(k.trend || 0) > 0 ? '▲' : '▼'} ${Math.abs(k.trend || 0)}pp</span>
        </span>
      </div>
      <div class="progress-bar-wrap"><div class="progress-bar-fill" style="width:${k.val}%;background:${k.color}"></div></div>
    </div>`).join('');
}

// ── TAB 3: DPD MIGRATION ──────────────────────────────────────
function renderDPDTab() {
    const d = DashboardData.dpd;
    mkChart('dpdTrendChart', 'bar', {
        labels: d.trend.map(t => t.month),
        datasets: [
            { label: '0-29 DPD', data: d.trend.map(t => t.d0), backgroundColor: a(C.green, .75), stack: 's' },
            { label: '30-59 DPD', data: d.trend.map(t => t.d30), backgroundColor: a(C.yellow, .75), stack: 's' },
            { label: '60-89 DPD', data: d.trend.map(t => t.d60), backgroundColor: a(C.orange, .75), stack: 's' },
            { label: '90+ DPD', data: d.trend.map(t => t.d90), backgroundColor: a(C.red, .75), stack: 's' },
        ]
    }, {
        plugins: { legend: { display: true } },
        scales: {
            x: { stacked: true, title: { text: 'Month' } },
            y: { stacked: true, title: { text: '% Portfolio' }, ticks: { callback: v => v + '%' } }
        }
    });

    const mm = d.migration;
    let mH = `<div style="overflow-x:auto;font-size:.72rem">
    <table class="matrix-table" style="width:100%;border-collapse:collapse">
    <thead><tr><th style="padding:10px 8px;color:var(--text-muted);text-align:center;font-size:.62rem">From ↓ / To →</th>
    ${mm.to.map(t => `<th style="padding:8px;color:var(--text-muted);font-size:.62rem">${t}</th>`).join('')}
    </tr></thead><tbody>`;
    mm.from.forEach((f, i) => {
        mH += `<tr><td style="padding:10px 8px;font-weight:800;color:var(--text-primary);white-space:nowrap;font-size:.76rem">${f}</td>`;
        mm.data[i].forEach((v, j) => {
            if (v === 0) { mH += `<td style="padding:4px"><div class="matrix-cell" style="background:rgba(255,255,255,.03);color:var(--text-muted)">—</div></td>`; return; }
            const col = v > 40 ? C.red : v > 20 ? C.orange : v > 10 ? C.yellow : C.green;
            const change = (mm.mom_change && mm.mom_change[i] && mm.mom_change[i][j]) || 0;
            mH += `<td style="padding:4px"><div class="matrix-cell" style="background:${a(col, .2)};color:${col};margin:0 auto;flex-direction:column;gap:1px">
        <span>${v}%</span>
        ${change !== 0 ? `<span style="font-size:.55rem;opacity:.8">${change > 0 ? '↑' : '↓'}${Math.abs(change)}</span>` : ''}
      </div></td>`;
        });
        mH += '</tr>';
    });
    mH += '</tbody></table></div>';
    document.getElementById('migrationMatrixDisplay').innerHTML = mH;

    const ch = d.cohorts;
    mkChart('cohortChart', 'line', {
        labels: ['M1', 'M2', 'M3', 'M4', 'M5', 'M6'],
        datasets: ch.map((c, i) => ({
            label: c.cohort,
            data: [c.m1, c.m2, c.m3, c.m4, c.m5, c.m6],
            borderColor: [C.blue, C.cyan, C.green, C.yellow, C.orange, C.red, C.purple][i],
            tension: .4, fill: false, borderWidth: 2, pointRadius: 4, pointHoverRadius: 6
        }))
    }, {
        plugins: { legend: { display: true } },
        scales: {
            x: { title: { text: 'Months on Book (MOB)' } },
            y: { title: { text: 'Cum. Loss %' }, ticks: { callback: v => v + '%' }, beginAtZero: true }
        }
    });
}

// ── TAB 4: CHARGE-OFF PREDICTION ──────────────────────────────
function renderChargeOffTab() {
    const customers = DashboardData.chargeOff.customers;
    const critical = customers.filter(c => c.riskTier === 'Critical').length;
    const high = customers.filter(c => c.riskTier === 'High').length;
    document.getElementById('coKPIs').innerHTML = [
        { icon: '🚨', label: 'Critical Risk', val: fmtN(critical), sub: 'Avg PD-90 >70%', delta: '↑8.2% WoW', dir: 'down' },
        { icon: '⚠️', label: 'High Risk', val: fmtN(high), sub: 'Avg PD-60 >50%', delta: '↑3.4%', dir: 'down' },
        { icon: '🤖', label: 'Model AUC', val: '0.842', sub: 'XGBoost v2.4', delta: 'F1: 0.81', dir: 'up' },
        { icon: '📊', label: 'Avg PD-30', val: '28.4%', sub: 'Portfolio avg', delta: 'Stable', dir: 'neutral' },
    ].map(k => `<div class="kpi-card">
    <div class="kpi-icon">${k.icon}</div>
    <div class="kpi-label">${k.label}</div>
    <div class="kpi-value" style="font-size:1.4rem;color:${k.dir === 'down' ? C.red : k.dir === 'up' ? C.green : 'var(--text-primary)'}">${k.val}</div>
    <div class="kpi-sub">${k.sub}</div>
    <div class="kpi-delta ${k.dir}">${k.delta}</div>
  </div>`).join('');

    const bins = Array.from({ length: 10 }, (_, i) => ({ r: `${i * 10}-${i * 10 + 9}`, n: Math.round(15000 * Math.exp(-2 * Math.pow((i - 3) / 3, 2)) + Math.random() * 500) }));
    mkChart('riskHistChart', 'bar', {
        labels: bins.map(b => b.r),
        datasets: [{
            label: 'Customers', data: bins.map(b => b.n),
            backgroundColor: bins.map((_, i) => i < 4 ? a(C.green, .75) : i < 7 ? a(C.yellow, .75) : a(C.red, .8)),
            borderRadius: 6
        }]
    }, {
        scales: {
            x: { title: { text: 'Risk Score (PDx100)' } },
            y: { title: { text: 'Customer Volume' }, ticks: { callback: v => fmtK(v) }, beginAtZero: true }
        }
    });

    const shap = DashboardData.chargeOff.shap.slice(0, 10);
    document.getElementById('shapDisplay').innerHTML = shap.map(s => `
    <div class="shap-bar-item">
      <div class="shap-bar-label"><span>${s.feature}</span><span class="val">${(s.importance * 100).toFixed(0)}%</span></div>
      <div class="progress-bar-wrap"><div class="progress-bar-fill" style="width:${(s.importance * 100).toFixed(0)}%;background:${s.importance > .25 ? C.red : s.importance > .15 ? C.orange : C.blue}"></div></div>
    </div>`).join('');

    renderCustomerTable();
}

function renderCustomerTable() {
    const search = (document.getElementById('searchCustomer')?.value || '').toLowerCase();
    const tier = document.getElementById('filterTier')?.value || '';
    const rows = DashboardData.chargeOff.customers.filter(c => {
        const ms = !search || (c.id + c.name || '').toLowerCase().includes(search);
        const mt = !tier || c.riskTier === tier;
        return ms && mt;
    }).slice(0, 60);
    document.getElementById('customerTableWrap').innerHTML = `<table>
    <thead><tr><th>ID</th><th>Name</th><th>Product</th><th>State</th><th>DPD</th><th>PD-30</th><th>PD-60</th><th>PD-90</th><th>Risk Tier</th><th>Top Drivers</th></tr></thead>
    <tbody>${rows.map(r => `<tr>
      <td class="bold mono">${r.id}</td>
      <td style="color:var(--text-primary)">${r.name || ''}</td>
      <td>${r.product}</td><td>${r.state}</td>
      <td style="color:${r.dpd > 60 ? C.red : r.dpd > 30 ? C.orange : C.green};font-weight:800">${r.dpd}</td>
      <td>${r.pd30}%</td><td>${r.pd60}%</td><td>${r.pd90}%</td>
      <td>${tierBadge(r.riskTier)}</td>
      <td style="font-size:.68rem;color:var(--text-muted)">${r.topRisks.join(', ')}</td>
    </tr>`).join('')}</tbody>
  </table>`;
}

// ── TAB 5: LOSS FORECAST ──────────────────────────────────────
function renderLossTab() {
    const d = DashboardData.loss;
    document.getElementById('lossKPIs').innerHTML = [
        { icon: '💸', label: 'Expected Loss (90D)', val: fmtM(d.summary.el), sub: 'CECL estimate', delta: '↑4.2% vs last Q', dir: 'down' },
        { icon: '📉', label: 'LGD Estimate', val: d.summary.lgd + '%', sub: 'Loss given default', delta: 'Model: 0.614', dir: 'neutral' },
        { icon: '🏦', label: 'EAD', val: fmtM(d.summary.ead), sub: 'Exposure at default', delta: 'Portfolio EAD', dir: 'neutral' },
        { icon: '📋', label: 'PD (avg)', val: d.summary.pd + '%', sub: 'Probability default', delta: 'AUC: 0.84', dir: 'neutral' },
        { icon: '⏰', label: '30D Forecast', val: fmtM(d.summary.lossForecast30), sub: 'Expected 30-day', delta: 'Confidence: 87%', dir: 'neutral' },
        { icon: '🔮', label: 'Lifetime Loss Est.', val: fmtM(d.summary.lifetimeLoss), sub: 'CECL lifetime', delta: 'LTV adjusted', dir: 'neutral' },
    ].map(k => `<div class="kpi-card"><div class="kpi-icon">${k.icon}</div>
    <div class="kpi-label">${k.label}</div>
    <div class="kpi-value" style="font-size:1.3rem">${k.val}</div>
    <div class="kpi-sub">${k.sub}</div><div class="kpi-delta ${k.dir}">${k.delta}</div>
  </div>`).join('');

    mkChart('lossCurveChart', 'line', {
        labels: d.curve.map(c => c.horizon),
        datasets: [
            { label: 'Expected', data: d.curve.map(c => c.expected), borderColor: C.blue, backgroundColor: a(C.blue, .1), fill: true, tension: .4, borderWidth: 2 },
            { label: 'Upside (Optimistic)', data: d.curve.map(c => c.upside), borderColor: C.green, fill: false, tension: .4, borderDash: [5, 4] },
            { label: 'Downside (Stress)', data: d.curve.map(c => c.downside), borderColor: C.red, fill: false, tension: .4, borderDash: [5, 4] },
        ]
    }, {
        plugins: { legend: { display: true } },
        scales: {
            x: { title: { text: 'Forecast Horizon (Months)' } },
            y: { title: { text: 'Cumulative Loss ($M)' }, ticks: { callback: v => '$' + v + 'M' }, beginAtZero: true }
        }
    });

    mkChart('lossProductChart', 'bar', {
        labels: d.byProduct.map(p => p.product),
        datasets: [
            {
                label: 'Expected Loss ($M)', data: d.byProduct.map(p => p.el / 1e6),
                backgroundColor: [a(C.blue, .8), a(C.cyan, .8), a(C.purple, .8), a(C.orange, .8)], borderRadius: 8
            },
        ]
    }, {
        scales: {
            x: { title: { text: 'Loan Product' } },
            y: { title: { text: 'Expected Loss ($M)' }, ticks: { callback: v => '$' + v + 'M' }, beginAtZero: true }
        }
    });

    mkChart('lossSegmentChart', 'doughnut', {
        labels: d.bySegment.map(s => s.segment),
        datasets: [{
            data: d.bySegment.map(s => s.el / 1e6),
            backgroundColor: [C.green, C.yellow, C.red, C.purple, C.pink, C.orange].map(c => a(c, .82)),
            borderWidth: 3, borderColor: '#0c1628', hoverOffset: 10
        }]
    }, { plugins: { legend: { display: true, position: 'bottom' } }, cutout: '52%' });
}

// ── TAB 6: BEHAVIOURAL SEGMENTATION ──────────────────────────
function renderSegmentTab() {
    const d = DashboardData.segmentation;
    const colors = ['#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#f97316'];
    const segNames = ['Reliable Thin-File', 'Temporary Hardship', 'Chronic Delinquent', 'Strategic Defaulter', 'Fraud Risk', 'Pawn-Default Risk'];
    const pts = d.clusters.points.filter((_, i) => i % 8 === 0);

    mkChart('scatterChart', 'scatter', {
        datasets: [0, 1, 2, 3, 4, 5].map(si => ({
            label: segNames[si],
            data: pts.filter(p => p.seg === si).map(p => ({ x: p.x, y: p.y })),
            backgroundColor: a(colors[si], .65),
            pointRadius: 3.5, pointHoverRadius: 6
        }))
    }, {
        plugins: { legend: { display: true, position: 'bottom' } },
        scales: {
            x: { title: { display: true, text: 'Risk Score (0-100)' }, min: 0, max: 100, grid: { color: C.grid } },
            y: { title: { display: true, text: 'Engagement Score (0-100)' }, min: 0, max: 100, grid: { color: C.grid } }
        }
    });

    mkChart('segmentSizeChart', 'doughnut', {
        labels: d.sizes.map(s => s.segment),
        datasets: [{ data: d.sizes.map(s => s.size), backgroundColor: colors.map(c => a(c, .82)), borderWidth: 3, borderColor: '#0c1628', hoverOffset: 10 }]
    }, { plugins: { legend: { display: true, position: 'bottom' } }, cutout: '55%' });

    document.getElementById('segmentDetailTable').innerHTML = `
    <table><thead><tr><th>Segment</th><th>Customers</th><th>% Portfolio</th><th>Charge-Off %</th><th>Recovery %</th><th>Avg DPD</th><th>Avg FHS</th><th>Risk</th></tr></thead>
    <tbody>${d.sizes.map((s, i) => `<tr>
      <td class="bold" style="color:${colors[i]}">${s.segment}</td>
      <td>${fmtN(s.size)}</td>
      <td>${((s.size / 201847) * 100).toFixed(1)}%</td>
      <td style="color:${s.chargeOff > 30 ? C.red : s.chargeOff > 10 ? C.orange : C.green};font-weight:800">${s.chargeOff}%</td>
      <td style="color:${s.recovery > 50 ? C.green : s.recovery > 30 ? C.yellow : C.red};font-weight:800">${s.recovery}%</td>
      <td>${s.avgDPD || '—'}</td>
      <td>${s.avgFHS || '—'}</td>
      <td>${tierBadge(s.chargeOff > 40 ? 'Critical' : s.chargeOff > 20 ? 'High' : s.chargeOff > 8 ? 'Medium' : 'Low')}</td>
    </tr>`).join('')}</tbody></table>`;
}
