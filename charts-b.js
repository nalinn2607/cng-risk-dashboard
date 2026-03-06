// ============================================================
// CNG Risk Dashboard – Charts Part B (Tabs 7-12 + Init)
// ============================================================

// ── TAB 7: PRODUCT RISK ───────────────────────────────────────
function renderProductTab() {
    const d = DashboardData.productRisk;
    const pc = [C.blue, C.cyan, C.purple, C.orange];
    document.getElementById('productKPICards').innerHTML =
        `<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:14px;margin-bottom:16px">` +
        d.map((p, i) => `<div class="card" style="border-top:3px solid ${pc[i]};padding:18px">
      <div style="font-size:.72rem;font-weight:800;text-transform:uppercase;letter-spacing:1px;color:${pc[i]};margin-bottom:12px">${p.product}</div>
      <div class="stat-row"><span class="stat-label">Avg DPD</span><span class="stat-val" style="color:${p.avgDPD > 30 ? C.red : C.yellow}">${p.avgDPD}</span></div>
      <div class="stat-row"><span class="stat-label">Charge-Off</span><span class="stat-val" style="color:${p.chargeOff > 5 ? C.red : C.green}">${p.chargeOff}%</span></div>
      <div class="stat-row"><span class="stat-label">Recovery</span><span class="stat-val" style="color:${p.recovery > 50 ? C.green : C.yellow}">${p.recovery}%</span></div>
      <div class="stat-row"><span class="stat-label">PD</span><span class="stat-val">${p.pd}%</span></div>
      <div class="stat-row"><span class="stat-label">LGD</span><span class="stat-val">${p.lgd}%</span></div>
      <div class="stat-row" style="border:none"><span class="stat-label">YoY Growth</span>
        <span class="stat-val" style="color:${p.yoyGrowth > 0 ? C.green : C.red}">${p.yoyGrowth > 0 ? '+' : ''}${p.yoyGrowth}%</span></div>
    </div>`).join('') + '</div>';

    mkChart('productCOChart', 'bar', {
        labels: d.map(p => p.product),
        datasets: [{ label: 'Charge-Off %', data: d.map(p => p.chargeOff), backgroundColor: pc.map(c => a(c, .8)), borderRadius: 10 }]
    }, {
        scales: {
            x: { title: { text: 'Loan Product' } },
            y: { title: { text: 'Charge-Off Rate' }, ticks: { callback: v => v + '%' }, beginAtZero: true }
        }
    });

    mkChart('productDPDChart', 'bar', {
        labels: d.map(p => p.product),
        datasets: [
            { label: 'Avg DPD', data: d.map(p => p.avgDPD), backgroundColor: pc.map(c => a(c, .75)), borderRadius: 8, yAxisID: 'y' },
            { label: 'Recovery %', data: d.map(p => p.recovery), backgroundColor: pc.map(c => a(c, .35)), borderRadius: 8, yAxisID: 'y1' },
        ]
    }, {
        plugins: { legend: { display: true } },
        scales: {
            x: { title: { text: 'Loan Product' } },
            y: { title: { text: 'Average DPD' }, grid: { color: C.grid } },
            y1: { title: { text: 'Recovery Rate' }, position: 'right', grid: { display: false }, ticks: { callback: v => v + '%' } }
        }
    });

    document.getElementById('productTableWrap').innerHTML = `<table>
    <thead><tr><th>Product</th><th>Avg DPD</th><th>PD</th><th>LGD</th><th>Charge-Off %</th><th>Recovery %</th><th>Roll 30→60</th><th>YoY Growth</th></tr></thead>
    <tbody>${d.map((p, i) => `<tr>
      <td class="bold" style="color:${pc[i]}">${p.product}</td>
      <td style="color:${p.avgDPD > 30 ? C.red : C.yellow};font-weight:800">${p.avgDPD}</td>
      <td>${p.pd}%</td><td>${p.lgd}%</td>
      <td style="color:${p.chargeOff > 5 ? C.red : C.green};font-weight:800">${p.chargeOff}%</td>
      <td style="color:${p.recovery > 50 ? C.green : C.yellow};font-weight:800">${p.recovery}%</td>
      <td>${p.rollRate30_60}%</td>
      <td style="color:${p.yoyGrowth > 0 ? C.green : C.red};font-weight:800">${p.yoyGrowth > 0 ? '+' : ''}${p.yoyGrowth}%</td>
    </tr>`).join('')}</tbody></table>`;
}

