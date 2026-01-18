/**
 * PROJECT PRAGATI - Sidebar & Stats
 * Handles list rendering, filtering, searching, and stats.
 */

import { state, getPincodeData, getMetadata } from './state.js';
import { PRIORITY_COLORS, PRIORITY_CLASSES } from './config.js';
import { openDetailPanel } from './details.js';
import { focusMap } from './map.js';

export function renderPincodeList() {
    const listEl = document.getElementById('pincode-list');
    const stateFilter = document.getElementById('state-filter').value;
    const priorityFilter = document.getElementById('priority-filter').value;

    listEl.innerHTML = '';

    // Create Filter Data Array
    let filteredItems = state.pincodeList.map(pincode => {
        const catData = getPincodeData(pincode);
        const meta = getMetadata(pincode);
        return {
            pincode,
            ...meta,
            priority: catData ? catData.priority : 0
        };
    });

    // Apply State Filter
    if (stateFilter !== 'all') {
        filteredItems = filteredItems.filter(item => item.state === stateFilter);
    }

    // Apply Priority Filter
    if (priorityFilter !== 'all') {
        filteredItems = filteredItems.filter(item => item.priority === parseInt(priorityFilter));
    }

    // Sort by Priority (Critical first)
    filteredItems.sort((a, b) => {
        const order = { 3: 5, 2: 4, 1: 3, 4: 2, 0: 1 };
        return (order[b.priority] || 0) - (order[a.priority] || 0);
    });

    // Limit render count
    const renderLimit = 100;

    filteredItems.slice(0, renderLimit).forEach(item => {
        const li = document.createElement('li');
        li.className = `pincode-item ${PRIORITY_CLASSES[item.priority]}`;
        li.innerHTML = `
            <div>
                <div class="location">${item.district}, ${item.state}</div>
                <div class="pincode">${item.pincode}</div>
            </div>
            <div class="badge-mini" style="color: ${PRIORITY_COLORS[item.priority]}">●</div>
        `;
        li.addEventListener('click', () => {
            openDetailPanel(item.pincode);
            focusMap(item.pincode);
        });
        listEl.appendChild(li);
    });
}

export function populateStateDropdown() {
    const select = document.getElementById('state-filter');
    if (select.options.length > 1) return; // Already populated

    const states = new Set(state.pincodeList.map(p => getMetadata(p).state).filter(s => s !== "Unknown"));
    [...states].sort().forEach(stateName => {
        const opt = document.createElement('option');
        opt.value = stateName;
        opt.textContent = stateName;
        select.appendChild(opt);
    });
}

export function updateHeaderStats() {
    const stats = { 3: 0, 2: 0, 1: 0, 4: 0, 0: 0 };

    state.pincodeList.forEach(pincode => {
        const data = getPincodeData(pincode);
        if (data) {
            stats[data.priority] = (stats[data.priority] || 0) + 1;
        }
    });

    const processedCount = state.pincodeList.length;
    // Use Meta count as Total (Official List). Fallback to processed if not loaded yet.
    const totalCount = Object.keys(state.pincodeMeta || {}).length || processedCount;
    const noDataCount = Math.max(0, totalCount - processedCount);

    const container = document.getElementById('header-stats');
    container.innerHTML = `
        <div class="stat-item"><span class="stat-value" style="color:#555">${totalCount.toLocaleString()}</span><span class="stat-label">Total</span></div>
        <div class="stat-item"><span class="stat-value" style="color:#333">${processedCount.toLocaleString()}</span><span class="stat-label">Processed</span></div>
        <div class="stat-item"><span class="stat-value nodata">${noDataCount.toLocaleString()}</span><span class="stat-label">No Data</span></div>
        <div class="stat-item"><span class="stat-value critical">${stats[3].toLocaleString()}</span><span class="stat-label">Critical</span></div>
        <div class="stat-item"><span class="stat-value severe">${stats[2].toLocaleString()}</span><span class="stat-label">Severe</span></div>
        <div class="stat-item"><span class="stat-value shock">${stats[1].toLocaleString()}</span><span class="stat-label">Shock</span></div>
        <div class="stat-item"><span class="stat-value surge">${stats[4].toLocaleString()}</span><span class="stat-label">Surge</span></div>
        <div class="stat-item"><span class="stat-value safe">${stats[0].toLocaleString()}</span><span class="stat-label">Safe</span></div>
    `;
}

export function handleSearch() {
    const input = document.getElementById('pincode-search');
    const query = input.value.trim();

    if (state.masterData[query]) {
        openDetailPanel(query);
        focusMap(query);
        input.value = '';
    } else {
        alert('Pincode not found in dataset.');
    }
}
