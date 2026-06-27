const fetch = require('node-fetch');

const OVERPASS_MIRRORS = [
  'https://overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
  'https://lz4.overpass-api.de/api/interpreter'
];

// Simple in-memory cache to avoid hammering Overpass repeatedly
// Key: rounded coordinates + query type, TTL: 10 minutes
const overpassCache = new Map();
const CACHE_TTL_MS = 10 * 60 * 1000;

// ─── CIRCUIT BREAKER ─────────────────────────────────────────────────
// Stops retrying Overpass entirely for a cooldown period after repeated
// failures, so the app stops wasting time on a known-unreachable service
let overpassCircuitOpen = false;
let circuitOpenedAt = null;
const CIRCUIT_COOLDOWN_MS = 60 * 1000; // stop trying for 60 sec after failures
let consecutiveFailures = 0;
const FAILURE_THRESHOLD = 3; // open circuit after 3 consecutive total failures

const isCircuitOpen = () => {
  if (!overpassCircuitOpen) return false;
  if (Date.now() - circuitOpenedAt > CIRCUIT_COOLDOWN_MS) {
    console.log('🔄 Overpass circuit breaker: cooldown expired, trying again');
    overpassCircuitOpen = false;
    consecutiveFailures = 0;
    return false;
  }
  return true;
};

const recordFailure = () => {
  consecutiveFailures++;
  if (consecutiveFailures >= FAILURE_THRESHOLD && !overpassCircuitOpen) {
    overpassCircuitOpen = true;
    circuitOpenedAt = Date.now();
    console.log(
      `🔴 Overpass circuit breaker OPENED — too many failures. ` +
      `Skipping Overpass calls for ${CIRCUIT_COOLDOWN_MS/1000}s, using fallbacks instead.`
    );
  }
};

const recordSuccess = () => {
  consecutiveFailures = 0;
  overpassCircuitOpen = false;
};

// ─── CACHE KEY HELPER ────────────────────────────────────────────────
const getCacheKey = (lat, lng, queryType) => {
  const roundedLat = Math.round(lat * 1000) / 1000;
  const roundedLng = Math.round(lng * 1000) / 1000;
  return `${queryType}_${roundedLat}_${roundedLng}`;
};

/**
 * Robust Overpass query function with:
 * - Circuit breaker to skip calls when Overpass is known-unreachable
 * - Content-type validation before parsing JSON
 * - PARALLEL race across all mirror servers (fastest wins)
 * - In-memory caching to reduce duplicate calls
 * - Short 3s timeout to avoid blocking the route response
 */
const queryOverpass = async (query, cacheKey = null) => {
  // Check cache first
  if (cacheKey && overpassCache.has(cacheKey)) {
    const cached = overpassCache.get(cacheKey);
    if (Date.now() - cached.timestamp < CACHE_TTL_MS) {
      return cached.data;
    }
    overpassCache.delete(cacheKey);
  }

  // CIRCUIT BREAKER: skip Overpass entirely if it's known to be down
  if (isCircuitOpen()) {
    throw new Error('Overpass circuit breaker open — skipping call, using fallback');
  }

  const tryMirror = async (mirrorUrl) => {
    const response = await fetch(mirrorUrl, {
      method: 'POST',
      body: query,
      headers: {
        'Content-Type': 'text/plain',
        'User-Agent': 'Safelle-Safety-App/1.0 (hackathon-project)'
      },
      signal: AbortSignal.timeout(3000) // 3 second timeout (reduced from 8s)
    });

    const contentType = response.headers.get('content-type') || '';

    // CRITICAL CHECK: verify it's actually JSON before parsing
    if (!response.ok || !contentType.includes('application/json')) {
      throw new Error(`Non-JSON response from ${mirrorUrl} (status ${response.status})`);
    }

    return await response.json();
  };

  try {
    // Race all 3 mirrors in PARALLEL — use whichever responds first
    // This turns "24 sec worst case sequential" into "3 sec worst case parallel"
    const data = await Promise.any(OVERPASS_MIRRORS.map(tryMirror));

    recordSuccess();

    // Cache successful result
    if (cacheKey) {
      overpassCache.set(cacheKey, { data, timestamp: Date.now() });
    }

    return data;

  } catch (aggregateError) {
    recordFailure();
    console.log(`⚠️ All Overpass mirrors failed in parallel attempt`);
    throw new Error('All Overpass mirrors failed');
  }
};

module.exports = { queryOverpass, getCacheKey, isCircuitOpen };