// ── TAB 8: GEOGRAPHIC RISK ────────────────────────────────────
function renderGeoTab() {
    const d = [...DashboardData.geoRisk].sort((a, b) => b.riskScore - a.riskScore);
    document.getElementById('geoAlerts').innerHTML = d.filter(s => s.layoffRisk === 'High').slice(0, 3)
        .map(s => `<div class="alert-row high">
      <div class="alert-dot high"></div>
      <div><strong>${s.state}</strong>: Layoff risk HIGH — CO ${s.chargeOff}%, Roll Rate ${s.rollRate}%, Unemployment ${s.unemployment}%</div>
    </div>`).join('');

    const maxCO = Math.max(...d.map(s => s.chargeOff));
    document.getElementById('geoHeatmapGrid').innerHTML = '<div class="geo-grid">' +
        d.map(s => `<div class="geo-cell" style="background:${heatColor(s.chargeOff, 1, maxCO)}" title="${s.state}: CO ${s.chargeOff}% | Roll ${s.rollRate}% | ${fmtN(s.activeLoans)} loans">
      <div class="state-code">${s.state}</div>
      <div class="state-val">CO: ${s.chargeOff}%</div>
      <div class="state-val">${fmtK(s.activeLoans)} loans</div>
    </div>`).join('') + '</div>';

    const top10 = d.slice(0, 10);
    mkChart('geoBarChart', 'bar', {
        labels: top10.map(s => s.state),
        datasets: [{
            label: 'Risk Score', data: top10.map(s => s.riskScore),
            backgroundColor: top10.map(s => s.riskScore > 70 ? a(C.red, .8) : s.riskScore > 50 ? a(C.orange, .8) : a(C.yellow, .8)),
            borderRadius: 8
        }]
    }, {
        scales: {
            x: { title: { text: 'State' } },
            y: { title: { text: 'Risk Score (0-100)' }, max: 100, beginAtZero: true }
        }
    });

    document.getElementById('geoTableWrap').innerHTML = `<div style="max-height:300px;overflow-y:auto"><table>
    <thead><tr><th>State</th><th>Risk Score</th><th>Charge-Off %</th><th>Roll Rate</th><th>Loans</th><th>Unemployment</th><th>Avg DPD</th><th>Layoff Risk</th></tr></thead>
    <tbody>${d.slice(0, 20).map(s => `<tr>
      <td class="bold">${s.state}</td>
      <td><span style="font-weight:800;color:${s.riskScore > 70 ? C.red : s.riskScore > 50 ? C.orange : C.green}">${s.riskScore}</span></td>
      <td>${s.chargeOff}%</td><td>${s.rollRate}%</td>
      <td>${fmtN(s.activeLoans)}</td><td>${s.unemployment}%</td>
      <td>${s.avgDPD || '—'}</td>
      <td>${tierBadge(s.layoffRisk === 'High' ? 'Critical' : s.layoffRisk === 'Medium' ? 'Medium' : 'Low')}</td>
    </tr>`).join('')}</tbody></table></div>`;
}

