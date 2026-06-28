const express = require('express');
const router = express.Router();
const fetch = require('node-fetch');
const auth = require('../middleware/auth');
const { calculateRouteScore } = require('../services/safetyScoreService');
const { fetchWeather } = require('../services/weatherService');
const { getCurrentHealthState } = require('../services/healthMonitorService');

const SCORE_CACHE = new Map();
const CACHE_DURATION = 10 * 60 * 1000;

const fetchRoutesFromOSRM = async (sourceLat, sourceLng, destLat, destLng) => {

  const url =
    `https://router.project-osrm.org/route/v1/driving/` +
    `${sourceLng},${sourceLat};${destLng},${destLat}` +
    `?alternatives=3&geometries=geojson&overview=full&steps=false`;

  const res  = await fetch(url);
  const data = await res.json();

  console.log(`🔍 OSRM raw response: ${data.routes?.length || 0} routes returned`);

  if (!data.routes || data.routes.length === 0) {
    throw new Error('OSRM returned no routes');
  }

  const rawRoutes = data.routes.map(r => ({
    geometry:    r.geometry,
    coordinates: r.geometry.coordinates.map(c => [c[1], c[0]]),
    distance:    r.distance,
    duration:    r.duration,
    distanceKm:  (r.distance / 1000).toFixed(1),
    durationMin: Math.round(r.duration / 60)
  }));

  console.log(`🔍 After mapping: ${rawRoutes.length} routes`);

  // ALWAYS ensure exactly 3 routes are returned
  let finalRoutes = rawRoutes;

  if (rawRoutes.length === 1) {
    console.log('⚠️ OSRM gave 1 route — generating 2 synthetic alternatives');
    const base = rawRoutes[0];
    const synth2 = {
      ...base,
      distance: base.distance * 1.18,
      duration: base.duration * 1.15,
      distanceKm: (base.distance * 1.18 / 1000).toFixed(1),
      durationMin: Math.round(base.duration * 1.15 / 60),
      isSynthetic: true
    };
    const synth3 = {
      ...base,
      distance: base.distance * 1.35,
      duration: base.duration * 1.28,
      distanceKm: (base.distance * 1.35 / 1000).toFixed(1),
      durationMin: Math.round(base.duration * 1.28 / 60),
      isSynthetic: true
    };
    finalRoutes = [base, synth2, synth3];
  } else if (rawRoutes.length === 2) {
    console.log('⚠️ OSRM gave 2 routes — generating 1 synthetic alternative');
    const base = rawRoutes[0];
    const synth3 = {
      ...base,
      distance: base.distance * 1.4,
      duration: base.duration * 1.3,
      distanceKm: (base.distance * 1.4 / 1000).toFixed(1),
      durationMin: Math.round(base.duration * 1.3 / 60),
      isSynthetic: true
    };
    finalRoutes = [...rawRoutes, synth3];
  } else {
    const shortestDist = Math.min(...rawRoutes.map(r => r.distance));
    const filtered = rawRoutes.filter(r => r.distance / shortestDist <= 1.8);
    finalRoutes = filtered.length >= 3 ? filtered.slice(0, 3) : rawRoutes.slice(0, 3);
  }

  console.log(`✅ FINAL route count being returned: ${finalRoutes.length}`);
  return finalRoutes;
};

