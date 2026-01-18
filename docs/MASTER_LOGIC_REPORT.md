# PROJECT PRAGATI: METHODOLOGY & LOGIC REPORT

## 1. Project Objective
To transform Aadhaar's operational strategy from "Reactive" to "Data-Driven Predictive Planning". 
The system analyzes 2025 transaction data to identify **"Peer Groups"** of pincodes with similar activity patterns, identifying anomalies that require infrastructure intervention (Permanent Centers) or logistical support (Mobile Vans).

## 2. Core Methodology: "Peer Similarity Clustering"
Unlike traditional models that use arbitrary administrative boundaries (Zones/Districts), Project Pragati uses **Unsupervised Machine Learning (Clustering)** to group pincodes based on their *actual performance capability*.

### Step A: The "Natural Baseline" Calculation
We first strip noise from the data to find the "True Capacity" of a pincode.
*   **Metric:** `Median Monthly Volume` (MMV).
*   **Why Median?** It ignores "Sudden Spikes" (Camps/Drives) and "Sudden Drops" (Holidays), giving us the reliable baseline traffic representing the pincode's steady state.

### Step B: Dynamic Clustering
We classify all ~19,000 pincodes into **Similarity Clusters** based on their MMV.
*   **Logic:** Pincodes with MMV of ~2,000 are grouped together. Pincodes with MMV of ~50 are grouped together.
*   **Goal:** To ensure "Apples-to-Apples" benchmarking. We compare a village center only with other village centers of similar traffic size.

## 3. Decision Logic: Anomaly Detection

Once Peer Groups are established, we identify **Deviations** to trigger interventions.

### Scenario 1: The "Capacity Constraint" (Need for Permanent Center)
*   **Condition:** A pincode is an **High-Outlier** within its group.
*   **Logic:** If Pincode A handles 3x the volume of its average peer *consistently throughout the year*, it indicates a "Super-Node" behavior.
*   **Inference:** The existing facility (Gov or Private) is likely overcrowded.
*   **Recommendation:** **"Establish Permanent Center"** or **"Upgrade Existing Infra"**.

### Scenario 2: The "Service Gap" (Need for Mobile Van)
*   **Condition:** A pincode has **Structural Skew** in its Service Mix compared to peers.
*   **Logic:**
    *   Peer Group Avg for "Child Enrolment" = 15% of total volume.
    *   Pincode B (in same group) = 0% Child Enrolment.
    *   **Inference:** The facility exists but is *incapable* of handling children (Broken tablet/Refusal).
    *   **Recommendation:** **"Deploy Tablet-Equipped Mobile Van"**.

### Scenario 3: The "Seasonal Stress" (Need for Temporary Camp)
*   **Condition:** A pincode shows a **Standard Deviation** spike > 200% in specific months.
*   **Logic:** Validated against historical trend (e.g., Post-Harvest rush).
*   **Recommendation:** **"Schedule Temporary Shivir (Camp)"** during the predicted peak month.

## 4. Technical Implementation Strategy
*   **Data Ingestion:** Process 2025 Transaction Logs (Time-Series).
*   **Algorithm:** 
    1.  Compute `Median_Volume` and `Service_Mix_Ratios` for every Pincode.
    2.  Apply `K-Means Clustering` (or Quantile Binning) to generate Peer IDs.
    3.  Compute `Z-Scores` for each Pincode against its Peer ID statistics.
*   **Output:** A "Strategic Action Matrix" prioritizing districts by Deviation Severity.

## 5. Innovation & Impact
*   **No External Dependencies:** Relies purely on internal transaction logs (no outdated Census data).
*   **Self-Correcting:** As volume grows, pincodes automatically graduate to higher clusters, ensuring the benchmark always matches reality.
*   **Precision:** Targeted interventions prevent resource wastage (e.g., sending vans to centers that actually need permanent buildings).