// ── TAB 9: CHANNEL RISK ───────────────────────────────────────
function renderChannelTab() {
    const d = DashboardData.channelRisk;
    document.getElementById('channelCards').innerHTML =
        `<div style="display:grid;grid-template-columns:1fr 1fr;gap:16px">` +
        d.map((ch, i) => `<div class="card" style="border-top:3px solid ${[C.blue, C.cyan][i]}">
      <div style="font-size:.95rem;font-weight:800;margin-bottom:14px;color:${[C.blue, C.cyan][i]};font-family:'Space Grotesk',sans-serif">
        ${ch.channel === 'Online' ? '🌐' : '🏪'} ${ch.channel}
      </div>
      <div class="stat-row"><span class="stat-label">Active Loans</span><span class="stat-val">${fmtN(ch.activeLoans)}</span></div>
      <div class="stat-row"><span class="stat-label">Avg Loan</span><span class="stat-val">$${ch.avgLoan.toLocaleString()}</span></div>
      <div class="stat-row"><span class="stat-label">Avg DPD</span><span class="stat-val" style="color:${ch.avgDPD > 25 ? C.orange : C.green}">${ch.avgDPD}</span></div>
      <div class="stat-row"><span class="stat-label">Charge-Off %</span><span class="stat-val" style="color:${ch.chargeOff > 4 ? C.red : C.yellow}">${ch.chargeOff}%</span></div>
      <div class="stat-row"><span class="stat-label">Recovery %</span><span class="stat-val" style="color:${ch.recovery > 37 ? C.green : C.yellow}">${ch.recovery}%</span></div>
      <div class="stat-row" style="border:none"><span class="stat-label">Contact Rate</span><span class="stat-val" style="color:${ch.contactRate > 75 ? C.green : C.orange}">${ch.contactRate || '—'}%</span></div>
    </div>`).join('') + '</div>';

    mkChart('channelDPDChart', 'line', {
        labels: d[0].trend.map(t => t.month),
        datasets: d.map((ch, i) => ({
            label: ch.channel, data: ch.trend.map(t => t.dpd),
            borderColor: [C.blue, C.cyan][i], backgroundColor: a([C.blue, C.cyan][i], .08), fill: i === 0, tension: .4
        }))
    }, {
        plugins: { legend: { display: true } },
        scales: {
            x: { title: { text: 'Reporting Month' } },
            y: { title: { text: 'Average DPD' } }
        }
    });

    mkChart('channelCOChart', 'line', {
        labels: d[0].trend.map(t => t.month),
        datasets: d.map((ch, i) => ({
            label: ch.channel, data: ch.trend.map(t => t.co),
            borderColor: [C.orange, C.purple][i], fill: false, tension: .4
        }))
    }, {
        plugins: { legend: { display: true } },
        scales: {
            x: { title: { text: 'Reporting Month' } },
            y: { title: { text: 'Charge-Off Rate' }, ticks: { callback: v => v + '%' } }
        }
    });

    mkChart('channelRadarChart', 'radar', {
        labels: ['Avg DPD', 'Charge-Off', 'Recovery', 'Roll Rate', 'Avg Loan ($00)'],
        datasets: d.map((ch, i) => ({
            label: ch.channel,
            data: [ch.avgDPD, ch.chargeOff * 5, ch.recovery / 3, ch.rollRate, ch.avgLoan / 100],
            borderColor: [C.blue, C.cyan][i], backgroundColor: a([C.blue, C.cyan][i], .15), pointBackgroundColor: [C.blue, C.cyan][i]
        }))
    }, {
        plugins: { legend: { display: true } },
        scales: {
            r: { grid: { color: C.grid }, ticks: { display: false }, title: { display: true, text: 'Metric Normalized Value' } }
        }
    });
}

