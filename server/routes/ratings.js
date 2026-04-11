const express = require('express');
const router = express.Router();
const RouteRating = require('../models/RouteRating');
const RouteScoreCache = require('../models/RouteScoreCache');
const auth = require('../middleware/auth');
const { validateRating } = require('../middleware/validate');
const fetch = require('node-fetch');

// Reverse Geocode
const reverseGeocode = async (lat, lng) => {
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lng=${lng}&format=json`;
    const res = await fetch(url, { headers: { 'User-Agent': 'Safelle-App/1.0' } });
    const data = await res.json();
    const addr = data.address || {};
    const parts = [
      addr.road || addr.pedestrian || addr.footway,
      addr.suburb || addr.neighbourhood || addr.quarter,
      addr.city || addr.town || addr.village || addr.county
    ].filter(Boolean);
    return parts.join(', ') || data.display_name?.split(',').slice(0,3).join(', ') || 'Unknown location';
  } catch (err) {
    return 'Unknown location';
  }
};

// Aggregator
const updateAreaCache = async (lat, lng, newRating, likes, dislikes) => {
  try {
    const areaLat = Math.round(lat * 100) / 100;
    const areaLng = Math.round(lng * 100) / 100;
    const areaKey = `${areaLat}_${areaLng}`;

    const areaRatings = await RouteRating.find({
      'sourceCoords.lat': { $gte: areaLat - 0.01, $lte: areaLat + 0.01 },
      'sourceCoords.lng': { $gte: areaLng - 0.01, $lte: areaLng + 0.01 }
    });
    if (areaRatings.length === 0) return;

    const totalRatings = areaRatings.length;
    const averageRating = areaRatings.reduce((s, r) => s + r.rating, 0) / totalRatings;
    const positiveCount = areaRatings.filter(r => r.rating >= 4).length;
    const negativeCount = areaRatings.filter(r => r.rating <= 2).length;

    const scoreMap = { 5: 100, 4: 80, 3: 60, 2: 35, 1: 10 };
    const roundedAvg = Math.round(averageRating);
    const communityScore = scoreMap[roundedAvg] || Math.round((averageRating / 5) * 100);

    const allLikes = areaRatings.flatMap(r => r.likes || []);
    const allDislikes = areaRatings.flatMap(r => r.dislikes || []);
    const topN = (arr) => {
      const freq = {};
      arr.forEach(t => freq[t] = (freq[t] || 0) + 1);
      return Object.entries(freq).sort((a,b) => b[1]-a[1]).slice(0,3).map(e => e[0]);
    };

    await RouteScoreCache.findOneAndUpdate(
      { areaKey },
      {
        areaKey, centerLat: areaLat, centerLng: areaLng,
        totalRatings, averageRating, positiveCount, negativeCount,
        communityScore,
        topLikes: topN(allLikes),
        topDislikes: topN(allDislikes),
        lastUpdated: new Date()
      },
      { upsert: true, new: true }
    );
    console.log(`Area cache updated: ${areaKey} → communityScore: ${communityScore}`);
  } catch (err) {
    console.error('Cache update failed:', err.message);
  }
};

// GET /api/ratings (Community feed)
router.get('/', auth, async (req, res) => {
  try {
    const ratings = await RouteRating.find()
      .populate('userId', 'fullName profilePhoto')
      .sort({ createdAt: -1 })
      .limit(50);
    
    const formatted = ratings.map(r => ({
      _id:           r._id,
      routeLabel:    r.routeLabel || `${r.sourceAddress} → ${r.destAddress}`,
      sourceAddress: r.sourceAddress,
      destAddress:   r.destAddress,
      city:          r.city,
      rating:        r.rating,
      likes:         r.likes,
      dislikes:      r.dislikes,
      comment:       r.comment,
      userName:      r.userId?.fullName || 'Anonymous',
      userPhoto:     r.userId?.profilePhoto || null,
      createdAt:     r.createdAt
    }));
    res.json(formatted);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/ratings
router.post('/', auth, validateRating, async (req, res) => {
  try {
    const { routeId, sourceCoords, destCoords, rating, likes, dislikes, comment } = req.body;
    
    // Reverse Geocode
    const [sourceAddress, destAddress] = await Promise.all([
      reverseGeocode(sourceCoords.lat, sourceCoords.lng),
      reverseGeocode(destCoords.lat, destCoords.lng)
    ]);
    const routeLabel = `${sourceAddress.split(',')[0]} → ${destAddress.split(',')[0]}`;
    const city = sourceAddress.split(',').slice(-1)[0]?.trim() || '';

    const routeRating = new RouteRating({
      userId: req.userId,
      routeId: routeId || '',
      sourceCoords: sourceCoords || { lat: 0, lng: 0 },
      destCoords: destCoords || { lat: 0, lng: 0 },
      sourceAddress, destAddress, routeLabel, city,
      rating,
      likes: likes || [],
      dislikes: dislikes || [],
      comment: comment || ''
    });
    await routeRating.save();

    // Aggregation
    await updateAreaCache(sourceCoords.lat, sourceCoords.lng, rating, likes || [], dislikes || []);

    res.status(201).json({ rating: routeRating });
  } catch (error) {
    console.error('Submit rating error:', error);
    res.status(500).json({ error: 'Failed to submit rating.' });
  }
});

// GET /api/ratings/my
router.get('/my', auth, async (req, res) => {
  try {
    const ratings = await RouteRating.find({ userId: req.userId }).sort({ createdAt: -1 });
    res.json({ ratings });
  } catch (error) {
    console.error('Get my ratings error:', error);
    res.status(500).json({ error: 'Failed to fetch your ratings.' });
  }
});

module.exports = router;
