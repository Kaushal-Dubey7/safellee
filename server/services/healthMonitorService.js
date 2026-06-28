const mongoose = require('mongoose');
const fetch = require('node-fetch');
const { isCircuitOpen } = require('../utils/overpassClient');
const CrimeZone = require('../models/CrimeZone');

// Lazy-require to avoid circular dependency issues if twilioService
// itself imports something that eventually imports this file
let twilioClient = null;
try {
  twilioClient = require('./twilioService').client;
} catch (e) {
  console.log('Note: could not load twilio client for health check:', e.message);
}

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:8001';

// In-memory live state — updated every health check cycle
let currentHealthState = {
  overall: 'healthy',
  lastChecked: null,
  services: {}
};

const TIMEOUT_MS = 4000;

const withTimeout = (promise, ms = TIMEOUT_MS) => {
  return Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Health check timeout')), ms)
    )
  ]);
};

// ─── INDIVIDUAL HEALTH CHECKS ──────────────────────────────────────

const checkMongoDB = async () => {
  const start = Date.now();
  try {
    if (mongoose.connection.readyState !== 1) {
      return { status: 'down', responseTimeMs: Date.now() - start,
                error: `Connection state: ${mongoose.connection.readyState} (not connected)` };
    }
    await withTimeout(mongoose.connection.db.admin().ping(), 3000);
    return { status: 'healthy', responseTimeMs: Date.now() - start };
  } catch (err) {
    return { status: 'down', responseTimeMs: Date.now() - start, error: err.message };
  }
};

const checkOSRM = async () => {
  const start = Date.now();
  try {
    // Tiny fixed test route in central Delhi — cheap, deterministic
    const url = 'https://router.project-osrm.org/route/v1/driving/' +
      '77.2090,28.6139;77.2100,28.6145?overview=false';
    const res = await withTimeout(fetch(url, { signal: AbortSignal.timeout(3500) }), 4000);
    const data = await res.json();
    if (res.ok && data.routes) {
      return { status: 'healthy', responseTimeMs: Date.now() - start };
    }
    return { status: 'degraded', responseTimeMs: Date.now() - start,
              error: 'OSRM responded but with unexpected payload' };
  } catch (err) {
    return { status: 'down', responseTimeMs: Date.now() - start, error: err.message };
  }
};

const checkOverpass = async () => {
  // Reuses the EXISTING circuit breaker state — does not fire a new
  // network request, just reports the breaker's current knowledge
  const start = Date.now();
  try {
    const open = isCircuitOpen();
    return {
      status: open ? 'down' : 'healthy',
      responseTimeMs: Date.now() - start,
      error: open ? 'Circuit breaker open — repeated recent failures' : null
    };
  } catch (err) {
    return { status: 'degraded', responseTimeMs: Date.now() - start, error: err.message };
  }
};