// ── TAB 10: VULNERABILITY SCORE ───────────────────────────────
function renderVulnerabilityTab() {
    const d = DashboardData.vulnerability;
    mkChart('vulnTierChart', 'doughnut', {
        labels: d.tierDist.map(t => t.tier),
        datasets: [{ data: d.tierDist.map(t => t.pct), backgroundColor: d.tierDist.map(t => a(t.color, .82)), borderWidth: 3, borderColor: '#0c1628', hoverOffset: 12 }]
    }, { plugins: { legend: { display: true, position: 'bottom' } }, cutout: '60%' });

    mkChart('vulnCategoryChart', 'bar', {
        labels: d.categories.map(c => c.name),
        datasets: [{
            label: 'Avg Vulnerability Score', data: d.categories.map(c => c.avgScore),
            backgroundColor: d.categories.map(c => c.avgScore > 65 ? a(C.red, .8) : c.avgScore > 50 ? a(C.orange, .8) : a(C.yellow, .75)),
            borderRadius: 8
        }]
    }, {
        scales: {
            x: { title: { text: 'Category' }, ticks: { maxRotation: 25, font: { size: 10 } } },
            y: { title: { text: 'Composite Score (0-100)' }, max: 100, beginAtZero: true }
        }
    });

    document.getElementById('vulnTableWrap').innerHTML = `<table>
    <thead><tr><th>Category</th><th>Weight</th><th>Avg Score</th><th>Borrowers</th><th>Avg DPD</th><th>Charge-Off %</th><th>Recovery %</th><th>Severity</th></tr></thead>
    <tbody>${d.categories.map(c => `<tr>
      <td class="bold">${c.name}</td>
      <td style="color:var(--text-muted)">${((c.weight || 0) * 100).toFixed(0)}%</td>
      <td><div style="display:flex;align-items:center;gap:8px">
        <div class="progress-bar-wrap" style="width:70px"><div class="progress-bar-fill" style="width:${c.avgScore}%;background:${c.avgScore > 65 ? C.red : c.avgScore > 50 ? C.orange : C.yellow}"></div></div>
        <span style="font-family:'JetBrains Mono',monospace;font-weight:800">${c.avgScore}</span>
      </div></td>
      <td>${fmtN(c.borrowers || 0)}</td>
      <td style="color:${c.avgDPD > 50 ? C.red : C.orange}">${c.avgDPD}</td>
      <td style="color:${c.chargeOff > 20 ? C.red : C.orange}">${c.chargeOff}%</td>
      <td style="color:${c.recovery > 35 ? C.green : C.yellow}">${c.recovery}%</td>
      <td>${tierBadge(c.avgScore > 70 ? 'Critical' : c.avgScore > 55 ? 'High' : c.avgScore > 40 ? 'Medium' : 'Low')}</td>
    </tr>`).join('')}</tbody></table>`;
}

