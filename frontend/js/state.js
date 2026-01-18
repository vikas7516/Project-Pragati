/**
 * PROJECT PRAGATI - State Management
 * Handles global data and current application state.
 */

export const state = {
    masterData: {},
    pincodeList: [],
    currentCategory: 'enrolment', // Default
    map: null,
    geoJsonLayer: null,
    currentChart: null,
    pincodeMeta: {},
    totalMapFeatures: 0 // Track total polygons for coverage calc
};

// Setters
export function setMasterData(data) {
    state.masterData = data;
    state.pincodeList = Object.keys(data);
}

export async function loadPincodeMeta() {
    try {
        const res = await fetch('assets/data/pincode_meta.json');
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        state.pincodeMeta = await res.json();
        console.log('Pincode Metadata Loaded:', Object.keys(state.pincodeMeta).length);
    } catch (e) {
        console.error('Failed to load Pincode Metadata:', e);
        state.pincodeMeta = {}; // Ensure it's an object even on failure
    }
}

export function setCurrentCategory(category) {
    state.currentCategory = category;
}

// Getters
export function getPincodeData(pincode) {
    if (!state.masterData[pincode]) return null;
    return state.masterData[pincode][state.currentCategory];
}

/**
 * Get metadata for a pincode.
 * Returns: { area, district, state } with consistent key names.
 * Note: pincode_meta.json uses 'dist' for district, we normalize to 'district'.
 */
export function getMetadata(pincode) {
    // 1. Try Extended Metadata (Address JSON)
    if (state.pincodeMeta[pincode]) {
        const meta = state.pincodeMeta[pincode];
        return {
            lat: meta.lat,
            lng: meta.lng,
            area: meta.area || 'Unknown Area',
            district: meta.dist || 'Unknown',  // Normalize 'dist' -> 'district'
            state: meta.state || 'Unknown'
        };
    }

    // 2. Fallback to Master Data
    if (state.masterData[pincode]) {
        return {
            area: 'Unknown Area',
            district: state.masterData[pincode].district || 'Unknown',
            state: state.masterData[pincode].state || 'Unknown'
        };
    }

    // 3. No data at all
    return { area: 'Unknown', district: 'Unknown', state: 'Unknown' };
}