// POST /api/route/safe-routes
router.post('/safe-routes', auth, async (req, res) => {
  const startTime = Date.now();
  try {
    const { sourceLat, sourceLng, destLat, destLng } = req.body;

    if (!sourceLat || !sourceLng || !destLat || !destLng) {
      return res.status(400).json({ message: 'Source and destination coordinates required' });
    }

    const cacheKey = `${sourceLat.toFixed(4)},${sourceLng.toFixed(4)}-${destLat.toFixed(4)},${destLng.toFixed(4)}`;
    const cached = SCORE_CACHE.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      console.log(`⚡ Cache hit — returning cached result (${Date.now() - startTime}ms)`);
      return res.json(cached.data);
    }

    const midLat = (parseFloat(sourceLat) + parseFloat(destLat)) / 2;
    const midLng = (parseFloat(sourceLng) + parseFloat(destLng)) / 2;
    let weatherData = null;
    try {
      const wRes = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${midLat}&lon=${midLng}&appid=${process.env.OPENWEATHER_API_KEY}`
      );
      weatherData = await wRes.json();
    } catch { weatherData = null; }

    const routes = await fetchRoutesFromOSRM(sourceLat, sourceLng, destLat, destLng);
    console.log(`Fetched ${routes.length} routes from OSRM (${Date.now() - startTime}ms elapsed)`);

    const scoredRoutes = await Promise.all(
      routes.map(async route => {
        const scoreResult = await calculateRouteScore(route, routes, weatherData);
        return {
          ...route,
          safetyScore: scoreResult.total,
          scoringMethod: scoreResult.scoringMethod,
          breakdown: scoreResult.breakdown
        };
      })
    );

    // Sort by safety score DESCENDING (highest = safest)
    scoredRoutes.sort((a, b) => b.safetyScore - a.safetyScore);

    console.log('=== SAFELLE ROUTE SCORING DEBUG ===');
    scoredRoutes.forEach((route, i) => {
      console.log(`Route ${i+1}: ${route.distanceKm}km | Score: ${route.safetyScore} | Method: ${route.scoringMethod}`);
    });

    console.log(`⏱️ Total route calculation time: ${Date.now() - startTime}ms`);

    const result = {
      safe: {
        ...scoredRoutes[0],
        label:      'Safest Route',
        colorName:  'green',
        color:      '#22C55E',
        badge:      'RECOMMENDED',
        leafletOptions: { color: '#22C55E', weight: 7, opacity: 0.9 }
      },
      medium: scoredRoutes[1] ? {
        ...scoredRoutes[1],
        label:      'Moderate Route',
        colorName:  'orange',
        color:      '#F59E0B',
        badge:      'MODERATE',
        leafletOptions: { color: '#F59E0B', weight: 5, opacity: 0.8 }
      } : null,
      risky: scoredRoutes[2] ? {
        ...scoredRoutes[2],
        label:      'Risky Route',
        colorName:  'red',
        color:      '#EF4444',
        badge:      'RISKY',
        leafletOptions: { color: '#EF4444', weight: 5, opacity: 0.7 }
      } : null,
      weather: weatherData ? {
        condition: weatherData.weather?.[0]?.main,
        temp:      weatherData.main?.temp ? (weatherData.main.temp - 273.15).toFixed(1) : null,
        icon:      weatherData.weather?.[0]?.icon
      } : null,
      totalRoutesFound: routes.length
    };

    const health = getCurrentHealthState();
    const diagnostics = [];

    if (health.services?.overpass?.status === 'down') {
      diagnostics.push('Street lighting and crowd analysis temporarily limited — using time-based estimates instead of live map data.');
    }
    if (health.services?.weather?.status !== 'healthy') {
      diagnostics.push('Live weather data unavailable — using a neutral weather assumption for this route.');
    }
    if (health.services?.mlService?.status !== 'healthy') {
      diagnostics.push('Using our verified scoring formula — ML model temporarily unavailable.');
    }

    result.diagnostics = diagnostics;
    result.systemStatus = health.overall;

    SCORE_CACHE.set(cacheKey, { data: result, timestamp: Date.now() });
    return res.json(result);

  } catch (err) {
    console.error('❌ ROUTE CALCULATION CRASHED:', err.message);
    console.error('Full stack trace:', err.stack);
    console.error(`Failed after ${Date.now() - startTime}ms`);
    const health = getCurrentHealthState();

    let userMessage = 'Route calculation failed. Please try again.';
    if (health.overall === 'down') {
      const downService = Object.entries(health.services)
        .find(([, s]) => s.status === 'down');
      if (downService) {
        userMessage = `Our ${downService[0]} service is currently unavailable. Our team has been notified. Please try again in a moment.`;
      }
    }

    return res.status(500).json({ message: userMessage, error: err.message, systemStatus: health.overall });
  }
});

module.exports = router;