// ── TAB 11: FINANCIAL HEALTH SCORE ───────────────────────────
function renderFHSTab() {
    const d = DashboardData.fhs;
    const pc = [C.green, C.blue, C.orange, C.purple, C.cyan, C.yellow];
    document.getElementById('pillarBars').innerHTML = d.pillars.map((p, i) => `
    <div class="pillar-bar">
      <div class="pillar-name">${p.pillar} <span style="color:var(--text-muted)">(${(p.weight * 100).toFixed(0)}%)</span></div>
      <div class="pillar-track"><div class="pillar-fill" style="width:${p.avgScore}%;background:${pc[i]}"></div></div>
      <div class="pillar-val" style="color:${pc[i]}">${p.avgScore}</div>
      <div style="font-size:.62rem;color:var(--text-muted);width:60px;text-align:right">Industry: ${p.industry || '—'}</div>
    </div>`).join('');

    mkChart('fhsDistChart', 'bar', {
        labels: d.distribution.map(b => b.range),
        datasets: [{
            label: 'Customers', data: d.distribution.map(b => b.count),
            backgroundColor: d.distribution.map((_, i) => i < 7 ? a(C.red, .75) : i < 11 ? a(C.orange, .75) : i < 15 ? a(C.yellow, .75) : a(C.green, .8)),
            borderRadius: 4
        }]
    }, {
        scales: {
            x: { title: { text: 'FHS Range' }, ticks: { maxRotation: 45 } },
            y: { title: { text: 'Customer Frequency' }, ticks: { callback: v => fmtK(v) }, beginAtZero: true }
        }
    });

    mkChart('fhsTrendChart', 'line', {
        labels: d.trend.map(t => t.month),
        datasets: [
            { label: 'Excellent', data: d.trend.map(t => t.excellent), borderColor: C.green, fill: false, tension: .4 },
            { label: 'Good', data: d.trend.map(t => t.good), borderColor: C.blue, fill: false, tension: .4 },
            { label: 'Watchlist', data: d.trend.map(t => t.watchlist), borderColor: C.yellow, fill: false, tension: .4 },
            { label: 'High Risk', data: d.trend.map(t => t.highRisk), borderColor: C.orange, fill: false, tension: .4 },
            { label: 'Critical', data: d.trend.map(t => t.critical), borderColor: C.red, fill: false, tension: .4 },
        ]
    }, {
        plugins: { legend: { display: true } },
        scales: {
            x: { title: { text: 'Monthly Trend' } },
            y: { title: { text: 'FHS Tier %' }, ticks: { callback: v => v + '%' } }
        }
    });

    mkChart('fhsVsCOChart', 'bar', {
        labels: d.vsChargeOff.map(b => b.fhsBucket),
        datasets: [{
            label: 'Charge-Off %', data: d.vsChargeOff.map(b => b.chargeOff),
            backgroundColor: d.vsChargeOff.map((_, i) => i < 4 ? a(C.red, .8) : i < 7 ? a(C.orange, .7) : a(C.green, .75)),
            borderRadius: 6
        }]
    }, {
        scales: {
            x: { title: { text: 'FHS Bucket' }, ticks: { maxRotation: 45 } },
            y: { title: { text: 'Expected CO %' }, ticks: { callback: v => v + '%' }, beginAtZero: true }
        }
    });

    mkChart('fhsVsDPDChart', 'bar', {
        labels: d.vsDPD.map(b => b.fhsTier),
        datasets: [{
            label: 'Avg DPD', data: d.vsDPD.map(b => b.avgDPD),
            backgroundColor: d.vsDPD.map(b => a(b.color || C.blue, .8)), borderRadius: 8
        }]
    }, {
        scales: {
            x: { title: { text: 'FHS Tier' } },
            y: { title: { text: 'Observed Avg DPD' }, ticks: { callback: v => v + ' DPD' }, beginAtZero: true }
        }
    });

    mkChart('fhsProductChart', 'bar', {
        labels: d.byProduct.map(p => p.product),
        datasets: [
            { label: 'Excellent', data: d.byProduct.map(p => p.excellent), backgroundColor: a(C.green, .8), stack: 's', borderRadius: 4 },
            { label: 'Good', data: d.byProduct.map(p => p.good), backgroundColor: a(C.blue, .8), stack: 's' },
            { label: 'Watchlist', data: d.byProduct.map(p => p.watchlist), backgroundColor: a(C.yellow, .8), stack: 's' },
            { label: 'High Risk', data: d.byProduct.map(p => p.highRisk), backgroundColor: a(C.orange, .8), stack: 's' },
            { label: 'Critical', data: d.byProduct.map(p => p.critical), backgroundColor: a(C.red, .8), stack: 's' },
        ]
    }, {
        plugins: { legend: { display: true } },
        scales: {
            x: { stacked: true, title: { text: 'Loan Product' } },
            y: { stacked: true, title: { text: 'FHS Profile Mix %' }, ticks: { callback: v => v + '%' } }
        }
    });

    const tiers = [
        { tier: 'Excellent (80–100)', color: C.green, actions: ['Offer better loan terms', 'Upsell installment loan', 'Loyalty rewards enrollment'] },
        { tier: 'Good (65–79)', color: C.blue, actions: ['Monitor regularly', 'Send proactive reminders', 'Maintain credit limit'] },
        { tier: 'Watchlist (50–64)', color: C.yellow, actions: ['Early intervention call', 'Offer hardship plan', 'Reduce exposure'] },
        { tier: 'High Risk (35–49)', color: C.orange, actions: ['Intensive collections', 'Payment restructuring', 'Skip tracing'] },
        { tier: 'Critical (0–34)', color: C.red, actions: ['Legal escalation', 'Repossess collateral', 'Write-off planning'] },
    ];
    document.getElementById('fhsTierActions').innerHTML = `<div style="display:grid;grid-template-columns:repeat(5,1fr);gap:10px">` +
        tiers.map(t => `<div style="border-top:3px solid ${t.color};padding:14px;background:var(--bg-surface);border-radius:10px;border:1px solid var(--border)">
      <div style="font-size:.74rem;font-weight:800;color:${t.color};margin-bottom:10px;font-family:'Space Grotesk',sans-serif">${t.tier}</div>
      ${t.actions.map(ac => `<div style="font-size:.7rem;color:var(--text-secondary);padding:3px 0;display:flex;align-items:center;gap:5px"><span style="color:${t.color}">→</span>${ac}</div>`).join('')}
    </div>`).join('') + '</div>';
}

