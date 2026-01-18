<h1 align="center">
  <img src="frontend/assets/uidai_logo.svg" height="45" style="vertical-align: middle;"> Project Pragati 🇮🇳
</h1>
<h3 align="center">Predictive Lifecycle Analytics for Aadhaar Inclusion</h3>
<p align="center">
  <b>UIDAI Hackathon 2026 - Team ID: UIDAI_5553</b> <br>
  <img src="https://img.shields.io/badge/Status-Prototype%20Complete-green">
  <img src="https://img.shields.io/badge/Stack-Python%20|%20Pandas%20|%20JS-blue">
</p>

<br>

<table>
  <tr>
    <td width="50%" valign="top">
      <h3>👥 Team</h3>
      <ul>
        <li><b>Vikas Lavaniya</b> (Technical Lead)</li>
        <li><b>Kritika</b> (Analytics Lead)</li>
      </ul>
      <b>UIDAI ID:</b> <code>UIDAI_5553</code>
    </td>
    <td width="50%" valign="top">
      <h3>📊 Live Prototype</h3>
      <a href="https://project-pragati.pages.dev" target="_blank">
        <img src="https://img.shields.io/badge/Open_Live_Dashboard-0056D2?style=for-the-badge&logo=cloudflare&logoColor=white" height="40">
      </a>
      <br>
      <i>Interactive Dashboard tracking 19,000+ Pincodes.</i>
    </td>
  </tr>
</table>

<br>

## 📖 The Problem & Solution
**The Blind Spot**: Administrators currently track "State Averages". If a state shows 80% compliance, they assume the entire region is healthy.
**The Reality**: Inside that "healthy" state, hundreds of specific villages (pincodes) may have **collapsed completely**.

**Project Pragati** fixes this by ignoring the averages. 
It tracks the **daily heartbeat of every single pincode** individually. If a center stops processing Mandatory Biometric Updates (Age 5/15), our engine flags it as **CRITICAL (Red)**—alerting the administration to surgically deploy mobile kits *before* citizens are excluded.

---

## 🚀 Key Features
*   **Granular Intelligence**: Moves beyond District averages to **Pincode-level** precision.
*   **15-Day Pulse**: Aggregates daily logs into 15-day trends to filter noise and detect real attrition.
*   **5-Color Logic Matrix**:
    *   🔴 **CRITICAL**: <10% Capacity (Dead Zone)
    *   🟠 **SEVERE**: <30% Capacity (Failing)
    *   🟡 **SHOCK**: Statistical Anomaly (Sudden Drop)
    *   🔵 **SURGE**: High Load (Need Reinforcement)
    *   🟢 **SAFE**: Healthy
*   **Interactive Map**: Visualizes the entire Indian network with polygon-based heatmaps.

---

## 🛠️ Tech Stack
*   **Processing Engine**: Python 3.10, Pandas, NumPy (Vectorized ETL Pipeline).
*   **Frontend**: HTML5, Vanilla JavaScript, Chart.js (Zero-dependency, lightweight).
*   **Data**: Processed 15.2 Million raw transaction records provided by UIDAI.

---

## 📂 Project Structure
```
├── docs/                   # Full Project Reports (PDF/DOCX)
├── frontend/               # The Web Dashboard (HTML/JS/JSON)
├── processing_engine/      # Python Analysis Logic
├── processed/              # Cleaned Master Datasets
└── data_cleaner/           # Raw Data Ingestion Code
```

## 🔌 How to Run
### 1. The Dashboard (MVP)
Simply open `frontend/index.html` in any modern browser. No server required (it uses pre-calculated JSON).

### 2. The Logic Engine
To re-run the analysis pipeline:
```bash
pip install pandas numpy
python -m processing_engine.run_analysis
```

---
