/**
 * PROJECT PRAGATI - Recommendation Engine
 * Rule-based logic to generate actionable insights based on data trends.
 */

export function getAnalysis(data) {
    const history = data.history || [];
    const recent = history.slice(-6);
    const latest = data.latest_vol || 0;

    // Calculate basic stats
    const avg = recent.reduce((a, b) => a + b, 0) / (recent.length || 1);
    const max = Math.max(...recent);
    const min = Math.min(...recent);
    const variance = max - min;
    const isZero = latest === 0;

    let cause = "Operations are stable.";
    let actions = ["Routine monitoring."];

    // --- PRIORITY 3: CRITICAL (Red) ---
    if (data.priority === 3) {
        if (isZero) {
            cause = "Center has reported ZERO activity recently.";
            actions = [
                "Verify if the center is physically open.",
                "Check for power or internet outages.",
                "Confirm operator attendance."
            ];
        } else if (avg < 5) {
            cause = "Extremely low volume (< 5/period). Center is effectively dormant.";
            actions = [
                "Audit hardware functionality.",
                "Assess need for this center's location.",
                "Check local awareness/camp requirement."
            ];
        } else {
            cause = "Volume has collapsed below viable levels.";
            actions = [
                "Immediate performance review.",
                "Check for technical blockers.",
                "Verify sync packet uploads."
            ];
        }
        return { cause, actions };
    }

    // --- PRIORITY 2: SEVERE (Orange) ---
    if (data.priority === 2) {
        // Check trend direction
        const firstHalf = recent.slice(0, 3).reduce((a, b) => a + b, 0);
        const secondHalf = recent.slice(3, 6).reduce((a, b) => a + b, 0);

        if (secondHalf < firstHalf * 0.7) {
            cause = "Rapid decline detected in the last 3 periods.";
            actions = [
                "Investigate recent localized disruptions.",
                "Check operator logbooks for issues.",
                "Ensure software is up to date."
            ];
        } else {
            cause = "Consistent underperformance (30-50% capacity).";
            actions = [
                "Plan a local mobilization camp.",
                "Review operator training gaps.",
                "Check for competing nearby centers."
            ];
        }
        return { cause, actions };
    }

    // --- PRIORITY 1: SHOCK (Yellow) ---
    if (data.priority === 1) {
        if (variance > avg * 1.5) {
            cause = "Highly erratic patterns detected.";
            actions = [
                "investigate reasons for intermittent spikes.",
                "Check for batch processing habits.",
                "Ensure daily consistency."
            ];
        } else {
            cause = "Sudden deviation from historical baseline.";
            actions = [
                "Monitor for next 2 periods.",
                "Check for local holidays or events.",
                "Verify device calibration."
            ];
        }
        return { cause, actions };
    }

    // --- PRIORITY 4: SURGE (Blue) ---
    if (data.priority === 4) {
        if (latest > avg * 2) {
            cause = "Volume has doubled recently. High load.";
            actions = [
                "Deploy crowd management support.",
                "Verify document quality (fraud risk).",
                "Ensure operators take mandatory breaks."
            ];
        } else {
            cause = "Steady upward surge in volume.";
            actions = [
                "Evaluate need for extra kit/staff.",
                "Ensure waiting area capacity is sufficient.",
                "Maintain document verification standards."
            ];
        }
        return { cause, actions };
    }

    // --- DEFAULT: SAFE ---
    return {
        cause: "Activity is within normal operating range.",
        actions: [
            "Maintain current efficiency.",
            "Ensure regular sync.",
            "Conduct routine hardware cleaning."
        ]
    };
}
