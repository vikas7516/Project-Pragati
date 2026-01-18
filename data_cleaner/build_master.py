import pandas as pd
import numpy as np
import os
import glob
import re

# CONFIGURATION
RAW_DATA_DIR = 'aadhar-data'
OUTPUT_DIR = 'processed'
MASTER_FILE = os.path.join(OUTPUT_DIR, 'master_dataset.csv')
MAPPING_FILE = os.path.join(OUTPUT_DIR, 'pincode_mapping.csv')

def get_category_from_path(filepath):
    """
    Determines category based on file path keywords.
    """
    lower_path = filepath.lower()
    if 'enrolment' in lower_path:
        return 'enrolment'
    elif 'biometric' in lower_path:
        return 'biometric'
    elif 'demographic' in lower_path:
        return 'demographic'
    return 'unknown'

def build_master_dataset():
    print("Starting Data Cleaning & Aggregation Pipeline...")
    
    # 1. Crawl Files
    all_files = glob.glob(os.path.join(RAW_DATA_DIR, "**/*.csv"), recursive=True)
    if not all_files:
        print("No CSV files found in aadhar-data!")
        return

    print(f"Found {len(all_files)} files. Processing...")
    
    chunk_list = []
    
    # 2. Process Each File
    for f in all_files:
        try:
            # Determine Metric Type
            category = get_category_from_path(f)
            if category == 'unknown':
                print(f" Skipping unknown file type: {f}")
                continue
                
            df = pd.read_csv(f)
            
            # Standardize Columns
            df.columns = [c.lower().strip().replace(" ", "_") for c in df.columns]
            
            # Ensure Date & Pincode exist
            if 'date' not in df.columns or 'pincode' not in df.columns:
                print(f" Skipping invalid schema in: {f}")
                continue
                
            # Filter valid metrics (sums age columns often named like 'age_0_5', 'bio_age_17_')
            metric_cols = [c for c in df.columns if 'age' in c or 'count' in c]
            if not metric_cols:
                # Fallback if pre-processed
                if 'count' in df.columns:
                    metric_cols = ['count']
                else:
                    print(f" No metric columns found in: {f}")
                    continue
            
            # Sum for Total Count per Record
            df['count'] = df[metric_cols].sum(axis=1)
            
            # Keep only essentials
            keep_cols = ['date', 'pincode', 'state', 'district', 'count']
            df = df[keep_cols].copy()
            df['category'] = category # Tag it for pivoting later
            
            chunk_list.append(df)
            print(f" Processed {os.path.basename(f)} ({category}) -> {len(df)} rows")
            
        except Exception as e:
            print(f" Error processing {f}: {e}")
            import traceback
            traceback.print_exc()

    if not chunk_list:
        print("No valid data chunks created.")
        return

    # 3. Concatenate All
    full_df = pd.concat(chunk_list, ignore_index=True)
    print(f" Total Raw Rows: {len(full_df)}")
    
    # Clean Pincodes
    full_df = full_df.dropna(subset=['pincode', 'date'])
    full_df['pincode'] = pd.to_numeric(full_df['pincode'], errors='coerce').fillna(0).astype(int)
    full_df = full_df[full_df['pincode'] > 0]
    
    # 4. Extract Static Metadata (Skip export, but keep date parsing)
    # print(" Extracting Pincode Metadata...") (Deprecated export)
    
    # ROBUST DATE PARSING (Required for Step 5)
    full_df['date'] = pd.to_datetime(full_df['date'], dayfirst=True, format='mixed', errors='coerce')
    full_df = full_df.dropna(subset=['date']) # Drop rows where date failed parsing
    
    # 5. Period Aggregation (15-Day Buckets)
    print(" Aggregating into 15-Day Periods...")
    full_df['year'] = full_df['date'].dt.year
    full_df['month'] = full_df['date'].dt.month
    full_df['day'] = full_df['date'].dt.day
    
    # Period Logic: Day 1-15 = 0, Day 16+ = 1
    full_df['half_month'] = np.where(full_df['day'] <= 15, 0, 1)
    # Unique ID: Year * 24 + Month * 2 + Half
    full_df['period_id'] = (full_df['year'] * 24) + (full_df['month'] * 2) + full_df['half_month']
    
    # 6. Pivot Metrics
    # Group By: Pincode, Period ID, Category
    # Sum: Count
    grouped = full_df.groupby(['pincode', 'period_id', 'category'])['count'].sum().reset_index()
    
    # Pivot to Columns
    pivot_df = grouped.pivot_table(
        index=['pincode', 'period_id'],
        columns='category',
        values='count',
        fill_value=0
    ).reset_index()
    
    # Flatten Columns
    pivot_df.columns.name = None
    
    # Ensure all target columns exist (fill 0 if missing)
    expected_cols = ['enrolment', 'biometric', 'demographic']
    for col in expected_cols:
        if col not in pivot_df.columns:
            pivot_df[col] = 0
            
    # Final Schema Selection
    final_df = pivot_df[['pincode', 'period_id', 'enrolment', 'biometric', 'demographic']].copy()

    # Convert to Integers
    for col in ['enrolment', 'biometric', 'demographic']:
        final_df[col] = final_df[col].astype(int)
    
    # Sort
    final_df = final_df.sort_values(['pincode', 'period_id'])
    
    # 7. Save Master Dataset
    if not os.path.exists(OUTPUT_DIR):
        os.makedirs(OUTPUT_DIR)
        
    final_df.to_csv(MASTER_FILE, index=False)
    print(f" Saved Master Dataset: {MASTER_FILE}")
    print(f"   Shape: {final_df.shape}")
    print(" Data Cleaning Complete.")

if __name__ == "__main__":
    build_master_dataset()
