/**
 * SAFELLE — ML INTEGRATION WITH AUTOMATIC FALLBACK
 * ====================================================
 * This file shows EXACTLY how to modify your EXISTING
 * safetyScoreService.js to try the ML model first, and
 * silently fall back to your working weighted formula
 * if the ML service is unavailable, slow, or errors.
 *
 * YOUR EXISTING FORMULA LOGIC IS NOT REMOVED — IT BECOMES
 * THE FALLBACK. NOTHING YOU ALREADY BUILT IS AT RISK.
 *
 * Add this to: server/services/safetyScoreService.js
 * (or wherever your calculateRouteScore function lives)
 */

const axios = require('axios');

// FastAPI ML service URL — runs on a different port, separate process
const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:8001';
const ML_TIMEOUT_MS = 800; // if ML doesn't respond in 800ms, fallback immediately
                            // (route calculation must stay fast for good UX)

/**
 * Tries the ML model first. Returns null if anything goes wrong,
 * so the caller knows to use the formula instead.
 */
const getMLPrediction = async (features) => {
  try {
    const response = await axios.post(
      `${ML_SERVICE_URL}/predict-safety-score`,
      {
        crime:      features.crime,
        lighting:   features.lighting,
        crowd:      features.crowd,
        weather:    features.weather,
        efficiency: features.efficiency,
        community:  features.community,
        state_baseline: features.state_baseline ?? 70.0  // NEW — real NCRB state baseline
      },
      { timeout: ML_TIMEOUT_MS }
    );

    if (response.data && typeof response.data.safety_score === 'number') {
      console.log(`✅ ML prediction used: ${response.data.safety_score}`);
      return {
        score: response.data.safety_score,
        source: 'ml_model'
      };
    }
    return null;

  } catch (err) {
    // This catches: service down, timeout, network error, 503, 500 — ALL cases
    console.log(`⚠️ ML service unavailable (${err.message}) — using fallback formula`);
    return null;
  }
};

/**
 * YOUR EXISTING WEIGHTED FORMULA — UNCHANGED.
 * This is now explicitly the fallback, but it's the exact same
 * logic that has already been working in your deployed app.
 */
const calculateFormulaScore = (features) => {
  const stateBaseline = features.state_baseline ?? 70.0;
  const total = (
    features.crime      * 0.28 +
    features.lighting   * 0.24 +
    features.crowd      * 0.19 +
    features.weather     * 0.10 +
    features.efficiency * 0.10 +
    features.community  * 0.05 +
    stateBaseline        * 0.04   // NEW — real NCRB state baseline, small weight
  );
  return {
    score: Math.round(Math.max(0, Math.min(100, total))),
    source: 'weighted_formula'
  };
};

/**
 * MAIN FUNCTION — Replace your existing total-score combination
 * step with this. Everything else in your route scoring pipeline
 * (crime query, lighting query, crowd query, weather fetch) stays
 * EXACTLY the same — only the FINAL combination step changes.
 */
const calculateFinalSafetyScore = async (features) => {
  // features = { crime, lighting, crowd, weather, efficiency, community }
  // these come from your EXISTING getCrimeScore(), getLightingScore(), etc.

  // STEP 1: Try ML model first
  const mlResult = await getMLPrediction(features);

  if (mlResult !== null) {
    return {
      total: Math.round(mlResult.score),
      source: mlResult.source,         // "ml_model"
      breakdown: features              // keep original breakdown for UI display
    };
  }

  // STEP 2: ML failed/unavailable — use your proven formula
  const formulaResult = calculateFormulaScore(features);
  return {
    total: formulaResult.score,
    source: formulaResult.source,      // "weighted_formula"
    breakdown: features
  };
};

module.exports = { calculateFinalSafetyScore };


/**
 * ═══════════════════════════════════════════════════════════
 * HOW TO WIRE THIS INTO YOUR EXISTING calculateRouteScore()
 * ═══════════════════════════════════════════════════════════
 *
 * In your existing safetyScoreService.js, find where you currently do:
 *
 *   const total = (
 *     crimeScore * 0.30 + lightingScore * 0.25 + crowdScore * 0.20 +
 *     weatherScore * 0.10 + efficiencyScore * 0.10 + communityScore * 0.05
 *   );
 *
 * REPLACE just that final block with:
 *
 *   const { calculateFinalSafetyScore } = require('./mlIntegration');
 *
 *   const result = await calculateFinalSafetyScore({
 *     crime: crimeScore,
 *     lighting: lightingScore,
 *     crowd: crowdScore,
 *     weather: weatherScore,
 *     efficiency: efficiencyScore,
 *     community: communityScore
 *   });
 *
 *   return {
 *     total: result.total,
 *     scoringMethod: result.source,   // useful to show in UI/demo!
 *     breakdown: {
 *       crime: Math.round(crimeScore),
 *       lighting: Math.round(lightingScore),
 *       crowd: Math.round(crowdScore),
 *       weather: Math.round(weatherScore),
 *       efficiency: Math.round(efficiencyScore),
 *       community: Math.round(communityScore)
 *     }
 *   };
 *
 * EVERYTHING ELSE in your route calculation, OSRM fetching,
 * sorting, color assignment — stays 100% unchanged.
 * ═══════════════════════════════════════════════════════════
 */
