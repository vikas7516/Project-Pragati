/**
 * PROJECT PRAGATI - Detail Panel & Charts
 * Handles the popup view and complex graph rendering.
 */

import { state, getPincodeData, getMetadata } from './state.js';
import { PRIORITY_LABELS, PRIORITY_CLASSES } from './config.js';
import { getAnalysis } from './recommendations.js';

export function openDetailPanel(pincode) {
    const panel = document.getElementById('detail-panel');
    const data = getPincodeData(pincode);
    const meta = getMetadata(pincode);

    if (!data) {
        console.warn(`No data available for pincode: ${pincode}`);
        return;
    }

    // Safely get periods with fallback
    const pincodeEntry = state.masterData[pincode];
    const periods = pincodeEntry?.periods || [];

    // --- 1. HEADER & METADATA ---
    // Use correct ID from index.html
    document.getElementById('detail-title').textContent = pincode;

    let subtitle = `${meta.district}, ${meta.state}`;
    if (meta.area && meta.area !== 'Unknown' && meta.area !== 'Unknown Area') {
        subtitle = `${meta.area}, ` + subtitle;
    }
    document.getElementById('detail-subtitle').textContent = subtitle;

    const badge = document.getElementById('detail-badge');
    badge.textContent = PRIORITY_LABELS[data.priority];
    badge.className = `priority-badge ${PRIORITY_CLASSES[data.priority]}`;

    // --- 2. KEY METRICS (Moved to Top) ---
    const history = data.history || [];
    const recent = history.slice(-6);
    const avg = recent.length ? Math.round(recent.reduce((a, b) => a + b, 0) / recent.length) : 0;

    // Dynamic Labels based on Category
    const catName = (state.activeCategory || 'enrolment').charAt(0).toUpperCase() + (state.activeCategory || 'enrolment').slice(1);

    document.querySelector('.metric:nth-child(1) .metric-label').textContent = `Avg ${catName}`;
    document.querySelector('.metric:nth-child(2) .metric-label').textContent = `Latest ${catName}`;

    document.getElementById('metric-vol').textContent = avg.toLocaleString();
    document.getElementById('metric-latest').textContent = (data.latest_vol || 0).toLocaleString();

    // --- 3. RECOMMENDATIONS (Analysis Hook) ---
    const analysis = getAnalysis(data);

    // Ensure Description Container Exists
    let descEl = document.getElementById('detail-desc');
    if (!descEl) {
        descEl = document.createElement('div');
        descEl.id = 'detail-desc';
        descEl.style.marginBottom = '20px';

        // --- LAYOUT REORDERING ---
        // We want: Header -> Metrics -> Badge -> Recommendations
        // Current DOM: Header (contains Title, Subtitle, Badge) -> Metrics -> Flags

        const metricsContainer = document.querySelector('.detail-metrics');
        const headerContainer = document.querySelector('.detail-header');

        // 1. Move Metrics immediately after Header
        if (metricsContainer && headerContainer) {
            headerContainer.parentNode.insertBefore(metricsContainer, headerContainer.nextSibling);
            metricsContainer.style.marginTop = '12px';
            metricsContainer.style.marginBottom = '16px';
        }

        // 2. Insert Recommendations after Metrics
        if (metricsContainer) {
            metricsContainer.parentNode.insertBefore(descEl, metricsContainer.nextSibling);
        } else {
            // Fallback
            headerContainer.parentNode.insertBefore(descEl, headerContainer.nextSibling);
        }
    }

    // Construct HTML for Insights
    const actionList = analysis.actions.map(a => `<li style="margin-bottom:4px;">• ${a}</li>`).join('');

    descEl.innerHTML = `
        <div style="font-weight: 600; color: #333; margin-bottom: 8px; font-size: 0.95rem;">
            ${analysis.cause}
        </div>
        <div style="background: #fdfdfd; padding: 12px; border: 1px solid #eee; border-radius: 8px;">
            <div style="font-size: 0.7rem; text-transform: uppercase; color: #999; margin-bottom: 6px; font-weight: 700;">Recommended Actions</div>
            <ul style="font-size: 0.9rem; color: #555; padding-left: 0; list-style: none;">
                ${actionList}
            </ul>
        </div>
    `;

    // --- 4. FLASGS ---
    const flagsContainer = document.getElementById('anomaly-flags');
    flagsContainer.innerHTML = '';
    if (data.flags && data.flags.length > 0) {
        data.flags.forEach(flag => {
            const span = document.createElement('span');
            span.className = 'flag';
            span.textContent = flag.toUpperCase();
            flagsContainer.appendChild(span);
        });
    } else {
        flagsContainer.innerHTML = '<span class="flag">Normal</span>';
    }

    // --- 5. RENDER GRAPH ---
    if (history.length > 0) {
        renderChart(periods, history, data.priority);
    }

    panel.classList.add('active');
}

