# PROJECT PRAGATI: CORE ALGORITHMIC LOGIC
### Technical Deep Dive for Engineering Review
**Status**: Production | **Version**: 2.0 (Vectorized)

---

## 1. The Core Philosophy: "Context-Aware Anomaly Detection"
Traditional systems use **Static Thresholds** (e.g., "Alert if < 50").
This fails in India because:
*   A remote village doing 10 and dropping to 2 is a collapse (80% Loss).
*   A metro center doing 1000 and dropping to 900 is noise.

**Project Pragati** uses **Dynamic Profiling**. 
We build a specific "Behavioral Profile" for every single pincode based on its last 12 months of history. We then compare its *Current Performance* against its own *Data DNA*.

---

## 2. The Data Structure
*   **Time Unit**: 15-Day Buckets (Period_ID).
    *   *Why?* Daily data is too noisy. Monthly is too slow. 15-Days is the "Goldilocks Zone" for detecting attrition.
*   **Entities**: 19,000+ Verified Pincodes.
*   **Metrics**: Enrolment, Biometric Update, Demographic Update.

---

## 3. The Logic Engine (Python/Pandas)

### A. Determining "Max Capacity"
First, we answer: *"What is this center capable of when healthy?"*
We calculate the **90th Percentile** of the last year's volume.
*   `Capacity = Q_90(History_12_Months)`
*   *Why 90th?* Max() is vulnerable to one-off camps. 90th percentile represents sustainable peak performance.

### B. Determining "Normal Volatility" (Bank Fraud Logic)
We use Inter-Quartile Range (IQR) to create a dynamic "Safe Band".
*   `Median` = Rolling Median (6 Months)
*   `Q1` = 25th Percentile
*   `Q3` = 75th Percentile
*   `IQR` = Q3 - Q1
*   **Safe Floor** = `Q1 - (1.5 * IQR)`
*   **Safe Ceiling** = `Q3 + (1.5 * IQR)`

---

## 4. The 5-Color Classification Matrix
The engine runs the following Vectorized Tests on every pincode:

| Priority | Color | Logical Condition (Simplified) | Diagnosis |
| :--- | :--- | :--- | :--- |
| **CRITICAL** | 🔴 Red | `Current < 10% of Capacity` | **COLLAPSE**. Effectively Dead. Needs immediate reset. |
| **SEVERE** | 🟠 Orange | `Current < 30% of Capacity` | **FAILING**. Functional but severely degraded. |
| **SHOCK** | 🟡 Yellow | `Current < Safe_Floor` | **ANOMALY**. Statistical drop below volatility range. Warning sign. |
| **SURGE** | 🔵 Blue | `Current > Safe_Ceiling` | **OVERLOAD**. Operating beyond historical limits. Needs staff/kit reinforcement. |
| **SAFE** | 🟢 Green | All Checks Pass | **HEALTHY**. Operating within normal bounds. |

---

## 5. Noise & Artifact Filtering

### The "Ghost Code" Filter
*   **Problem**: Data entry errors create fake pincodes (e.g., '100000').
*   **Solution**: `Inner Join` with Official Pincode Directory. Only valid government-recognized locations are processed.

### The "Small Number" Stability
*   **Problem**: Going from 2 -> 0 updates triggers massive % drops.
*   **Solution**: `MIN_ACTIVITY_THRESHOLD = 10`. Below this, statistical logic is suspended to prevent false positives in dormant villages.

---

## 6. Implementation Notes
*   **Vectorization**: The logic uses `Pandas.groupby().rolling()` to process 15M rows in <2 seconds. No `for` loops.
*   **Independence**: Biometric Update logic runs independently of Enrolment logic. A center can remain Green for Enrolment while turning Red for Updates.
