import pandas as pd
import json
import os
import numpy as np
from processing_engine.data_loader import load_data
from processing_engine.analyzer import detect_anomalies
from processing_engine.config import PRIORITY_CRITICAL, PRIORITY_SEVERE, PRIORITY_SHOCK, PRIORITY_SURGE

OUTPUT_JSON = 'frontend/data/dashboard_data.json'

def convert_to_native(obj):
    if isinstance(obj, np.integer): return int(obj)
    if isinstance(obj, np.floating): return float(obj)
    if isinstance(obj, np.ndarray): return obj.tolist()
    return obj

def run_pipeline():
    print("Starting Intelligence Pipeline...")
    
    # 1. Load Unified Data
    df = load_data()
    
    # Filter out invalid pincodes (Artifacts)
    df = df[df['pincode'] != 100000]
    print(f" Data Loaded. {len(df)} rows after cleanup.")
    
    # 2. Run Analysis Passes
    # Pass 1: Enrolment
    df = detect_anomalies(df, 'enrolment')
    # Pass 2: Biometric
    df = detect_anomalies(df, 'biometric')
    # Pass 3: Demographic
    df = detect_anomalies(df, 'demographic')
    
    print(" Analysis Complete. Grouping details for Dashboard...")
    
    # 3. Aggregation & Formatting for JSON
    # We need a structure:
    # { "110001": { "state": "Delhi", "district": "New Delhi", "enrolment": { "priority": 3, "history": [...] }, ... } }
    
    output_data = {}
    
    # Sort for History
    df = df.sort_values(['pincode', 'period_id'])
    
    # Group by Pincode
    grouped = df.groupby('pincode')
    
    total_pincodes = len(grouped)
    curr = 0
    
    for pincode, group in grouped:
        curr += 1
        if curr % 2000 == 0:
            print(f"   Processed {curr}/{total_pincodes} pincodes...")
            
        # Get Latest Row for Status
        latest = group.iloc[-1]
        
        # Metadata
        pincode_str = str(int(pincode))
        state = latest['state'] if pd.notna(latest['state']) else "Unknown"
        district = latest['district'] if pd.notna(latest['district']) else "Unknown"
        
        # History Arrays (Ensure exactly 24 Periods for consistent graph)
        history_len = 24
        
        # Determine strict period range based on latest period
        latest_period = int(group['period_id'].max())
        # Generate expected last 24 periods: [p-23, p-22, ..., p]
        expected_periods = list(range(latest_period - history_len + 1, latest_period + 1))
        
        # Reindex group to ensure all periods exist (fill 0 for missing)
        group_indexed = group.set_index('period_id')
        
        # Helper to build category object with padding
        def build_cat_obj(metric):
            priority = int(latest[f'{metric}_priority'])
            # Get flags as list of strings
            flags = []
            if latest[f'{metric}_is_critical']: flags.append('critical')
            if latest[f'{metric}_is_severe']: flags.append('severe')
            if latest[f'{metric}_is_shock']: flags.append('shock')
            if latest[f'{metric}_is_surge']: flags.append('surge')
            
            # Extract history aligned to expected_periods
            hist_vals = []
            for pid in expected_periods:
                if pid in group_indexed.index:
                    hist_vals.append(int(group_indexed.loc[pid, metric]))
                else:
                    hist_vals.append(0) # Pad with 0 if missing
            
            return {
                "priority": priority,
                "flags": flags,
                "history": hist_vals,
                "latest_vol": int(latest[metric])
            }
        
        output_data[pincode_str] = {
            "state": state,
            "district": district,
            "enrolment": build_cat_obj('enrolment'),
            "biometric": build_cat_obj('biometric'),
            "demographic": build_cat_obj('demographic'),
            "periods": expected_periods # Shared X-Axis (Fixed 24)
        }
        
    # 4. Save JSON
    if not os.path.exists('frontend/data'):
        os.makedirs('frontend/data')
        
    print(f"Saving Dashboard Data to {OUTPUT_JSON}...")
    with open(OUTPUT_JSON, 'w') as f:
        json.dump(output_data, f, default=convert_to_native) # using default just in case
        
    print(f"Pipeline Success! Exported {len(output_data)} pincodes.")

if __name__ == "__main__":
    run_pipeline()