// ── TAB 12: AI ACTION RECOMMENDATIONS ────────────────────────
function renderActionsTab() {
    const d = DashboardData.actions;
    document.getElementById('actionCards').innerHTML = d.actions.map(ac => `
    <div class="action-card" style="border-left-color:${ac.color};">
      <div class="action-card-header">
        <div>
          <h4>${ac.segment}</h4>
          <div class="count">${fmtN(ac.count)} customers · ${ac.contactMethod}</div>
        </div>
        <div style="display:flex;gap:6px;flex-direction:column;align-items:flex-end">
          ${tierBadge(ac.priority)}
          <span style="font-size:.62rem;color:var(--text-muted)">${ac.urgency}</span>
          <span style="font-size:.62rem;color:${C.green};font-weight:700">${ac.liftModel || ''}</span>
        </div>
      </div>
      <ul class="action-list">${ac.actions.map(a => `<li>${a}</li>`).join('')}</ul>
      <div class="action-meta">
        <div class="action-metric"><strong class="roi-positive">$${(ac.savings / 1e6).toFixed(1)}M</strong>Proj. Savings</div>
        <div class="action-metric"><strong class="roi-positive">${ac.roi}×</strong>ROI</div>
        <div class="action-metric"><strong style="color:${C.red}">-${ac.chargeOffReduction}pp</strong>CO Reduction</div>
        <div class="action-metric"><strong style="color:${C.cyan}">${ac.expectedResponse || '—'}</strong>Exp. Response</div>
      </div>
    </div>`).join('');

    mkChart('roiChart', 'bar', {
        labels: d.actions.map(ac => ac.segment),
        datasets: [{
            label: 'Projected Savings ($M)', data: d.actions.map(ac => ac.savings / 1e6),
            backgroundColor: d.actions.map(ac => a(ac.color, .8)), borderRadius: 8
        }]
    }, {
        scales: {
            x: { title: { text: 'Action Strategy' }, ticks: { maxRotation: 30, font: { size: 10 } } },
            y: { title: { text: 'Savings estimate ($M)' }, ticks: { callback: v => '$' + v + 'M' }, beginAtZero: true }
        }
    });

    mkChart('roiTimelineChart', 'line', {
        labels: d.roiTimeline.map(m => m.month),
        datasets: [
            { label: 'Projected', data: d.roiTimeline.map(m => m.projected / 1e6), borderColor: C.blue, fill: false, tension: .4, borderDash: [5, 4] },
            { label: 'Actual', data: d.roiTimeline.map(m => m.actual != null ? m.actual / 1e6 : null), borderColor: C.green, fill: false, tension: .4, spanGaps: false },
        ]
    }, {
        plugins: { legend: { display: true } },
        scales: {
            x: { title: { text: 'Monthly Performance' } },
            y: { title: { text: 'Realized Savings ($M)' }, ticks: { callback: v => '$' + v + 'M' }, beginAtZero: true }
        }
    });

    mkChart('coReductionChart', 'bar', {
        labels: d.actions.map(ac => ac.segment),
        datasets: [{
            label: 'CO Reduction (pp)', data: d.actions.map(ac => ac.chargeOffReduction),
            backgroundColor: d.actions.map(ac => a(ac.color, .8)), borderRadius: 8
        }]
    }, {
        scales: {
            x: { title: { text: 'Target Segment' }, ticks: { maxRotation: 30, font: { size: 10 } } },
            y: { title: { text: 'CO reduction pt.' }, ticks: { callback: v => '-' + v + 'pp' }, beginAtZero: true }
        }
    });
}

// ── INIT ──────────────────────────────────────────────────────
// Scripts load at end of body so DOM is ready; Chart.js loaded before this file.
function initDashboard() {
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
}

// Run immediately — all deps (Chart.js, data.js) are already parsed above us.
initDashboard();
