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
    // Generate a context-relevant mock table
    let html = `<div style="margin-bottom: 16px; font-size: 0.85rem; color: var(--text-secondary);">`;
    html += `<strong>Context:</strong> ${params.context || 'general'} | `;
    html += `<strong>Metric:</strong> ${params.metric || 'N/A'} | `;
    html += `<strong>Category:</strong> ${params.category || 'N/A'} | `;
    html += `<strong>Value:</strong> <strong style="color: var(--accent-cyan);">${params.value || 'N/A'}</strong>`;
    html += `</div>`;

    // Render a mock customer table for drilldown
    const mockRows = Math.floor(Math.random() * 15) + 10;
    html += `<div style="overflow-x:auto;">
      <table class="drilldown-table">
        <thead>
          <tr>
            <th>Customer ID</th>
            <th>Name</th>
            <th>State</th>
            <th>DPD Bucket</th>
            <th>Risk Tier</th>
            <th>FHS</th>
            <th>Primary Driver</th>
          </tr>
        </thead>
        <tbody>
    `;

    // Dummy mock generator logic extending what's in data.js
    const products = ['Payday', 'Installment', 'Auto Title', 'Pawn'];
    const states = ['TX', 'CA', 'FL', 'OH', 'GA', 'NC', 'TN'];
    const drivers = ['Income Drop', 'Loan Stacking', 'Address Change', 'Broken P2P', 'Phone Unreachable'];

    for (let i = 0; i < mockRows; i++) {
        const id = 'CNG-' + (Math.floor(Math.random() * 900000) + 100000);
        const name = "Customer " + String.fromCharCode(65 + Math.floor(Math.random() * 26));
        const state = states[Math.floor(Math.random() * states.length)];
        const dpd = Math.floor(Math.random() * 90);
        const tier = dpd > 60 ? 'Critical' : dpd > 30 ? 'High' : dpd > 10 ? 'Medium' : 'Low';
        const fhs = Math.floor(Math.random() * 80) + 20;
        const driver = drivers[Math.floor(Math.random() * drivers.length)];

        // Force category filter if applicable
        const categoryState = params.context === 'geo' ? params.category : state;

        html += `
          <tr>
            <td style="font-family: 'JetBrains Mono'; font-weight: 600;">${id}</td>
            <td>${name}</td>
            <td>${categoryState}</td>
            <td style="color: ${dpd > 60 ? 'var(--accent-red)' : dpd > 30 ? 'var(--accent-orange)' : 'var(--accent-green)'}">${dpd} DPD</td>
            <td><span class="badge badge-${tier === 'Critical' ? 'red' : tier === 'High' ? 'orange' : tier === 'Medium' ? 'yellow' : 'green'}">${tier}</span></td>
            <td>${fhs}</td>
            <td style="font-size: 0.75rem; color: var(--text-secondary);">${driver}</td>
          </tr>
        `;
    }

    html += `</tbody></table></div>`;

    html += `<div style="margin-top: 16px; text-align: right;">
        <button class="header-btn" onclick="closeDrilldown()">Close details</button>
        <button class="header-btn" style="border-color:var(--accent-cyan); color:var(--accent-cyan)" onclick="alert('Export ready.')">Export CSV</button>
    </div>`;

    return html;
}
