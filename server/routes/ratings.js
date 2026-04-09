const express = require('express');
const router = express.Router();
const RouteRating = require('../models/RouteRating');
const auth = require('../middleware/auth');
const { validateRating } = require('../middleware/validate');

// POST /api/ratings
router.post('/', auth, validateRating, async (req, res) => {
  try {
    const { routeId, sourceCoords, destCoords, rating, likes, dislikes, comment } = req.body;

    const routeRating = new RouteRating({
      userId: req.userId,
      routeId: routeId || '',
      sourceCoords: sourceCoords || { lat: 0, lng: 0 },
      destCoords: destCoords || { lat: 0, lng: 0 },
      rating,
      likes: likes || [],
      dislikes: dislikes || [],
      comment: comment || ''
    });

    await routeRating.save();
    res.status(201).json({ rating: routeRating });
  } catch (error) {
    console.error('Submit rating error:', error);
    res.status(500).json({ error: 'Failed to submit rating.' });
  }
});

// GET /api/ratings/route
router.get('/route', auth, async (req, res) => {
  try {
    const { sourceLat, sourceLng, destLat, destLng } = req.query;

    if (!sourceLat || !sourceLng || !destLat || !destLng) {
      return res.status(400).json({ error: 'Route coordinates are required.' });
    }

    const ratings = await RouteRating.find({
      'sourceCoords.lat': { $gte: parseFloat(sourceLat) - 0.01, $lte: parseFloat(sourceLat) + 0.01 },
      'sourceCoords.lng': { $gte: parseFloat(sourceLng) - 0.01, $lte: parseFloat(sourceLng) + 0.01 },
      'destCoords.lat': { $gte: parseFloat(destLat) - 0.01, $lte: parseFloat(destLat) + 0.01 },
      'destCoords.lng': { $gte: parseFloat(destLng) - 0.01, $lte: parseFloat(destLng) + 0.01 }
    }).populate('userId', 'fullName').sort({ createdAt: -1 });

    const avgRating = ratings.length > 0
      ? ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length
      : 0;

    res.json({
      ratings,
      averageRating: Math.round(avgRating * 10) / 10,
      totalRatings: ratings.length
    });
  } catch (error) {
    console.error('Get route ratings error:', error);
    res.status(500).json({ error: 'Failed to fetch ratings.' });
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
