/**
 * PROJECT PRAGATI - Map Logic
 * Leaflet map handling and GeoJSON styling.
 */

import { state, getPincodeData, getMetadata } from './state.js';
import { PRIORITY_COLORS, PRIORITY_LABELS } from './config.js';
import { openDetailPanel } from './details.js';
import { updateHeaderStats } from './sidebar.js';

// Index for fast pincode lookup (optimization)
const pincodeLayerIndex = {};

export function initMap() {
    const map = L.map('map', { renderer: L.canvas() }).setView([20.5937, 78.9629], 5);

    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://carto.com/">CARTO</a>',
        maxZoom: 18
    }).addTo(map);

    state.map = map;

    // Load GeoJSON Border Data
    loadGeoJSON();
}

async function loadGeoJSON() {
    try {
        console.log('Loading GeoJSON...');
        const res = await fetch('assets/data/india_pincode_boundaries_simplified.geojson');

        if (!res.ok) {
            throw new Error(`HTTP ${res.status}: Failed to fetch GeoJSON`);
        }

        const geoData = await res.json();

        // Validate GeoJSON structure
        if (!geoData.features || !Array.isArray(geoData.features)) {
            throw new Error('Invalid GeoJSON: missing features array');
        }

        // Update Total Features for Coverage Stat
        state.totalMapFeatures = geoData.features.length;
        console.log(`GeoJSON Loaded: ${state.totalMapFeatures} Polygons.`);

        state.geoJsonLayer = L.geoJSON(geoData, {
            style: feature => getFeatureStyle(feature.properties?.Pincode),
            onEachFeature: onEachFeature
        }).addTo(state.map);

        // Refresh stats now that we know the total
        updateHeaderStats();

    } catch (error) {
        console.error('Error loading GeoJSON:', error);
        // Show user feedback
        const mapEl = document.getElementById('map');
        if (mapEl) {
            const errorOverlay = document.createElement('div');
            errorOverlay.style.cssText = `
                position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);
                background: rgba(255,255,255,0.95); padding: 20px 30px; border-radius: 8px;
                box-shadow: 0 4px 20px rgba(0,0,0,0.2); z-index: 1000; text-align: center;
            `;
            errorOverlay.innerHTML = `
                <div style="color: #d32f2f; font-size: 2rem;">⚠️</div>
                <div style="margin-top: 10px; font-weight: 600;">Failed to load map data</div>
                <div style="margin-top: 5px; color: #666; font-size: 0.85rem;">${error.message}</div>
            `;
            mapEl.style.position = 'relative';
            mapEl.appendChild(errorOverlay);
        }
    }
}

function getFeatureStyle(pincode) {
    // Handle missing pincode
    if (!pincode) {
        return {
            fillColor: '#eeeeee',
            weight: 0.3,
            opacity: 0.5,
            color: '#ccc',
            fillOpacity: 0.1 // No Data - Very transparent
        };
    }

    const data = getPincodeData(pincode);

    // If no data exists for this pincode
    if (!data) {
        return {
            fillColor: '#eeeeee',
            weight: 0.5,
            opacity: 1,
            color: '#ccc',
            fillOpacity: 0.1 // No Data - Very transparent
        };
    }

    const score = data.priority;
    const color = PRIORITY_COLORS[score] || PRIORITY_COLORS[0];

    // Variable Opacity Logic
    let opacity = 0.3; // Default Safe (Green)
    if (score === 3) opacity = 1.0; // Critical (Red)
    if (score === 4) opacity = 1.0; // Surge (Blue)
    if (score === 2) opacity = 0.8; // Severe (Orange)
    if (score === 1) opacity = 0.6; // Shock (Yellow)

    return {
        fillColor: color,
        weight: 0.5,
        opacity: 1,
        color: '#666',
        fillOpacity: opacity
    };
}

export function updateMapStyle() {
    if (!state.geoJsonLayer) return;
    state.geoJsonLayer.setStyle(feature => getFeatureStyle(feature.properties?.Pincode));
}

function onEachFeature(feature, layer) {
    const pincode = feature.properties?.Pincode;

    if (!pincode) return; // Skip features without pincode

    // Store in index for fast lookup
    pincodeLayerIndex[pincode] = layer;

    layer.on('click', () => {
        openDetailPanel(pincode);
        state.map.fitBounds(layer.getBounds(), { maxZoom: 12 });
    });

    // Dynamic Tooltip
    layer.bindTooltip(() => {
        const data = getPincodeData(pincode);
        const meta = getMetadata(pincode);

        if (!data) {
            return `<b>${pincode}</b><br>No Data Available`;
        }

        const score = data.priority;
        return `<b>${pincode}</b><br>${meta.district}<br>${PRIORITY_LABELS[score]}`;
    });
}

export function focusMap(pincode) {
    if (!state.geoJsonLayer) return;

    // Use index for O(1) lookup instead of O(n) iteration
    const layer = pincodeLayerIndex[pincode];
    if (layer) {
        state.map.fitBounds(layer.getBounds(), { maxZoom: 12 });
        layer.openTooltip();
        return;
    }

    // Fallback to iteration if not in index
    state.geoJsonLayer.eachLayer(layer => {
        if (layer.feature?.properties?.Pincode == pincode) {
            state.map.fitBounds(layer.getBounds(), { maxZoom: 12 });
            layer.openTooltip();
        }
    });
}
