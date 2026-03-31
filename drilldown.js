// ============================================================
// CNG Risk Dashboard – Drilldown Logic
// ============================================================

window.handleChartClick = function (e, elements, chart) {
    if (!elements || elements.length === 0) return;
    const index = elements[0].index;
    const datasetIndex = elements[0].datasetIndex;

    // Safety check just in case
    if (!chart.data.labels || !chart.data.datasets || !chart.data.datasets[datasetIndex]) return;

    const label = chart.data.labels[index];
    const datasetLabel = chart.data.datasets[datasetIndex].label || 'Value';
    const value = chart.data.datasets[datasetIndex].data[index];

    const contextId = chart.canvas.id;

    window.openDrilldown(`Drilldown: ${label}`, { context: contextId, category: label, metric: datasetLabel, value: value });
};

// Global click delegation for KPI cards, Alert rows, Action cards
document.addEventListener('click', (e) => {
    // Check nearest actionable ancestor
    const kpiCard = e.target.closest('.kpi-card');
    if (kpiCard) {
        const label = kpiCard.querySelector('.kpi-label')?.innerText || 'KPI Detail';
        const val = kpiCard.querySelector('.kpi-value')?.innerText || '';
        window.openDrilldown(`KPI: ${label}`, { context: 'kpi', category: label, value: val });
        return;
    }

    const actionCard = e.target.closest('.action-card');
    if (actionCard) {
        const title = actionCard.querySelector('h4')?.innerText || 'Action';
        window.openDrilldown(`Action Detail: ${title}`, { context: 'action', category: title });
        return;
    }

    const geoCell = e.target.closest('.geo-cell');
    if (geoCell) {
        const state = geoCell.querySelector('.state-code')?.innerText || 'State';
        window.openDrilldown(`State Detail: ${state}`, { context: 'geo', category: state });
        return;
    }

    const alertRow = e.target.closest('.alert-row');
    if (alertRow) {
        const text = alertRow.innerText.replace(/\n.+/, ''); // get first line
        window.openDrilldown(`Alert Investigation`, { context: 'alert', category: text });
        return;
    }
});

// Style injection to add pointer cursor to clickable elements dynamically
function addPointerStyles() {
    const style = document.createElement('style');
    style.innerHTML = `
      .kpi-card, .action-card, .geo-cell, .alert-row, canvas {
          cursor: pointer !important;
      }
      .kpi-card:hover, .action-card:hover, .geo-cell:hover {
          transform: translateY(-2px) scale(1.01);
          border-color: var(--accent-cyan);
      }
    `;
    document.head.appendChild(style);
}
// Run once DOM is parsed
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', addPointerStyles);
} else {
    addPointerStyles();
}

window.openDrilldown = function (title, dataParams) {
    document.getElementById('drilldownTitle').innerText = title;

    // Generate synthetic mock data based on click parameters
    const bodyEl = document.getElementById('drilldownBody');
    bodyEl.innerHTML = generateDrilldownContent(dataParams);

    const modal = document.getElementById('drilldownModal');
    modal.classList.add('active');
};

window.closeDrilldown = function () {
    document.getElementById('drilldownModal').classList.remove('active');
};

// Close modal when clicking outside of modal content
document.addEventListener('click', (e) => {
    const modal = document.getElementById('drilldownModal');
    if (e.target === modal) {
        closeDrilldown();
    }
});