const checkOpenWeatherMap = async () => {
  const start = Date.now();
  try {
    if (!process.env.OPENWEATHER_API_KEY) {
      return { status: 'down', responseTimeMs: 0, error: 'API key not configured' };
    }
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=28.6139&lon=77.2090&appid=${process.env.OPENWEATHER_API_KEY}`;
    const res = await withTimeout(fetch(url, { signal: AbortSignal.timeout(3500) }), 4000);
    if (res.ok) return { status: 'healthy', responseTimeMs: Date.now() - start };
    return { status: 'degraded', responseTimeMs: Date.now() - start,
              error: `HTTP ${res.status}` };
  } catch (err) {
    return { status: 'down', responseTimeMs: Date.now() - start, error: err.message };
  }
};

const checkNominatim = async () => {
  const start = Date.now();
  try {
    const url = 'https://nominatim.openstreetmap.org/reverse?lat=28.6139&lon=77.2090&format=json';
    const res = await withTimeout(fetch(url, {
      headers: { 'User-Agent': 'Safelle-Safety-App/1.0' },
      signal: AbortSignal.timeout(3500)
    }), 4000);
    if (res.ok) return { status: 'healthy', responseTimeMs: Date.now() - start };
    return { status: 'degraded', responseTimeMs: Date.now() - start, error: `HTTP ${res.status}` };
  } catch (err) {
    return { status: 'down', responseTimeMs: Date.now() - start, error: err.message };
  }
};

const checkMLService = async () => {
  const start = Date.now();
  try {
    const res = await withTimeout(fetch(`${ML_SERVICE_URL}/health`, {
      signal: AbortSignal.timeout(3000)
    }), 3500);
    const data = await res.json();
    if (res.ok && data.model_loaded === true) {
      return { status: 'healthy', responseTimeMs: Date.now() - start };
    }
    return { status: 'degraded', responseTimeMs: Date.now() - start,
              error: 'ML service reachable but model not loaded — formula fallback active' };
  } catch (err) {
    return { status: 'degraded', responseTimeMs: Date.now() - start,
              error: `ML service unreachable: ${err.message} — formula fallback active` };
  }
};

const checkTwilio = async () => {
  const start = Date.now();
  try {
    if (!twilioClient || !process.env.TWILIO_ACCOUNT_SID) {
      return { status: 'down', responseTimeMs: 0, error: 'Twilio client not configured' };
    }
    // Lightweight account fetch — validates credentials, costs nothing,
    // sends no real SMS/call
    await withTimeout(
      twilioClient.api.accounts(process.env.TWILIO_ACCOUNT_SID).fetch(),
      3500
    );
    return { status: 'healthy', responseTimeMs: Date.now() - start };
  } catch (err) {
    return { status: 'down', responseTimeMs: Date.now() - start, error: err.message };
  }
};

const checkSocketIO = (ioInstance) => {
  const start = Date.now();
  try {
    if (!ioInstance) {
      return { status: 'down', responseTimeMs: 0, error: 'Socket.io not initialized' };
    }
    const connectedClients = ioInstance.engine?.clientsCount ?? 0;
    return {
      status: 'healthy',
      responseTimeMs: Date.now() - start,
      meta: { connectedClients }
    };
  } catch (err) {
    return { status: 'degraded', responseTimeMs: Date.now() - start, error: err.message };
  }
};

const checkCrimeDataIntegrity = async () => {
  // Not a network check — checks OUR OWN data completeness, catching
  // a bad seed or accidentally emptied collection. This is what makes
  // the diagnosis genuinely "self-aware" of internal state, not just
  // external network reachability.
  const start = Date.now();
  try {
    const count = await withTimeout(CrimeZone.countDocuments(), 3000);
    if (count === 0) {
      return { status: 'down', responseTimeMs: Date.now() - start,
                error: 'Crime zone collection is empty — re-run seed script' };
    }
    if (count < 10) {
      return { status: 'degraded', responseTimeMs: Date.now() - start,
                error: `Only ${count} crime zones found — coverage may be incomplete` };
    }
    return { status: 'healthy', responseTimeMs: Date.now() - start, meta: { zoneCount: count } };
  } catch (err) {
    return { status: 'down', responseTimeMs: Date.now() - start, error: err.message };
  }
};

// ─── AGGREGATE OVERALL STATUS ──────────────────────────────────────
// Not all services are equally critical. MongoDB and Twilio down =
// genuinely critical (SOS depends on Twilio). Overpass/weather down
// just means a fallback is active — degraded, not critical.

const CRITICAL_SERVICES = ['mongodb', 'twilio'];

const calculateOverallStatus = (services) => {
  const entries = Object.entries(services);

  const criticalDown = entries.some(
    ([name, s]) => CRITICAL_SERVICES.includes(name) && s.status === 'down'
  );
  if (criticalDown) return 'down';

  const anyDown = entries.some(([, s]) => s.status === 'down');
  const anyDegraded = entries.some(([, s]) => s.status === 'degraded');

  if (anyDown || anyDegraded) return 'degraded';
  return 'healthy';
};

// ─── RUN ALL CHECKS ─────────────────────────────────────────────────

const runHealthChecks = async (ioInstance = null) => {
  const [
    mongodb, osrm, overpass, weather, nominatim,
    mlService, twilio, crimeData
  ] = await Promise.all([
    checkMongoDB(),
    checkOSRM(),
    checkOverpass(),
    checkOpenWeatherMap(),
    checkNominatim(),
    checkMLService(),
    checkTwilio(),
    checkCrimeDataIntegrity()
  ]);

  const socketio = checkSocketIO(ioInstance);

  const services = { mongodb, osrm, overpass, weather, nominatim,
                       mlService, twilio, socketio, crimeData };

  const overall = calculateOverallStatus(services);

  currentHealthState = {
    overall,
    lastChecked: new Date().toISOString(),
    services
  };

  return currentHealthState;
};

const getCurrentHealthState = () => currentHealthState;

module.exports = { runHealthChecks, getCurrentHealthState };
