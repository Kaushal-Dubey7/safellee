const mongoose = require('mongoose');
const fetch = require('node-fetch');
const CrimeZone = require('../models/CrimeZone');
const RouteRating = require('../models/RouteRating');
const RouteScoreCache = require('../models/RouteScoreCache');

// ─── LIGHTING: Query real street lamps from OpenStreetMap ────────────
const getLightingScore = async (routeCoords) => {
  try {
    // Sample start, middle and end of route for lamp queries
    const samplePoints = [
      routeCoords[0],
      routeCoords[Math.floor(routeCoords.length / 2)],
      routeCoords[routeCoords.length - 1]
    ];

    let totalLamps = 0;

    for (const point of samplePoints) {
      const lat = point[0];
      const lng = point[1];
      
      const query = `
        [out:json][timeout:10];
        node[highway=street_lamp](around:200,${lat},${lng});
        out count;
      `;

      const res = await fetch('https://overpass-api.de/api/interpreter', {
        method: 'POST',
        body: query,
        headers: { 'Content-Type': 'text/plain' }
      });

      const data = await res.json();
      const count = data?.elements?.[0]?.tags?.total || 0;
      totalLamps += parseInt(count);
    }

    // Calculate lighting score from lamp density
    // 30+ lamps across 3 sample points = well lit = score 100
    const rawScore = Math.min(100, (totalLamps / 30) * 100);
    
    // Night time penalty
    const hour = new Date().getHours();
    const isNight = hour >= 20 || hour <= 6;
    const finalScore = isNight ? rawScore * 0.55 : rawScore;
    
    // Minimum score 20 (some ambient light always exists)
    return Math.max(20, Math.round(finalScore));
    
  } catch (err) {
    console.log('Lighting query failed, using fallback:', err.message);
    return 60; // safe fallback
  }
};

// ─── CROWD: Query amenity density from OpenStreetMap ─────────────────
const getCrowdScore = async (routeCoords) => {
  try {
    // Use midpoint of route as the area representative point
    const midPoint = routeCoords[Math.floor(routeCoords.length / 2)];
    const lat = midPoint[0];
    const lng = midPoint[1];

    // Count amenities (shops, restaurants, offices = busy area = safer)
    const query = `
      [out:json][timeout:10];
      (
        node[amenity~"restaurant|cafe|shop|bank|hospital|school|office|market|bus_station"](around:500,${lat},${lng});
        way[amenity~"restaurant|cafe|shop|bank|hospital|school|office|market"](around:500,${lat},${lng});
        node[shop](around:500,${lat},${lng});
        node[office](around:500,${lat},${lng});
      );
      out count;
    `;

    const res = await fetch('https://overpass-api.de/api/interpreter', {
      method: 'POST',
      body: query,
      headers: { 'Content-Type': 'text/plain' }
    });

    const data = await res.json();
    const amenityCount = data?.elements?.[0]?.tags?.total || 0;

    // More amenities = more crowd = safer
    // 50+ amenities in 500m = very busy = score 100
    let baseScore = Math.min(100, (parseInt(amenityCount) / 50) * 100);
    baseScore = Math.max(25, baseScore); // minimum 25

    // Time of day adjustment
    const hour = new Date().getHours();
    let timeMultiplier = 1.0;
    if (hour >= 6 && hour < 9)   timeMultiplier = 1.3;  // morning rush
    if (hour >= 9 && hour < 17)  timeMultiplier = 1.1;  // business hours
    if (hour >= 17 && hour < 20) timeMultiplier = 1.25; // evening rush
    if (hour >= 20 && hour < 23) timeMultiplier = 0.7;  // late evening
    if (hour >= 23 || hour < 6)  timeMultiplier = 0.35; // night (dangerous)

    return Math.round(Math.min(100, baseScore * timeMultiplier));

  } catch (err) {
    console.log('Crowd query failed, using time-based fallback:', err.message);
    
    // Time-based fallback if Overpass fails
    const hour = new Date().getHours();
    if (hour >= 8 && hour < 21) return 65;  // daytime default
    return 30;                               // night default
  }
};

// ─── CRIME: Query seeded MongoDB crime zones ──────────────────────────
const getCrimeScore = async (routeCoords) => {
  try {
    const lineStringCoords = routeCoords.map(c => [c[1], c[0]]); // [lat,lng]→[lng,lat]

    const zones = await CrimeZone.find({
      geometry: {
        $geoIntersects: {
          $geometry: {
            type: 'LineString',
            coordinates: lineStringCoords
          }
        }
      }
    });

    if (zones.length === 0) return 70; // unknown area = moderate safe

    const avgDanger = zones.reduce((sum, z) => sum + z.crimeScore, 0) / zones.length;
    return Math.round(Math.max(0, 100 - avgDanger));
    
  } catch (err) {
    console.log('Crime query failed:', err.message);
    return 70;
  }
};