function generateDrilldownContent(params) {
    const category = params.category || '';
    const metric = params.metric || '';
    const context = params.context || '';
    const val = params.value || '';

    let html = `<div style="margin-bottom: 16px; font-size: 0.85rem; color: var(--text-secondary);">`;
    html += `<strong>Context:</strong> ${context || 'General'} | `;
    html += `<strong>Metric:</strong> ${metric || 'N/A'} | `;
    html += `<strong>Category:</strong> <span style="color:var(--text-primary)">${category || 'N/A'}</span> | `;
    html += `<strong>Value:</strong> <strong style="color: var(--accent-cyan);">${val || 'N/A'}</strong>`;
    html += `</div>`;

    // Fetch base customers from data.js
    let candidates = window.DashboardData && window.DashboardData.chargeOff ? [...window.DashboardData.chargeOff.customers] : [];

    // --- FILTERING LOGIC --- //
    const catLow = category.toLowerCase();

    // 1. DPD Buckets
    if (catLow.includes('current') || catLow.includes('0 dpd')) candidates = candidates.filter(c => c.dpd === 0);
    else if (catLow.includes('30-59')) candidates = candidates.filter(c => c.dpd >= 30 && c.dpd <= 59);
    else if (catLow.includes('60-89')) candidates = candidates.filter(c => c.dpd >= 60 && c.dpd <= 89);
    else if (catLow.includes('90+')) candidates = candidates.filter(c => c.dpd >= 90);
    else if (catLow.includes('dpd')) {
        // generic DPD catch
        candidates = candidates.sort((a, b) => b.dpd - a.dpd);
    }

    // 2. Risk Tiers
    if (catLow.includes('critical')) candidates = candidates.filter(c => c.riskTier === 'Critical');
    else if (catLow.includes('high risk') || catLow === 'high') candidates = candidates.filter(c => c.riskTier === 'High');
    else if (catLow.includes('medium')) candidates = candidates.filter(c => c.riskTier === 'Medium');
    else if (catLow === 'low') candidates = candidates.filter(c => c.riskTier === 'Low');

    // 3. Products
    if (catLow.includes('payday')) candidates = candidates.filter(c => c.product === 'Payday');
    else if (catLow.includes('installment')) candidates = candidates.filter(c => c.product === 'Installment');
    else if (catLow.includes('auto title')) candidates = candidates.filter(c => c.product === 'Auto Title');
    else if (catLow.includes('pawn')) candidates = candidates.filter(c => c.product === 'Pawn');

    // 4. Channels
    if (catLow.includes('online')) candidates = candidates.filter(c => c.channel === 'Online');
    else if (catLow.includes('retail')) candidates = candidates.filter(c => c.channel === 'Retail Store');

    // 5. States (exact or prefixed)
    const statesMatch = ['TX', 'CA', 'FL', 'OH', 'GA', 'NC', 'TN', 'MO', 'IL', 'AZ', 'NV', 'MS', 'AL', 'SC', 'KY', 'LA', 'AR', 'OK', 'WV', 'IN']
        .find(s => catLow === s.toLowerCase() || catLow.startsWith(s.toLowerCase() + ' '));
    if (statesMatch) {
        candidates = candidates.filter(c => c.state === statesMatch);
    }

    // 6. Action / Segments
    if (context === 'action' || catLow.includes('hardship') || catLow.includes('fraud')) {
        candidates = candidates.sort(() => 0.5 - Math.random()); // Shuffle
    }

    // Generate fallbacks if filter was too aggressive
    if (candidates.length === 0) {
        for (let i = 0; i < 5; i++) {
            candidates.push({
                id: 'CNG-' + (100000 + Math.floor(Math.random() * 900000)),
                name: "Customer " + String.fromCharCode(65 + Math.floor(Math.random() * 26)),
                state: statesMatch ? statesMatch : ['TX', 'OH', 'FL', 'CA'][Math.floor(Math.random() * 4)],
                product: catLow.includes('payday') ? 'Payday' : catLow.includes('pawn') ? 'Pawn' : 'Installment',
                dpd: catLow.includes('90') ? 95 : catLow.includes('60') ? 70 : catLow.includes('30') ? 45 : Math.floor(Math.random() * 120),
                riskTier: catLow.includes('critical') ? 'Critical' : catLow.includes('high') ? 'High' : 'Medium',
                fhs: Math.floor(Math.random() * 60) + 20,
                topRisks: ['Context Specific Risk']
            });
        }
    }

    // Limit to max 25 rows for cleanliness
    const displayRows = candidates.slice(0, 25);

    html += `<div style="overflow-x:auto;">
      <table class="drilldown-table">
        <thead>
          <tr>
            <th>Customer ID</th>
            <th>Name</th>
            <th>Product</th>
            <th>State</th>
            <th>DPD</th>
            <th>Risk Tier</th>
            <th>Primary Driver</th>
          </tr>
        </thead>
        <tbody>
    `;

    displayRows.forEach(c => {
        html += `
          <tr>
            <td style="font-family: 'JetBrains Mono'; font-weight: 600;">${c.id}</td>
            <td>${c.name}</td>
            <td>${c.product}</td>
            <td>${c.state}</td>
            <td style="color: ${c.dpd > 60 ? 'var(--accent-red)' : c.dpd > 30 ? 'var(--accent-orange)' : 'var(--accent-green)'}">${c.dpd} DPD</td>
            <td><span class="badge badge-${c.riskTier === 'Critical' ? 'red' : c.riskTier === 'High' ? 'orange' : c.riskTier === 'Medium' ? 'yellow' : 'green'}">${c.riskTier}</span></td>
            <td style="font-size: 0.75rem; color: var(--text-secondary);">${c.topRisks[0] || 'N/A'}</td>
          </tr>
        `;
    });

    html += `</tbody></table></div>`;

    html += `<div style="margin-top: 16px; text-align: right; font-size: 0.8rem; color: var(--text-muted); float: left; padding-top: 10px;">
        Showing ${displayRows.length} contextual record(s).
    </div>`;

    html += `<div style="margin-top: 16px; text-align: right;">
        <button class="header-btn" onclick="closeDrilldown()">Close details</button>
        <button class="header-btn" style="border-color:var(--accent-cyan); color:var(--accent-cyan)" onclick="alert('Export ready.')">Export CSV</button>
    </div>`;

    return html;
}
