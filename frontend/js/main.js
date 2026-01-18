/**
 * PROJECT PRAGATI - Entry Point
 * Orchestrates module initialization.
 */

import { state, setCurrentCategory, loadPincodeMeta } from './state.js';
import { loadDashboardData } from './api.js';
import { initMap, updateMapStyle } from './map.js';
import { renderPincodeList, populateStateDropdown, updateHeaderStats, handleSearch } from './sidebar.js';
import { closeDetailPanel } from './details.js';

document.addEventListener('DOMContentLoaded', async () => {
    console.log('Project Pragati Modular Dashboard Initializing...');

    // 1. Data Load
    await Promise.all([
        loadDashboardData(),
        loadPincodeMeta()
    ]);

    // 2. Map Init
    initMap();

    // 3. Initial UI Render
    updateUI();

    // 4. Populate Dropdowns (Once)
    populateStateDropdown();

    // 5. Setup Listeners
    setupEventListeners();
});

function updateUI() {
    updateHeaderStats();
    renderPincodeList();
    updateMapStyle();
}

function setupEventListeners() {
    // Category Switcher
    const catBtns = document.querySelectorAll('.cat-btn');
    catBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            // UI Toggle
            catBtns.forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');

            // Logic Switch
            const newCat = e.target.dataset.cat;
            setCurrentCategory(newCat);
            console.log(`Switching to Category: ${newCat}`);
            updateUI();
        });
    });

    // Search
    document.getElementById('search-btn').addEventListener('click', handleSearch);
    document.getElementById('pincode-search').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleSearch();
    });

    // Filters
    document.getElementById('state-filter').addEventListener('change', renderPincodeList);
    document.getElementById('priority-filter').addEventListener('change', renderPincodeList);

    // Detail Panel
    document.getElementById('close-detail').addEventListener('click', closeDetailPanel);
}
