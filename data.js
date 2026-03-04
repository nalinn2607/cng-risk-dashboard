// ============================================================
// CNG Holdings – Risk Dashboard · Data Engine v2
// Comprehensive simulated data for all 12 dashboard tabs
// ============================================================

const PRODUCTS = ['Payday', 'Installment', 'Auto Title', 'Pawn'];
const STATES = ['TX', 'CA', 'FL', 'OH', 'GA', 'NC', 'TN', 'MO', 'IL', 'AZ', 'NV', 'MS', 'AL', 'SC', 'KY', 'LA', 'AR', 'OK', 'WV', 'IN'];
const CHANNELS = ['Online', 'Retail Store'];
const RISK_TIERS = ['Low', 'Medium', 'High', 'Critical'];
const SEGMENTS = ['Reliable Thin-File', 'Temporary Hardship', 'Chronic Delinquent', 'Strategic Defaulter', 'Fraud Risk', 'Pawn-Default Risk'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const MONTHS_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const WEEKS = ['Wk 1', 'Wk 2', 'Wk 3', 'Wk 4', 'Wk 5', 'Wk 6', 'Wk 7', 'Wk 8', 'Wk 9', 'Wk 10', 'Wk 11', 'Wk 12'];

function rand(min, max, decimals = 0) {
    const v = Math.random() * (max - min) + min;
    return decimals ? parseFloat(v.toFixed(decimals)) : Math.round(v);
}
function randChoice(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function seededRand(seed, min, max, dec = 0) {
    const x = Math.sin(seed + 1) * 10000;
    const v = (x - Math.floor(x)) * (max - min) + min;
    return dec ? parseFloat(v.toFixed(dec)) : Math.round(v);
}
function trend(base, drift, noise, n) {
    let v = base;
    return Array.from({ length: n }, () => {
        v += drift + (Math.random() - 0.5) * noise;
        return parseFloat(v.toFixed(2));
    });
}

// ── Portfolio Overview ────────────────────────────────────────
function genPortfolioKPIs() {
    return {
        totalActiveLoans: 248_312,
        totalCustomers: 201_847,
        avgLoanAmount: 1_420,
        avgTenure: 8.4,
        totalAUM: 352_600_000,
        newOriginations30D: 18_420,
        chargeOffRate: { MTD: 3.2, QTD: 3.8, YTD: 4.1 },
        recoveryRate: 34.6,
        recoveryAmount: 4_820_000,
        netLossRate: 2.1,
        rollRates: { r0_30: 8.4, r30_60: 22.1, r60_90: 38.7, r90plus: 61.2 },
        dpd: { d0: 76.2, d30: 10.8, d60: 7.4, d90: 5.6 },
        npl: 23.8,
        provisionCoverage: 142.3,
        costOfRisk: 5.6,
    };
}

function genPortfolioTrend() {
    const baseLoans = 210_000;
    const baseCO = 3.0;
    const baseRecovery = 32.0;
    return MONTHS.map((m, i) => ({
        month: m,
        totalLoans: Math.round(baseLoans + i * 3_200 + rand(-800, 800)),
        chargeOff: parseFloat((baseCO + i * 0.09 + (Math.random() - 0.5) * 0.25).toFixed(2)),
        recovery: parseFloat((baseRecovery + i * 0.22 + (Math.random() - 0.5) * 0.8).toFixed(1)),
        newOriginations: rand(16000, 26000),
        npl: parseFloat((22 + i * 0.18 + (Math.random() - 0.5) * 0.5).toFixed(1)),
        costOfRisk: parseFloat((5.1 + i * 0.04 + (Math.random() - 0.5) * 0.15).toFixed(2)),
    }));
}

function genProductMix() {
    return [
        { product: 'Payday', pct: 34, volume: 84_420, avgBalance: 420, yoy: +4.2 },
        { product: 'Installment', pct: 38, volume: 94_358, avgBalance: 2_180, yoy: +8.7 },
        { product: 'Auto Title', pct: 16, volume: 39_730, avgBalance: 3_640, yoy: -1.3 },
        { product: 'Pawn', pct: 12, volume: 29_804, avgBalance: 680, yoy: -2.1 },
    ];
}

// ── Early Warning Signals ─────────────────────────────────────
function genEarlyWarningScores() {
    return Array.from({ length: 20 }, (_, i) => ({
        scoreRange: `${i * 5}-${i * 5 + 4}`,
        count: Math.round(12000 * Math.exp(-0.15 * Math.abs(i - 12)) + rand(200, 800)),
    }));
}

function genRiskHeatmap() {
    const segments = ['New Borrowers', 'Repeat Customers', 'High-Utilization', 'Multi-Product', 'Income-Volatile'];
    const signals = ['NSF Events', 'Loan Stacking', 'Broken P2P', 'Income Drop', 'Address Change'];
    return segments.map(seg => ({
        segment: seg,
        signals: signals.map(s => ({ signal: s, intensity: rand(10, 95) })),
    }));
}

function genEWSTimeline() {
    return Array.from({ length: 30 }, (_, i) => {
        const d = new Date(2026, 1, 1);
        d.setDate(d.getDate() + i);
        return {
            date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            highRisk: rand(3200, 4800),
            medRisk: rand(8000, 12000),
            lowRisk: rand(15000, 20000),
            nsf: rand(800, 1600),
            callAvoidance: rand(1200, 2400),
            loanStacking: rand(400, 900),
        };
    });
}

function genEWSKRIs() {
    return [
        { label: 'Missed Payment Reminders', val: 18.4, weight: 0.25, trend: +2.1, color: '#ef4444' },
        { label: 'Broken Promise-to-Pay %', val: 22.8, weight: 0.15, trend: -0.8, color: '#f97316' },
        { label: 'Bank Balance Drop >30%', val: 31.2, weight: 0.20, trend: +4.3, color: '#f59e0b' },
        { label: 'Call Avoidance Pattern', val: 28.4, weight: 0.10, trend: +1.2, color: '#8b5cf6' },
        { label: 'Loan Stacking Active', val: 14.7, weight: 0.30, trend: -0.5, color: '#ef4444' },
    ];
}

// ── DPD Migration ──────────────────────────────────────────────
function genDPDTrend() {
    return MONTHS.map((m, i) => ({
        month: m,
        d0: rand(72, 80),
        d30: rand(8, 14),
        d60: rand(5, 10),
        d90: rand(3, 8),
    }));
}

function genMigrationMatrix() {
    return {
        from: ['0-29 DPD', '30-59 DPD', '60-89 DPD', '90+ DPD'],
        to: ['0-29 DPD', '30-59 DPD', '60-89 DPD', '90+ DPD', 'Charged Off'],
        data: [
            [72.4, 18.2, 5.8, 2.4, 1.2],
            [22.3, 43.1, 25.8, 5.6, 3.2],
            [8.1, 12.4, 38.6, 30.2, 10.7],
            [2.1, 3.2, 7.4, 51.8, 35.5],
        ],
        mom_change: [
            [+0.4, -0.7, +0.2, +0.1, 0],
            [-0.8, +0.3, +0.4, +0.1, 0],
            [+0.2, -0.1, -0.5, +0.8, -0.4],
            [+0.1, 0, +0.2, -0.3, 0],
        ],
    };
}

function genCohortData() {
    const cohorts = ['Jan-25', 'Feb-25', 'Mar-25', 'Apr-25', 'May-25', 'Jun-25', 'Jul-25'];
    return cohorts.map((c, ci) => ({
        cohort: c,
        m1: seededRand(ci * 3, 3, 8, 1),
        m2: seededRand(ci * 5, 6, 14, 1),
        m3: seededRand(ci * 7, 10, 22, 1),
        m4: seededRand(ci * 11, 16, 28, 1),
        m5: seededRand(ci * 13, 20, 36, 1),
        m6: seededRand(ci * 17, 24, 42, 1),
        bookSize: rand(12000, 28000),
        avgBalance: rand(800, 2400),
    }));
}

// ── Charge-Off Prediction ──────────────────────────────────────
function genChargeOffCustomers(n = 300) {
    const firstNames = ['James', 'Maria', 'Robert', 'Lisa', 'Michael', 'Sarah', 'David', 'Jennifer', 'William', 'Jessica', 'Richard', 'Amanda'];
    const lastNames = ['Williams', 'Martinez', 'Johnson', 'Brown', 'Jones', 'Davis', 'Miller', 'Wilson', 'Moore', 'Taylor', 'Anderson', 'Thomas'];
    return Array.from({ length: n }, (_, i) => {
        const dpd = rand(0, 130);
        const pd30 = Math.min(95, Math.round(15 + dpd * 0.55 + rand(-10, 10)));
        const pd60 = Math.min(90, Math.round(pd30 * 0.75 + rand(-5, 5)));
        const pd90 = Math.min(85, Math.round(pd60 * 0.70 + rand(-5, 5)));
        const riskTier = pd90 > 70 ? 'Critical' : pd90 > 45 ? 'High' : pd90 > 20 ? 'Medium' : 'Low';
        return {
            id: `CNG-${100000 + i}`,
            name: `${randChoice(firstNames)} ${randChoice(lastNames)}`,
            product: randChoice(PRODUCTS),
            channel: randChoice(CHANNELS),
            state: randChoice(STATES),
            dpd,
            pd30, pd60, pd90,
            riskTier,
            topRisks: ['Income Drop', 'Loan Stacking', 'Broken P2P', 'Phone Unreachable', 'NSF Events', 'Address Change']
                .sort(() => Math.random() - 0.5).slice(0, 3),
            loanAmount: rand(300, 5000),
            daysSinceLastPayment: rand(0, dpd || 5),
            contactScore: rand(20, 95),
            fhs: rand(15, 80),
        };
    });
}

function genShapFeatures() {
    return [
        { feature: 'Loan Stacking Count', importance: 0.31, direction: 'positive' },
        { feature: 'DPD History', importance: 0.28, direction: 'positive' },
        { feature: 'Broken Promise-to-Pay %', importance: 0.24, direction: 'positive' },
        { feature: 'Recent Income Drop', importance: 0.22, direction: 'positive' },
        { feature: 'Bank Balance Drop', importance: 0.19, direction: 'positive' },
        { feature: 'NSF / Returned ACH', importance: 0.17, direction: 'positive' },
        { feature: 'Days Since Last Income', importance: 0.16, direction: 'positive' },
        { feature: 'Call Avoidance Pattern', importance: 0.14, direction: 'positive' },
        { feature: 'Phone Unreachable %', importance: 0.13, direction: 'positive' },
        { feature: 'Contactability Score', importance: 0.11, direction: 'negative' },
        { feature: 'Pawn Loan Frequency', importance: 0.10, direction: 'positive' },
        { feature: 'Income Stability Index', importance: 0.09, direction: 'negative' },
    ].sort((a, b) => b.importance - a.importance);
}

// ── Loss Forecast ──────────────────────────────────────────────
function genLossForecast() {
    const horizons = ['Current', '+30 Days', '+60 Days', '+90 Days'];
    return {
        summary: {
            el: 28_400_000,
            lgd: 61.4,
            ead: 312_500_000,
            pd: 12.8,
            ecl: 22_300_000,
            lossForecast30: 9_200_000,
            lossForecast60: 19_100_000,
            lossForecast90: 28_400_000,
            lifetimeLoss: 74_800_000,
            reserveRatio: 8.4,
        },
        curve: horizons.map((h, i) => ({
            horizon: h,
            expected: [0, 9.2, 19.1, 28.4][i],
            upside: [0, 6.1, 14.2, 21.3][i],
            downside: [0, 13.8, 26.7, 39.2][i],
        })),
        byProduct: PRODUCTS.map((p, i) => ({
            product: p,
            el: [8_200_000, 11_400_000, 4_800_000, 4_000_000][i],
            lgd: [55.2, 48.6, 71.3, 38.4][i],
            pd: [12.4, 9.1, 7.2, 14.8][i],
            ead: [84_000_000, 94_000_000, 39_000_000, 29_000_000][i],
        })),
        bySegment: SEGMENTS.map((s, i) => ({
            segment: s,
            el: [2_100_000, 8_400_000, 12_800_000, 11_200_000, 9_800_000, 4_200_000][i],
            pct: [2.8, 11.2, 17.1, 15.0, 13.1, 5.6][i],
        })),
        monthly: MONTHS.map((m, i) => ({
            month: m,
            ecl: parseFloat((20 + i * 0.8 + (Math.random() - 0.5) * 1.5).toFixed(1)),
            provision: parseFloat((22 + i * 0.9 + (Math.random() - 0.5) * 1).toFixed(1)),
        })),
    };
}

// ── Behavioural Segmentation ───────────────────────────────────
function genSegmentClusters() {
    const centers = [
        { seg: 'Reliable Thin-File', x: 20, y: 75, color: '#10b981', co: 2.1 },
        { seg: 'Temporary Hardship', x: 45, y: 52, color: '#f59e0b', co: 8.4 },
        { seg: 'Chronic Delinquent', x: 72, y: 28, color: '#ef4444', co: 31.2 },
        { seg: 'Strategic Defaulter', x: 85, y: 18, color: '#8b5cf6', co: 42.7 },
        { seg: 'Fraud Risk', x: 90, y: 10, color: '#ec4899', co: 67.3 },
        { seg: 'Pawn-Default Risk', x: 60, y: 38, color: '#f97316', co: 19.8 },
    ];
    const points = [];
    centers.forEach((c, ci) => {
        const n = rand(600, 2200);
        for (let i = 0; i < n; i++) {
            points.push({
                x: Math.max(0, Math.min(100, c.x + (Math.random() - 0.5) * 22)),
                y: Math.max(0, Math.min(100, c.y + (Math.random() - 0.5) * 22)),
                seg: ci,
                color: c.color,
            });
        }
    });
    return { centers, points };
}

function genSegmentSizes() {
    return [
        { segment: 'Reliable Thin-File', size: 68_420, chargeOff: 2.1, recovery: 71.4, avgDPD: 4, avgFHS: 74, avgVuln: 22 },
        { segment: 'Temporary Hardship', size: 52_310, chargeOff: 8.4, recovery: 48.2, avgDPD: 28, avgFHS: 52, avgVuln: 51 },
        { segment: 'Chronic Delinquent', size: 34_180, chargeOff: 31.2, recovery: 22.1, avgDPD: 64, avgFHS: 32, avgVuln: 74 },
        { segment: 'Strategic Defaulter', size: 18_940, chargeOff: 42.7, recovery: 14.6, avgDPD: 88, avgFHS: 21, avgVuln: 85 },
        { segment: 'Fraud Risk', size: 8_120, chargeOff: 67.3, recovery: 8.9, avgDPD: 112, avgFHS: 14, avgVuln: 94 },
        { segment: 'Pawn-Default Risk', size: 19_877, chargeOff: 19.8, recovery: 38.7, avgDPD: 42, avgFHS: 41, avgVuln: 63 },
    ];
}

// ── Product Risk ───────────────────────────────────────────────
function genProductRisk() {
    return [
        { product: 'Payday', avgDPD: 18.4, chargeOff: 5.2, recovery: 31.4, rollRate30_60: 21.3, pd: 12.4, lgd: 55.2, ead: 84.2, originations: 6842, avgBalance: 420, yoyGrowth: +4.2, npl: 18.6 },
        { product: 'Installment', avgDPD: 24.1, chargeOff: 3.8, recovery: 42.7, rollRate30_60: 18.7, pd: 9.1, lgd: 48.6, ead: 94.1, originations: 8120, avgBalance: 2180, yoyGrowth: +8.7, npl: 14.2 },
        { product: 'Auto Title', avgDPD: 31.2, chargeOff: 4.1, recovery: 58.4, rollRate30_60: 24.8, pd: 7.2, lgd: 71.3, ead: 39.7, originations: 3412, avgBalance: 3640, yoyGrowth: -1.3, npl: 16.8 },
        { product: 'Pawn', avgDPD: 14.8, chargeOff: 6.7, recovery: 62.1, rollRate30_60: 15.2, pd: 14.8, lgd: 38.4, ead: 29.8, originations: 2840, avgBalance: 680, yoyGrowth: -2.1, npl: 12.4 },
    ];
}

// ── Geographic Risk ────────────────────────────────────────────
function genGeoRisk() {
    return STATES.map((s, i) => ({
        state: s,
        riskScore: seededRand(i * 7, 25, 92),
        chargeOff: seededRand(i * 13, 2.1, 7.8, 1),
        rollRate: seededRand(i * 17, 14, 38, 1),
        activeLoans: seededRand(i * 3, 4000, 32000),
        unemployment: seededRand(i * 11, 3.2, 9.8, 1),
        layoffRisk: ['Low', 'Medium', 'High'][seededRand(i * 19, 0, 2)],
        loanVolume: seededRand(i * 5, 2000000, 45000000),
        recovery: seededRand(i * 23, 22, 58, 1),
        avgDPD: seededRand(i * 9, 12, 48),
    }));
}

// ── Channel Risk ───────────────────────────────────────────────
function genChannelRisk() {
    return [
        {
            channel: 'Online',
            avgDPD: 22.4, chargeOff: 4.8, recovery: 36.2,
            rollRate: 19.4, activeLoans: 148_912, avgLoan: 1_280,
            contactRate: 68.4, fraudFlag: 2.1,
            trend: MONTHS.map((m, i) => ({ month: m, dpd: rand(18, 28), co: rand(38, 58) / 10 })),
        },
        {
            channel: 'Retail Store',
            avgDPD: 28.1, chargeOff: 3.4, recovery: 38.7,
            rollRate: 24.1, activeLoans: 99_400, avgLoan: 1_610,
            contactRate: 82.1, fraudFlag: 0.8,
            trend: MONTHS.map((m, i) => ({ month: m, dpd: rand(22, 35), co: rand(28, 46) / 10 })),
        },
    ];
}

// ── Vulnerability Score ────────────────────────────────────────
function genVulnerabilityData() {
    const categories = [
        { name: 'Financial', avgDPD: 44.2, chargeOff: 18.4, recovery: 28.1, avgScore: 62.4, borrowers: 38_200, weight: 0.30 },
        { name: 'Physical Health', avgDPD: 31.7, chargeOff: 12.8, recovery: 34.6, avgScore: 48.3, borrowers: 24_800, weight: 0.12 },
        { name: 'Cognitive', avgDPD: 38.9, chargeOff: 15.2, recovery: 29.4, avgScore: 55.7, borrowers: 18_400, weight: 0.08 },
        { name: 'Life Event', avgDPD: 52.1, chargeOff: 22.6, recovery: 24.8, avgScore: 71.2, borrowers: 29_100, weight: 0.18 },
        { name: 'Geographic', avgDPD: 27.4, chargeOff: 9.8, recovery: 41.2, avgScore: 42.8, borrowers: 31_600, weight: 0.10 },
        { name: 'Socioeconomic', avgDPD: 48.6, chargeOff: 20.1, recovery: 26.3, avgScore: 67.9, borrowers: 22_400, weight: 0.12 },
        { name: 'Behavioral & Engagement', avgDPD: 61.3, chargeOff: 28.4, recovery: 18.7, avgScore: 78.4, borrowers: 16_800, weight: 0.20 },
        { name: 'Product-Specific', avgDPD: 35.8, chargeOff: 14.7, recovery: 32.4, avgScore: 53.1, borrowers: 20_547, weight: 0.10 },
    ];
    const tierDist = [
        { tier: 'Critical (80–100)', pct: 12.4, count: 25_024, color: '#ef4444' },
        { tier: 'High (60–79)', pct: 28.7, count: 57_930, color: '#f97316' },
        { tier: 'Moderate (40–59)', pct: 38.2, count: 77_105, color: '#f59e0b' },
        { tier: 'Low (0–39)', pct: 20.7, count: 41_788, color: '#10b981' },
    ];
    const trend = MONTHS.map((m, i) => ({
        month: m,
        critical: rand(10, 14),
        high: rand(26, 30),
        moderate: rand(36, 40),
        low: rand(18, 23),
    }));
    return { categories, tierDist, trend };
}

// ── Financial Health Score ─────────────────────────────────────
function genFHSData() {
    const distribution = Array.from({ length: 20 }, (_, i) => ({
        range: `${i * 5}-${i * 5 + 4}`,
        count: Math.round(8000 * Math.exp(-0.5 * Math.pow((i - 13) / 4, 2)) + rand(100, 500)),
    }));
    const fhsTrend = MONTHS.map((m, i) => ({
        month: m,
        excellent: rand(18, 26),
        good: rand(22, 30),
        watchlist: rand(20, 28),
        highRisk: rand(12, 20),
        critical: rand(8, 14),
        avgScore: rand(52, 67),
    }));
    const vsChargeOff = Array.from({ length: 10 }, (_, i) => ({
        fhsBucket: `${i * 10}-${i * 10 + 9}`,
        chargeOff: parseFloat((35 - i * 3.2 + (Math.random() - 0.5) * 1.5).toFixed(1)),
        customers: rand(5000, 25000),
    }));
    const vsDPD = [
        { fhsTier: 'Excellent', avgDPD: 4.2, color: '#10b981' },
        { fhsTier: 'Good', avgDPD: 12.8, color: '#1d6ef5' },
        { fhsTier: 'Watchlist', avgDPD: 31.4, color: '#f59e0b' },
        { fhsTier: 'High Risk', avgDPD: 58.7, color: '#f97316' },
        { fhsTier: 'Critical', avgDPD: 89.2, color: '#ef4444' },
    ];
    const byProduct = PRODUCTS.map(p => ({
        product: p,
        excellent: rand(15, 30), good: rand(20, 35),
        watchlist: rand(18, 28), highRisk: rand(10, 20), critical: rand(5, 15),
    }));
    const pillars = [
        { pillar: 'Income Stability', weight: 0.25, avgScore: 61, industry: 68 },
        { pillar: 'Payment Behaviour', weight: 0.25, avgScore: 54, industry: 62 },
        { pillar: 'Financial Stress', weight: 0.15, avgScore: 47, industry: 55 },
        { pillar: 'Loan Behaviour', weight: 0.15, avgScore: 58, industry: 60 },
        { pillar: 'Contactability', weight: 0.10, avgScore: 66, industry: 70 },
        { pillar: 'Collateral Quality', weight: 0.10, avgScore: 52, industry: 58 },
    ];
    return { distribution, trend: fhsTrend, vsChargeOff, vsDPD, byProduct, pillars };
}

// ── AI Action Recommendations ──────────────────────────────────
function genActionRecommendations() {
    const actions = [
        {
            segment: 'Temporary Hardship', priority: 'Medium', count: 12_840,
            actions: ['Offer 14-day payment extension', 'Micro-installment restructure (3×)', 'Proactive SMS + App push campaign', 'Hardship plan enrollment'],
            roi: 2.4, savings: 3_200_000, chargeOffReduction: 2.8,
            contactMethod: 'SMS + App Push', urgency: 'Within 7 days',
            color: '#f59e0b', glow: 'rgba(245,158,11,0.08)',
            liftModel: 'Uplift +38%', expectedResponse: '42%',
        },
        {
            segment: 'Chronic Delinquent', priority: 'High', count: 8_920,
            actions: ['Early outbound collection call (30+ DPD trigger)', 'Skip tracing (address + phone refresh)', 'Credit limit reduction', 'Refer to specialist collector'],
            roi: 3.1, savings: 5_800_000, chargeOffReduction: 4.2,
            contactMethod: 'Outbound Call', urgency: 'Immediate',
            color: '#ef4444', glow: 'rgba(239,68,68,0.08)',
            liftModel: 'Uplift +61%', expectedResponse: '28%',
        },
        {
            segment: 'Strategic Defaulter', priority: 'Critical', count: 3_740,
            actions: ['Legal escalation pathway', 'Collateral repossession (Auto Title)', 'Write-off provisioning + tax documentation', 'Assign to external agency'],
            roi: 1.8, savings: 4_100_000, chargeOffReduction: 5.7,
            contactMethod: 'Legal / Field Agent', urgency: 'Immediate',
            color: '#8b5cf6', glow: 'rgba(139,92,246,0.08)',
            liftModel: 'Uplift +22%', expectedResponse: '14%',
        },
        {
            segment: 'Pawn-Default Risk', priority: 'High', count: 5_210,
            actions: ['Early collateral auction strategy', 'In-store collateral re-assessment', 'Redemption incentive offer (15% fee waiver)', 'Contactability verification'],
            roi: 2.9, savings: 2_700_000, chargeOffReduction: 3.4,
            contactMethod: 'In-store + SMS', urgency: 'Within 3 days',
            color: '#f97316', glow: 'rgba(249,115,22,0.08)',
            liftModel: 'Uplift +44%', expectedResponse: '51%',
        },
        {
            segment: 'Reliable Thin-File', priority: 'Low', count: 68_420,
            actions: ['Offer better loan terms (rate reduction)', 'Upsell installment loan product', 'Loyalty reward program enrollment', 'Credit-builder referral partnership'],
            roi: 4.8, savings: 8_400_000, chargeOffReduction: 0.4,
            contactMethod: 'App + Email', urgency: 'Monthly',
            color: '#10b981', glow: 'rgba(16,185,129,0.06)',
            liftModel: 'Conversion +24%', expectedResponse: '38%',
        },
        {
            segment: 'Fraud Risk', priority: 'Critical', count: 2_180,
            actions: ['Immediate account freeze', 'Identity verification re-KYC', 'Fraud investigation referral', 'Bureau alert filing'],
            roi: 5.2, savings: 6_200_000, chargeOffReduction: 8.1,
            contactMethod: 'Legal / Field Agent', urgency: 'Immediate',
            color: '#ec4899', glow: 'rgba(236,72,153,0.08)',
            liftModel: 'Recovery +73%', expectedResponse: '18%',
        },
    ];
    const roiTimeline = MONTHS.map((m, i) => ({
        month: m,
        projected: rand(1_200_000, 2_800_000),
        actual: i < 9 ? rand(900_000, 2_400_000) : null,
    }));
    return { actions, roiTimeline };
}

// ── Portfolio Heatmap by State × Product ──────────────────────
function genStateProductMatrix() {
    return STATES.slice(0, 10).map(s => ({
        state: s,
        Payday: rand(2, 8, 1),
        Installment: rand(1.5, 6, 1),
        'Auto Title': rand(2, 7, 1),
        Pawn: rand(3, 9, 1),
    }));
}

// ── Compile ────────────────────────────────────────────────────
const DashboardData = {
    portfolio: {
        kpis: genPortfolioKPIs(),
        trend: genPortfolioTrend(),
        productMix: genProductMix(),
    },
    earlyWarning: {
        scores: genEarlyWarningScores(),
        heatmap: genRiskHeatmap(),
        timeline: genEWSTimeline(),
        kris: genEWSKRIs(),
    },
    dpd: {
        trend: genDPDTrend(),
        migration: genMigrationMatrix(),
        cohorts: genCohortData(),
    },
    chargeOff: {
        customers: genChargeOffCustomers(400),
        shap: genShapFeatures(),
    },
    loss: genLossForecast(),
    segmentation: {
        clusters: genSegmentClusters(),
        sizes: genSegmentSizes(),
    },
    productRisk: genProductRisk(),
    geoRisk: genGeoRisk(),
    channelRisk: genChannelRisk(),
    vulnerability: genVulnerabilityData(),
    fhs: genFHSData(),
    actions: genActionRecommendations(),
    stateProduct: genStateProductMatrix(),
};

function refreshData() {
    DashboardData.portfolio.kpis = genPortfolioKPIs();
    DashboardData.earlyWarning.timeline = genEWSTimeline();
    DashboardData.dpd.trend = genDPDTrend();
}
