/**
 * SAFELLE — STATE SAFETY BASELINE LOOKUP TABLE
 * ================================================
 * Source: NCRB "Crime in India 2023" Report (Vol 1) — Crime Rate
 * (IPC+SLL crimes per lakh population), per state/UT.
 * Compiled from NCRB's official published statistics.
 *
 * HOW THIS WAS COMPUTED:
 * Raw NCRB crime rate (e.g. Delhi = 1602.0 per lakh population) is
 * min-max normalized and INVERTED into a 0-100 safety score, where
 * 100 = safest, 15 = least safe. Clipped to [15, 92] to avoid
 * overconfident extreme scores.
 *
 * ⚠️ IMPORTANT CAVEAT (mention this if asked — shows analytical maturity):
 * NCRB "Crime Rate" measures REGISTERED crimes, not actual crime levels.
 * States with stronger police reporting compliance (like Kerala, which
 * has a 96%+ chargesheet rate — among the highest in India) can show
 * HIGHER registered rates precisely because complaints are taken
 * seriously and recorded properly — not necessarily because the state
 * is more dangerous. NCRB itself documents this limitation. We use this
 * data because it's the best real, official source available, while
 * being transparent about what it does and doesn't measure.
 *
 * USAGE: This is a FALLBACK baseline only — used when a route passes
 * through a city/area with no manually seeded crime_zones data (i.e.
 * outside Delhi, Prayagraj, Aligarh). It replaces the old flat default
 * of 70 with a real, state-aware number.
 */

const STATE_CRIME_BASELINE = {
  // ── HIGHEST SAFETY BASELINE (92.0) — lowest registered crime rate ──
  "Arunachal Pradesh": 92.0,
  "Assam": 92.0,
  "Jharkhand": 92.0,
  "Meghalaya": 92.0,
  "Nagaland": 92.0,
  "Sikkim": 92.0,
  "Tripura": 92.0,
  "West Bengal": 92.0,
  "Dadra and Nagar Haveli and Daman and Diu": 92.0,
  "Ladakh": 92.0,
  "Lakshadweep": 92.0,

  // ── HIGH SAFETY BASELINE ──
  "Goa": 91.8,
  "Jammu and Kashmir": 90.4,
  "Punjab": 89.8,
  "Himachal Pradesh": 87.2,
  "Bihar": 86.5,
  "Uttarakhand": 85.7,
  "Puducherry": 84.7,
  "Karnataka": 84.1,
  "Mizoram": 83.4,

  // ── MODERATE SAFETY BASELINE — includes your 2 demo cities' state ──
  "Uttar Pradesh": 82.8,   // Aligarh + Prayagraj fall under this state
  "Chandigarh": 82.6,
  "Andhra Pradesh": 82.1,
  "Chhattisgarh": 79.9,
  "Rajasthan": 79.3,
  "Odisha": 76.7,
  "Andaman and Nicobar Islands": 74.6,
  "Maharashtra": 74.2,
  "Telangana": 73.5,
  "Madhya Pradesh": 67.8,
  "Manipur": 64.1,

  // ── LOWER SAFETY BASELINE — higher registered crime rate ──
  "Tamil Nadu": 59.4,
  "Haryana": 57.0,
  "Gujarat": 52.7,

  // ── FLOOR (15.0) — see caveat above re: Kerala's reporting compliance ──
  "Kerala": 15.0,
  "Delhi": 15.0,            // Delhi has its own manually seeded crime_zones
                             // (48 zones) — this baseline ONLY applies if
                             // a route falls outside all seeded Delhi zones

  // National average — used if state name doesn't match any key above
  "default": 70.0
};

/**
 * Returns the safety baseline (0-100) for a given state name.
 * Falls back to national average if state is misspelled/unmapped.
 */
const getStateBaseline = (stateName) => {
  if (!stateName) return STATE_CRIME_BASELINE["default"];
  return STATE_CRIME_BASELINE[stateName] ?? STATE_CRIME_BASELINE["default"];
};

module.exports = { STATE_CRIME_BASELINE, getStateBaseline };


/**
 * ═══════════════════════════════════════════════════════════
 * HOW TO USE THIS IN YOUR EXISTING getCrimeScore() FUNCTION
 * ═══════════════════════════════════════════════════════════
 *
 * In safetyScoreService.js, find your existing getCrimeScore function.
 * Currently it likely does:
 *
 *   if (zones.length === 0) return 70; // flat default
 *
 * REPLACE that single line with:
 *
 *   const { getStateBaseline } = require('./stateBaseline');
 *
 *   if (zones.length === 0) {
 *     // No manually seeded zone found — use real state-level NCRB baseline
 *     // instead of a flat guess. You'll need the state name, which you
 *     // can get from Nominatim's reverse geocode response (it returns
 *     // address.state for any lat/lng in India).
 *     return getStateBaseline(stateName);
 *   }
 *
 * You likely already call Nominatim for reverse geocoding when saving
 * route ratings (from the earlier address-display fix). Reuse that same
 * call here — the response includes address.state directly:
 *
 *   const geoRes = await fetch(
 *     `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
 *     { headers: { 'User-Agent': 'Safelle-App/1.0' } }
 *   );
 *   const geoData = await geoRes.json();
 *   const stateName = geoData.address?.state || null;
 * ═══════════════════════════════════════════════════════════
 */
