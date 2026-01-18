import pandas as pd
import numpy as np
from processing_engine.config import (
    HISTORY_PERIODS,
    MIN_HISTORY_PERIODS,
    IQR_MULTIPLIER,
    CHRONIC_SEVERE_THRESHOLD,
    CHRONIC_CRITICAL_THRESHOLD,
    PROVEN_CAPACITY_PERCENTILE,
    MIN_ACTIVITY_THRESHOLD
)

def detect_anomalies(df, metric_col):
    """
    Detects anomalies for a SPECIFIC metric (e.g., 'enrolment').
    Appends columns with prefix '{metric_col}_'.
    """
    print(f"   🔍 Analyzing Metric: {metric_col}...")
    
    # 1. Sort for Time-Series functions
    df = df.sort_values(['pincode', 'period_id'])
    
    # Copy series to avoid fragmentation
    series = df[metric_col].fillna(0)
    
    # 2. Time Windows
    short_window = 12 # 6 Months
    long_window = HISTORY_PERIODS # 1 Year
    
    # Grouper (Shift 1 for predictive logic - compare vs PAST)
    # We want to compare Current Period vs [Past-1, Past-2... Past-N]
    grouped_shifted = df.groupby('pincode')[metric_col].shift(1)
    
    # 3. Rolling Stats (Volatility - "Bank Fraud" Logic)
    # Calculate stats on the SHIFTED series (Recent Past)
    roll_median = grouped_shifted.rolling(window=short_window, min_periods=MIN_HISTORY_PERIODS).median()
    roll_q1 = grouped_shifted.rolling(window=short_window, min_periods=MIN_HISTORY_PERIODS).quantile(0.25)
    roll_q3 = grouped_shifted.rolling(window=short_window, min_periods=MIN_HISTORY_PERIODS).quantile(0.75)
    roll_iqr = roll_q3 - roll_q1
    
    # 4. Rolling Capacity (Long Term - "Infrastructure" Logic)
    roll_capacity = grouped_shifted.rolling(window=long_window, min_periods=MIN_HISTORY_PERIODS).quantile(PROVEN_CAPACITY_PERCENTILE)
    
    # 5. Define Bounds
    lower_limit = roll_q1 - (roll_iqr * IQR_MULTIPLIER)
    upper_limit = roll_q3 + (roll_iqr * IQR_MULTIPLIER)
    
    chronic_severe_limit = roll_capacity * CHRONIC_SEVERE_THRESHOLD
    chronic_critical_limit = roll_capacity * CHRONIC_CRITICAL_THRESHOLD
    
    # 6. Flag Anomalies
    is_active = roll_median >= MIN_ACTIVITY_THRESHOLD
    current_val = series
    
    # Store Analytical Columns (prefixed)
    # df[f'{metric_col}_median'] = roll_median
    # df[f'{metric_col}_capacity'] = roll_capacity
    
    # Logic A: Sudden Shock (Below Lower Limit)
    is_shock = (current_val < lower_limit) & is_active
    
    # Logic B: Surge (Above Upper Limit)
    is_surge = (current_val > upper_limit) & is_active
    
    # Logic C: Chronic Collapse
    # Critical: < 10%
    is_critical = (current_val < chronic_critical_limit) & is_active
    # Severe: < 30% but >= 10%
    is_severe = (current_val >= chronic_critical_limit) & (current_val < chronic_severe_limit) & is_active
    
    # 7. Append Results to DF
    df[f'{metric_col}_is_shock'] = is_shock
    df[f'{metric_col}_is_surge'] = is_surge
    df[f'{metric_col}_is_critical'] = is_critical
    df[f'{metric_col}_is_severe'] = is_severe
    
    # Priority Score (3=Crit, 2=Sev, 1=Shock, 4=Surge, 0=Safe)
    # We use a simple max-priority logic if multiple match (Critical trumps all)
    def get_priority(row):
        if row[f'{metric_col}_is_critical']: return 3 # RED
        if row[f'{metric_col}_is_severe']: return 2   # ORANGE
        if row[f'{metric_col}_is_shock']: return 1    # YELLOW
        if row[f'{metric_col}_is_surge']: return 4    # BLUE
        return 0
    
    df[f'{metric_col}_priority'] = df.apply(get_priority, axis=1)
    
    return df
