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

    const data = await osrmResponse.json();

    if (!data.routes || data.routes.length === 0) {
      return res.status(404).json({ error: 'No routes found between the given locations.' });
    }

    const shortestDistance = Math.min(...data.routes.map(r => r.distance));
    const MAX_DISTANCE_RATIO = 1.6;
    
    const validRoutes = data.routes.filter(route => {
      const ratio = route.distance / shortestDistance;
      return ratio <= MAX_DISTANCE_RATIO;
    });

    const routesToScore = validRoutes.length >= 2 ? validRoutes : data.routes.slice(0, 2);

    const formattedRoutes = routesToScore.slice(0, 3).map(route => ({
      geometry: route.geometry,
      coordinates: route.geometry.coordinates.map(c => [c[1], c[0]]),
      distance: route.distance,
      duration: route.duration,
      distanceKm: (route.distance / 1000).toFixed(1),
      durationMin: Math.round(route.duration / 60),
      legs: route.legs,
      steps: route.legs[0]?.steps?.map(s => ({
        instruction: s.maneuver?.instruction || '',
        distance: s.distance,
        duration: s.duration
      })) || []
    }));

    const weatherData = await fetchWeather(sourceLat, sourceLng);

    const rankedRoutes = await Promise.all(
      formattedRoutes.map(async (route) => {
        const score = await calculateRouteScore(route, formattedRoutes, weatherData, { lat: sourceLat, lng: sourceLng }, { lat: destLat, lng: destLng });
        return { ...route, safetyScore: score.total, breakdown: score.breakdown };
      })
    );

    // SORT BY SAFETY SCORE DESCENDING (highest score = safest)
    rankedRoutes.sort((a, b) => b.safetyScore - a.safetyScore);

    console.log('=== SAFELLE ROUTE SCORING DEBUG ===');
    rankedRoutes.forEach((route, i) => {
      console.log(`Route ${i+1}: ${route.distanceKm}km | Score: ${route.safetyScore} | Efficiency: ${route.breakdown.efficiency}`);
    });
    console.log('Winner (safest):', rankedRoutes[0].distanceKm + 'km', 'score:', rankedRoutes[0].safetyScore);
    console.log('===================================');

    const result = {
      weather: {
        main: weatherData.weather?.[0]?.main || 'Clear',
        description: weatherData.weather?.[0]?.description || 'clear sky',
        temp: weatherData.main?.temp || 25
      },
      safe: {
        ...rankedRoutes[0],
        label: 'Safest Route',
        color: '#22C55E',
        colorName: 'green',
        badge: 'RECOMMENDED',
        leafletOptions: { color: '#22C55E', weight: 7, opacity: 0.9 }
      },
      medium: rankedRoutes[1] ? {
        ...rankedRoutes[1],
        label: 'Alternative Route',
        color: '#FF6B00',
        colorName: 'orange',
        badge: null,
        leafletOptions: { color: '#FF6B00', weight: 5, opacity: 0.75 }
      } : null,
      risky: rankedRoutes[2] ? {
        ...rankedRoutes[2],
        label: 'Secondary Alternative',
        color: '#EF4444',
        colorName: 'red',
        badge: null,
        leafletOptions: { color: '#EF4444', weight: 4, opacity: 0.6, dashArray: '8 6' }
      } : null
    };

    SCORE_CACHE.set(cacheKey, { data: result, timestamp: Date.now() });
    res.json(result);
  } catch (error) {
    console.error('Safe routes error:', error);
    res.status(500).json({ error: 'Failed to calculate safe routes. Please try again.' });
  }
});

module.exports = router;