export function closeDetailPanel() {
    document.getElementById('detail-panel').classList.remove('active');
}

// Convert Period ID to readable string
function decodePeriod(id) {
    if (!id) return 'Unknown Period';
    const year = Math.floor(id / 24);
    const rest = id % 24;
    const month = Math.floor(rest / 2);
    const half = rest % 2;

    const months = ["", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const mStr = months[month] || "Unk";
    const hStr = half === 0 ? "1st Half" : "2nd Half";

    return `${mStr} ${year} (${hStr})`;
}

function renderChart(labels, dataPoints, priorityLevel) {
    const ctx = document.getElementById('trend-chart').getContext('2d');

    if (state.currentChart) {
        state.currentChart.destroy();
    }

    // Handle empty data
    if (!dataPoints || dataPoints.length === 0) {
        console.warn('No data points for chart');
        return;
    }

    // 1. Calculate Baseline (Median)
    const sortedData = [...dataPoints].sort((a, b) => a - b);
    const median = sortedData[Math.floor(sortedData.length / 2)] || 0;
    const base = median > 5 ? median : 5; // Avoid division by zero issues

    // 2. Stratified Point Colors
    const pointColors = dataPoints.map(val => {
        const ratio = val / base;
        if (ratio > 1.25) return '#1976d2'; // Blue (Surge)
        if (ratio >= 0.75) return '#388e3c'; // Green (Safe)
        if (ratio >= 0.50) return '#fbc02d'; // Yellow (Shock)
        if (ratio >= 0.30) return '#f57c00'; // Orange (Severe)
        return '#d32f2f'; // Red (Critical)
    });

    // 3. Zones (Background Bands)
    const upperSafe = Array(dataPoints.length).fill(base * 1.25);
    const lowerSafe = Array(dataPoints.length).fill(base * 0.75);
    const medianLine = Array(dataPoints.length).fill(median);

    // Generate Chart Labels (Date Decoded)
    // If labels (periods) are fewer than dataPoints (due to padding in previous steps), 
    // we might need to handle it. But our new build pipeline guarantees alignment.
    // If labels are missing, we default to P1..Pn
    const chartLabels = labels.map(id => decodePeriod(id));

    state.currentChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: chartLabels,
            datasets: [
                // Layer 1: The Safe Band (Green Zone)
                {
                    label: 'Safe Top',
                    data: upperSafe,
                    borderColor: 'transparent',
                    pointRadius: 0,
                    fill: false,
                    order: 3
                },
                {
                    label: 'Safe Zone',
                    data: lowerSafe,
                    borderColor: 'transparent',
                    backgroundColor: 'rgba(76, 175, 80, 0.2)', // Green, visible opacity
                    fill: '-1', // Fills to previous dataset (Safe Top)
                    pointRadius: 0,
                    order: 2
                },
                // Layer 2: Median
                {
                    label: 'Median',
                    data: medianLine,
                    borderColor: '#999',
                    borderWidth: 1,
                    borderDash: [5, 5],
                    pointRadius: 0,
                    fill: false,
                    order: 1
                },
                // Layer 3: Main Volume (Top)
                {
                    label: 'Volume',
                    data: dataPoints,
                    borderColor: '#444',
                    borderWidth: 2,
                    pointBackgroundColor: pointColors,
                    pointBorderColor: '#fff',
                    pointRadius: 5,
                    pointHoverRadius: 7,
                    fill: false,
                    zIndex: 10,
                    order: 0 // Local order 0 draws LAST (on Top)
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                mode: 'index',
                intersect: false,
            },
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        title: (tooltipItems) => {
                            return tooltipItems[0].label; // Use decoded date
                        },
                        label: (context) => {
                            if (context.dataset.label === 'Volume') {
                                return `Volume: ${context.parsed.y.toLocaleString()}`;
                            }
                            return null;
                        }
                    }
                }
            },
            scales: {
                x: {
                    display: true,
                    ticks: {
                        maxTicksLimit: 6,
                        font: { size: 10 }
                    },
                    grid: { display: false }
                },
                y: {
                    beginAtZero: true,
                    // Center the view roughly if possible, but beginAtZero is standard for volume.
                    // To make it look "sinusoidal" around median, we'd need negative values or offset.
                    // But standard Chart is best for accuracy.
                    grid: { color: '#f0f0f0' },
                    ticks: {
                        callback: function (value) {
                            return value.toLocaleString();
                        }
                    }
                }
            }
        }
    });
}