// ─── COMMUNITY: Average community ratings near route ─────────────────
const getCommunityScore = async (routeCoords) => {
  try {
    const start = routeCoords[0];
    const end   = routeCoords[routeCoords.length - 1];
    const mid   = routeCoords[Math.floor(routeCoords.length / 2)];

    // Check cache first (fast path) for all 3 points
    const cacheResults = await Promise.all([start, mid, end].map(async (point) => {
      const areaLat = Math.round(point[0] * 100) / 100;
      const areaLng = Math.round(point[1] * 100) / 100;
      const areaKey = `${areaLat}_${areaLng}`;
      return RouteScoreCache.findOne({ areaKey });
    }));

    const validCache = cacheResults.filter(c => c && c.totalRatings > 0);

    if (validCache.length > 0) {
      // Use cached community scores (already aggregated)
      const avgCommunityScore = validCache.reduce((s, c) => s + c.communityScore, 0) / validCache.length;
      console.log(`Community score from cache: ${Math.round(avgCommunityScore)}`);
      return Math.round(avgCommunityScore);
    }

    // Fallback: direct DB query with wider radius
    const ratings = await RouteRating.find({
      $or: [
        {
          'sourceCoords.lat': { $gte: start[0] - 0.05, $lte: start[0] + 0.05 },
          'sourceCoords.lng': { $gte: start[1] - 0.05, $lte: start[1] + 0.05 }
        },
        {
          'destCoords.lat': { $gte: end[0] - 0.05, $lte: end[0] + 0.05 },
          'destCoords.lng': { $gte: end[1] - 0.05, $lte: end[1] + 0.05 }
        }
      ]
    }).limit(50);

    if (ratings.length === 0) return 70; // neutral default

    const avg = ratings.reduce((s, r) => s + r.rating, 0) / ratings.length;
    return Math.round((avg / 5) * 100);
  } catch (err) {
    console.error('Community score error:', err.message);
    return 70;
  }
};

// ─── MASTER SCORING FUNCTION ──────────────────────────────────────────
const calculateRouteScore = async (route, allRoutes, weatherData) => {

  // Sample coordinates: different sections of the route
  const coords   = route.coordinates;
  const len      = coords.length;
  
  // Take start, 25%, 50%, 75%, end for crime/lighting
  const samplePoints = [
    coords[0],
    coords[Math.floor(len * 0.25)],
    coords[Math.floor(len * 0.5)],
    coords[Math.floor(len * 0.75)],
    coords[len - 1]
  ].filter(Boolean);

  // Run all scoring in parallel
  const [crimeScore, lightingScore, crowdScore, communityScore] = await Promise.all([
    getCrimeScore(coords),           // full route
    getLightingScore(samplePoints),  // sampled points
    getCrowdScore(samplePoints),     // sampled points
    getCommunityScore(coords)
  ]);

  // Weather score
  let weatherScore = 80;
  if (weatherData?.weather?.[0]?.main) {
    const wmap = { Clear:100, Clouds:75, Drizzle:60, Rain:40, Thunderstorm:10, Snow:30, Mist:50, Fog:35, Haze:65 };
    weatherScore = wmap[weatherData.weather[0].main] || 70;
  }

  // CRITICAL: Distance efficiency vs shortest route
  const shortestDist = Math.min(...allRoutes.map(r => r.distance));
  const ratio        = route.distance / shortestDist;
  let efficiencyScore;
  if      (ratio <= 1.00) efficiencyScore = 100;
  else if (ratio <= 1.15) efficiencyScore = 88;
  else if (ratio <= 1.30) efficiencyScore = 72;
  else if (ratio <= 1.50) efficiencyScore = 52;
  else if (ratio <= 1.80) efficiencyScore = 30;
  else                    efficiencyScore = 12;

  const total = Math.round(
    crimeScore      * 0.30 +
    lightingScore   * 0.25 +
    crowdScore      * 0.20 +
    weatherScore    * 0.10 +
    efficiencyScore * 0.10 +
    communityScore  * 0.05
  );

  return {
    total: Math.max(0, Math.min(100, total)),
    breakdown: {
      crime:      Math.round(crimeScore),
      lighting:   Math.round(lightingScore),
      crowd:      Math.round(crowdScore),
      weather:    Math.round(weatherScore),
      efficiency: Math.round(efficiencyScore),
      community:  Math.round(communityScore)
    }
  };
};

module.exports = { calculateRouteScore };
