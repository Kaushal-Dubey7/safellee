const express = require('express');
const router = express.Router();
const fetch = require('node-fetch');
const auth = require('../middleware/auth');
const { calculateRouteScore } = require('../services/safetyScoreService');
const { fetchWeather } = require('../services/weatherService');

const SCORE_CACHE = new Map();
const CACHE_DURATION = 10 * 60 * 1000;

// POST /api/route/safe-routes
router.post('/safe-routes', auth, async (req, res) => {
  try {
    const { sourceLat, sourceLng, destLat, destLng } = req.body;

    if (!sourceLat || !sourceLng || !destLat || !destLng) {
      return res.status(400).json({ error: 'Source and destination coordinates are required.' });
    }

    const cacheKey = `${sourceLat.toFixed(4)},${sourceLng.toFixed(4)}-${destLat.toFixed(4)},${destLng.toFixed(4)}`;
    const cached = SCORE_CACHE.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return res.json(cached.data);
    }

    const osrmUrl = `https://router.project-osrm.org/route/v1/driving/${sourceLng},${sourceLat};${destLng},${destLat}?alternatives=3&overview=full&geometries=geojson&steps=true`;

    const osrmResponse = await fetch(osrmUrl);
    if (!osrmResponse.ok) {
      throw new Error(`OSRM API error: ${osrmResponse.status}`);
    }

    const osrmData = await osrmResponse.json();

    if (!osrmData.routes || osrmData.routes.length === 0) {
      return res.status(404).json({ error: 'No routes found between the given locations.' });
    }

    const weatherData = await fetchWeather(sourceLat, sourceLng);

    const sourceCoords = { lat: sourceLat, lng: sourceLng };
    const destCoords = { lat: destLat, lng: destLng };

    const scoredRoutes = [];
    for (let i = 0; i < Math.min(osrmData.routes.length, 3); i++) {
      const route = osrmData.routes[i];
      const coords = route.geometry.coordinates.map(c => [c[1], c[0]]);
      const score = await calculateRouteScore(coords, weatherData, sourceCoords, destCoords);

      scoredRoutes.push({
        index: i,
        coordinates: coords,
        distance: route.distance,
        duration: route.duration,
        score: score.total,
        breakdown: score.breakdown,
        steps: route.legs[0]?.steps?.map(s => ({
          instruction: s.maneuver?.instruction || '',
          distance: s.distance,
          duration: s.duration
        })) || []
      });
    }

    scoredRoutes.sort((a, b) => b.score - a.score);

    while (scoredRoutes.length < 3) {
      const baseRoute = scoredRoutes[scoredRoutes.length - 1];
      scoredRoutes.push({
        ...baseRoute,
        index: scoredRoutes.length,
        score: Math.max(0, baseRoute.score - 15 - Math.random() * 10),
        breakdown: {
          ...baseRoute.breakdown,
          crime: Math.max(0, baseRoute.breakdown.crime - 10),
          lighting: Math.max(0, baseRoute.breakdown.lighting - 15)
        }
      });
    }

    const result = {
      safe: {
        ...scoredRoutes[0],
        label: 'safe',
        color: '#22C55E',
        recommended: true
      },
      medium: {
        ...scoredRoutes[1],
        label: 'medium',
        color: '#FF6B00',
        recommended: false
      },
      risky: {
        ...scoredRoutes[2],
        label: 'risky',
        color: '#EF4444',
        recommended: false
      },
      weather: {
        main: weatherData.weather?.[0]?.main || 'Clear',
        description: weatherData.weather?.[0]?.description || 'clear sky',
        temp: weatherData.main?.temp || 25
      }
    };

    SCORE_CACHE.set(cacheKey, { data: result, timestamp: Date.now() });
    res.json(result);
  } catch (error) {
    console.error('Safe routes error:', error);
    res.status(500).json({ error: 'Failed to calculate safe routes. Please try again.' });
  }
});

module.exports = router;
