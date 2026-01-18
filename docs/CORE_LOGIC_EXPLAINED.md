# PROJECT PRAGATI: CORE LOGIC EXPLAINED (FOR JURY)

## 1. The Core Philosophy
**"Compare Apples to Apples."**
We don't compare a small village center to a busy district headquarters. That would be unfair.
Instead, we group similar pincodes together and look for **abnormal behavior** within that group.

---

## 2. Step-by-Step Logic

### Step A: Grouping (Finding Peers)
**Question:** "What counts as 'normal' traffic for this area?"
**Logic:**
1. We calculate the **Median Volume** for every pincode (Median is better than Average because it ignores sudden spikes like camps).
2. We group pincodes into **"Activity Bands"**:
   - **Band A (High Activity):** Pincodes handling >1000 people/15-days.
   - **Band B (Medium Activity):** 200-1000 people.
   - **Band C (Low Activity):** 50-200 people.
   - **Band D (Micro Activity):** <50 people (We exclude these from strict monitoring to avoid false alarms).

### Step B: Anomaly Detection (The "Real Drop" Rule)
**Question:** "Is this pincode underperforming?"
**Logic:**
We flag a pincode ONLY if it fails **Two Tests** simultaneously:
1. **The Percentage Test:** Did it drop by more than **50%** compared to its peer median?
2. **The Absolute Test:** Did it lose a **significant number** of people?
   *   *(Why? Because dropping from 6 to 2 is a 66% drop, but it's just 4 people. We ignore that.)*
   *   Rule: Must lose at least **30 people** (for low volume) or **100 people** (for high volume) to count.

### Step C: Noise Filtering (The "Festival Filter")
**Question:** "What if it's just a holiday or festival?"
**Logic:**
- A festival usually lasts a few days or weeks.
- We only flag a pincode if it is down for **2 consecutive periods (1 month)**.
- If it dips for 15 days and bounces back, we assume it was a temporary event and ignore it.

### Step D: Priority Scoring (The "Crisis Meter")
**Question:** "Who needs help first?"
**Logic:**
We look at the last **6 months** (12 periods) of performance.
- **Purple (Critical):** Flagged in 5-6 months. (Chronic Failure).
- **Red (High):** Flagged in 3-4 months. (Persistent Issue).
- **Orange (Medium):** Flagged in 2 months. (Emerging Problem).
- **Yellow (Low):** Flagged on 1 month only. (Watchlist).
- **Green (Safe):** Healthy performance.

---

## 3. Why This Approach is Better?
1. **It's Fair:** Village centers aren't punished for being small.
2. **It's Accurate:** We strictly filter out "small number noise" (6 vs 2).
3. **It's Stable:** We ignore temporary blips (festivals) and focus on long-term trends.
4. **It's Self-Correcting:** As new data comes in, the "Activity Bands" update automatically.

This ensures the government only deploys resources (Vans/Centers) where there is a **Real, Verified, and Persistent** problem.
