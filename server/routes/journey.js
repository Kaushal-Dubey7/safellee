const express = require('express');
const router = express.Router();
const Journey = require('../models/Journey');
const auth = require('../middleware/auth');
const { validateJourney } = require('../middleware/validate');

// POST /api/journey/start
router.post('/start', auth, validateJourney, async (req, res) => {
  try {
    const activeJourney = await Journey.findOne({ userId: req.userId, status: { $in: ['active', 'paused'] } });
    if (activeJourney) {
      return res.status(400).json({ error: 'You already have an active journey. End it before starting a new one.' });
    }

    const { source, destination, selectedRoute, safetyScore } = req.body;

    const journey = new Journey({
      userId: req.userId,
      source,
      destination,
      selectedRoute: selectedRoute || 'safe',
      safetyScore: safetyScore || 0,
      status: 'active',
      startedAt: new Date(),
      locationHistory: [{
        lat: source.coordinates.lat,
        lng: source.coordinates.lng,
        timestamp: new Date()
      }]
    });

    await journey.save();
    res.status(201).json({ journey });
  } catch (error) {
    console.error('Start journey error:', error);
    res.status(500).json({ error: 'Failed to start journey.' });
  }
});

// PUT /api/journey/:id/update-location
router.put('/:id/update-location', auth, async (req, res) => {
  try {
    const { lat, lng } = req.body;
    if (typeof lat !== 'number' || typeof lng !== 'number') {
      return res.status(400).json({ error: 'Valid coordinates are required.' });
    }

    const journey = await Journey.findOne({ _id: req.params.id, userId: req.userId });
    if (!journey) {
      return res.status(404).json({ error: 'Journey not found.' });
    }

    if (journey.status !== 'active') {
      return res.status(400).json({ error: 'Journey is not active.' });
    }

    journey.locationHistory.push({ lat, lng, timestamp: new Date() });
    journey.lastLocationUpdate = new Date();
    await journey.save();

    res.json({ message: 'Location updated.', lastLocationUpdate: journey.lastLocationUpdate });
  } catch (error) {
    console.error('Update location error:', error);
    res.status(500).json({ error: 'Failed to update location.' });
  }
});

// PUT /api/journey/:id/pause
router.put('/:id/pause', auth, async (req, res) => {
  try {
    const journey = await Journey.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId, status: 'active' },
      { status: 'paused' },
      { new: true }
    );

    if (!journey) {
      return res.status(404).json({ error: 'Active journey not found.' });
    }

    res.json({ journey });
  } catch (error) {
    console.error('Pause journey error:', error);
    res.status(500).json({ error: 'Failed to pause journey.' });
  }
});

// PUT /api/journey/:id/resume
router.put('/:id/resume', auth, async (req, res) => {
  try {
    const journey = await Journey.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId, status: 'paused' },
      { status: 'active', lastLocationUpdate: new Date() },
      { new: true }
    );

    if (!journey) {
      return res.status(404).json({ error: 'Paused journey not found.' });
    }

    res.json({ journey });
  } catch (error) {
    console.error('Resume journey error:', error);
    res.status(500).json({ error: 'Failed to resume journey.' });
  }
});

// PUT /api/journey/:id/end
router.put('/:id/end', auth, async (req, res) => {
  try {
    const journey = await Journey.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId, status: { $in: ['active', 'paused'] } },
      { status: 'completed', endedAt: new Date() },
      { new: true }
    );

    if (!journey) {
      return res.status(404).json({ error: 'Journey not found or already ended.' });
    }

    res.json({ journey });
  } catch (error) {
    console.error('End journey error:', error);
    res.status(500).json({ error: 'Failed to end journey.' });
  }
});

// GET /api/journey/active
router.get('/active', auth, async (req, res) => {
  try {
    const journey = await Journey.findOne({ userId: req.userId, status: { $in: ['active', 'paused'] } });
    res.json({ journey: journey || null });
  } catch (error) {
    console.error('Get active journey error:', error);
    res.status(500).json({ error: 'Failed to fetch active journey.' });
  }
});

// GET /api/journey/history
router.get('/history', auth, async (req, res) => {
  try {
    const journeys = await Journey.find({ userId: req.userId })
      .sort({ startedAt: -1 })
      .limit(20)
      .select('-locationHistory');
    res.json({ journeys });
  } catch (error) {
    console.error('Journey history error:', error);
    res.status(500).json({ error: 'Failed to fetch journey history.' });
  }
});

module.exports = router;
