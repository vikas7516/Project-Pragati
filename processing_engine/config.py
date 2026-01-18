
# PROCESSING ENGINE CONSTANTS & THRESHOLDS
# DEFINITIVE SOURCE OF TRUTH FOR PROJECT PRAGATI LOGIC

# ==============================================================================
# 1. TIME PERIODS & HISTORY
# ==============================================================================
DAYS_PER_PERIOD = 15
HISTORY_MONTHS = 12
HISTORY_PERIODS = 24    # 1 Year of 15-day periods
MIN_HISTORY_PERIODS = 6 # Need at least 3 months to build a profile

# ==============================================================================
# 2. ANOMALY DETECTION CONFIG (HYBRID PROFILING)
# ==============================================================================

# CHECK A: SHORT-TERM VOLATILITY (Sudden Shock)
# Uses "Bank Fraud" Logic: Median +/- (IQR * Multiplier)
# Detects sudden deviations from the center's recent "Normal Range".
IQR_MULTIPLIER = 1.5 
# Lower Bound = Q1 - 1.5*IQR
# Upper Bound = Q3 + 1.5*IQR (Surge Limit)

# CHECK B: LONG-TERM CAPACITY (Chronic Collapse)
# Uses "Infrastructure" Logic: Comparison to Proven Capacity.
# Detects centers that have normalized to a low level.
PROVEN_CAPACITY_PERCENTILE = 0.90   # 90th Percentile of last year = Capacity
CHRONIC_SEVERE_THRESHOLD = 0.30     # Anomaly if volume < 30% of Capacity (Failing)
CHRONIC_CRITICAL_THRESHOLD = 0.10   # Anomaly if volume < 10% of Capacity (Dead)

MIN_ACTIVITY_THRESHOLD = 10         # Ignore very bottom noise

# ==============================================================================
# 3. PRIORITY LEVELS
# ==============================================================================
PRIORITY_CRITICAL = 3   # Red (Dead)
PRIORITY_SEVERE = 2     # Orange (Failing)
PRIORITY_SHOCK = 1      # Yellow (Warning)
PRIORITY_SURGE = 4      # Blue (Growth)
PRIORITY_SAFE = 0       # Green (Normal)
