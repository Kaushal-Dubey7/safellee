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
    let allRoutes = osrmData.routes || [];

    // HACKATHON ENHANCEMENT: If OSRM returns fewer than 3 routes, force generate physically real alternatives 
    // by asking the engine to route through lateral waypoints (perpendicular to the main path).
    if (allRoutes.length > 0 && allRoutes.length < 3) {
      const slat = Number(sourceLat); const slng = Number(sourceLng);
      const dlat = Number(destLat);   const dlng = Number(destLng);
      
      const mlat = (slat + dlat) / 2;
      const mlng = (slng + dlng) / 2;
      
      const dLatDiff = dlat - slat;
      const dLngDiff = dlng - slng;
      
      const offsets = [
        { lat: mlat - dLngDiff * 0.3, lng: mlng + dLatDiff * 0.3 }, // Left offset
        { lat: mlat + dLngDiff * 0.3, lng: mlng - dLatDiff * 0.3 }  // Right offset
      ];
      
      for (const offset of offsets) {
        if (allRoutes.length >= 3) break;
        const altUrl = `https://router.project-osrm.org/route/v1/driving/${sourceLng},${sourceLat};${offset.lng},${offset.lat};${destLng},${destLat}?overview=full&geometries=geojson&steps=true`;
        try {
          const altRes = await fetch(altUrl);
          if (altRes.ok) {
            const altData = await altRes.json();
            if (altData.routes && altData.routes.length > 0) {
              // Ensure we don't duplicate identical polyline geometry
              const isDuplicate = allRoutes.some(r => r.geometry === altData.routes[0].geometry);
              if (!isDuplicate) {
                allRoutes.push(altData.routes[0]);
              }
            }
          }
        } catch (e) {
          console.error('Failed to fetch offset route', e);
        }
      }
    }

    if (allRoutes.length === 0) {
      return res.status(404).json({ error: 'No routes found between the given locations.' });
    }

    const weatherData = await fetchWeather(sourceLat, sourceLng);

    const sourceCoords = { lat: sourceLat, lng: sourceLng };
    const destCoords = { lat: destLat, lng: destLng };

    const scoredRoutes = [];
    for (let i = 0; i < Math.min(allRoutes.length, 3); i++) {
      const route = allRoutes[i];
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

    const result = {
      weather: {
        main: weatherData.weather?.[0]?.main || 'Clear',
        description: weatherData.weather?.[0]?.description || 'clear sky',
        temp: weatherData.main?.temp || 25
      }
    };

    if (scoredRoutes.length > 0) {
      result.safe = {
        ...scoredRoutes[0],
        label: 'safe',
        color: '#22C55E',
        recommended: true
      };
    }
    
    if (scoredRoutes.length > 1) {
      result.medium = {
        ...scoredRoutes[1],
        label: 'medium',
        color: '#FF6B00',
        recommended: false
      };
    }
    
    if (scoredRoutes.length > 2) {
      result.risky = {
        ...scoredRoutes[2],
        label: 'risky',
        color: '#EF4444',
        recommended: false
      };
    }

    SCORE_CACHE.set(cacheKey, { data: result, timestamp: Date.now() });
    res.json(result);
  } catch (error) {
    console.error('Safe routes error:', error);
    res.status(500).json({ error: 'Failed to calculate safe routes. Please try again.' });
  }
});

module.exports = router;
