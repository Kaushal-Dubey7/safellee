const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { fetchNearbyPOI } = require('../services/poiService');

// GET /api/poi/nearby?lat=X&lng=Y&type=hospital|pharmacy|police
router.get('/nearby', auth, async (req, res) => {
  try {
    const { lat, lng, type } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({ error: 'Latitude and longitude are required.' });
    }

    const latitude = parseFloat(lat);
    const longitude = parseFloat(lng);

    if (isNaN(latitude) || isNaN(longitude)) {
      return res.status(400).json({ error: 'Invalid coordinates.' });
    }

    if (type) {
      const results = await fetchNearbyPOI(latitude, longitude, type);
      return res.json({ [type]: results });
    }

    const [hospitals, pharmacies, police] = await Promise.all([
      fetchNearbyPOI(latitude, longitude, 'hospital'),
      fetchNearbyPOI(latitude, longitude, 'pharmacy'),
      fetchNearbyPOI(latitude, longitude, 'police')
    ]);

    res.json({ hospital: hospitals, pharmacy: pharmacies, police: police });
  } catch (error) {
    console.error('POI fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch nearby points of interest.' });
  }
});

module.exports = router;
