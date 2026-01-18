/**
 * PROJECT PRAGATI - API
 * Data fetching logic.
 */

import { setMasterData } from './state.js';

export async function loadDashboardData() {
    try {
        const res = await fetch('data/dashboard_data.json');
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

        const data = await res.json();
        setMasterData(data);
        console.log(`Loaded data for ${Object.keys(data).length} pincodes.`);
        return true;
    } catch (error) {
        console.error('Error loading dashboard data:', error);
        alert('Failed to load dashboard data. Please verify backend generation.');
        return false;
    }
}
