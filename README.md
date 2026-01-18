# Project Pragati 🇮🇳
![UIDAI Logo](frontend/assets/uidai_logo.svg)
### Predictive Lifecycle Analytics for Aadhaar Inclusion
**UIDAI Hackathon 2026 - Team ID: UIDAI_5553**

---

### **UIDAI ID** | UIDAI_5553
### Team
*   **Vikas Lavaniya** (Technical Lead)
*   **Kritika** (Analytics Lead)

---
## 📊 Live Demo
*   **Dashboard**: [Project Pragati](https://projectpragati.pages.dev)

---

![Project Status](https://img.shields.io/badge/Status-Prototype%20Complete-green)
![Tech Stack](https://img.shields.io/badge/Stack-Python%20|%20Pandas%20|%20JS-blue)

## 📖 Overview
**Project Pragati** is a "Live Nervous System" for Aadhaar infrastructure. 
While traditional dashboards track State-level averages, Pragati processes **19,000+ Pincodes** individually to detect "Dark Spots"—centers where mandatory biometric updates (Age 5/15) have silently collapsed. 

Our goal: **Prevent citizen exclusion before it happens.**

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



