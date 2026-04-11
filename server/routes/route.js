const express = require('express');
const router = express.Router();
const fetch = require('node-fetch');
const auth = require('../middleware/auth');
const { calculateRouteScore } = require('../services/safetyScoreService');
const { fetchWeather } = require('../services/weatherService');

const SCORE_CACHE = new Map();
const CACHE_DURATION = 10 * 60 * 1000;

const fetchRoutesFromOSRM = async (sourceLat, sourceLng, destLat, destLng) => {
  const url = 
    `https://router.project-osrm.org/route/v1/driving/` +
    `${sourceLng},${sourceLat};${destLng},${destLat}` +
    `?alternatives=3&geometries=geojson&overview=full&steps=false`;

  const res  = await fetch(url);
  const data = await res.json();

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

  const shortestDist = Math.min(...rawRoutes.map(r => r.distance));
  const filtered = rawRoutes.filter(r => r.distance / shortestDist <= 1.8);
  return filtered;
};

// POST /api/route/safe-routes
router.post('/safe-routes', auth, async (req, res) => {
  try {
    const { sourceLat, sourceLng, destLat, destLng } = req.body;

    if (!sourceLat || !sourceLng || !destLat || !destLng) {
      return res.status(400).json({ message: 'Source and destination coordinates required' });
    }

    const cacheKey = `${sourceLat.toFixed(4)},${sourceLng.toFixed(4)}-${destLat.toFixed(4)},${destLng.toFixed(4)}`;
    const cached = SCORE_CACHE.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
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
    console.log(`Fetched ${routes.length} routes from OSRM`);

    const scoredRoutes = await Promise.all(
      routes.map(async route => {
        const scoreResult = await calculateRouteScore(route, routes, weatherData);
        return { ...route, safetyScore: scoreResult.total, breakdown: scoreResult.breakdown };
      })
    );

    // 4. Sort by safety score DESCENDING (highest = safest)
    scoredRoutes.sort((a, b) => b.safetyScore - a.safetyScore);
    console.log('Scores after sorting:', scoredRoutes.map(r => `${r.distanceKm}km → ${r.safetyScore}`));

    const result = {
      safe: {
        ...scoredRoutes[0],
        label:      'Safest Route',
        colorName:  'green',
        color:      '#22C55E',
        badge:      'RECOMMENDED',
        leafletOptions: { color: '#22C55E', weight: 7, opacity: 0.9 }
      },
      medium: null,
      risky: null,
      weather: weatherData ? {
        condition: weatherData.weather?.[0]?.main,
        temp:      weatherData.main?.temp ? (weatherData.main.temp - 273.15).toFixed(1) : null,
        icon:      weatherData.weather?.[0]?.icon
      } : null,
      totalRoutesFound: routes.length
    };

    SCORE_CACHE.set(cacheKey, { data: result, timestamp: Date.now() });
    return res.json(result);

  } catch (err) {
    console.error('Route calculation error:', err);
    return res.status(500).json({ message: 'Route calculation failed', error: err.message });
  }
});

module.exports = router;
