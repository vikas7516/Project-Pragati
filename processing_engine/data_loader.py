import pandas as pd
import os

MASTER_FILE = 'processed/master_dataset.csv'
# Updated: Use comprehensive address file instead of deleted pincode_mapping.csv
ADDRESS_FILE = 'processed/pincode-adress.csv'

def load_data():
    """
    Loads master dataset and joins with pincode metadata.
    Returns: DataFrame with [pincode, period_id, enrolment, biometric, demographic, state, district]
    """
    if not os.path.exists(MASTER_FILE):
        raise FileNotFoundError(f"Master file missing: {MASTER_FILE}. Run build_master.py first.")
        
    print(f"📥 Loading Master Data from {MASTER_FILE}...")
    df = pd.read_csv(MASTER_FILE)
    
    # Convert pincode to int
    df['pincode'] = pd.to_numeric(df['pincode'], errors='coerce').fillna(0).astype(int)
    
    # Load Metadata (State/District) from Address File
    if os.path.exists(ADDRESS_FILE):
        print(f"🗺️  Loading Metadata from {ADDRESS_FILE}...")
        addr_df = pd.read_csv(ADDRESS_FILE, dtype={'pincode': str})
        
        # Clean pincode
        addr_df['pincode'] = pd.to_numeric(addr_df['pincode'], errors='coerce').fillna(0).astype(int)
        
        # Deduplicate by pincode (keep first occurrence)
        addr_df = addr_df.drop_duplicates(subset=['pincode'], keep='first')
        
        # Select only needed columns and rename for consistency
        meta_df = addr_df[['pincode', 'statename', 'district']].copy()
        meta_df = meta_df.rename(columns={'statename': 'state'})
        
        # Merge (Inner Join to Drop Invalid Pincodes)
        df = df.merge(meta_df, on='pincode', how='inner')
        
        # Log cleanup result
        print(f"✅ Filtered to {df['pincode'].nunique()} valid official pincodes.")
    else:
        print("⚠️ Address file missing. Location info will be empty.")
        df['state'] = 'Unknown'
        df['district'] = 'Unknown'
        
    return df
