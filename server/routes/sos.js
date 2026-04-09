const express = require('express');
const router = express.Router();
const SOSLog = require('../models/SOSLog');
const LovedOne = require('../models/LovedOne');
const Journey = require('../models/Journey');
const auth = require('../middleware/auth');
const { fetchNearestPoliceStation } = require('../services/poiService');

// POST /api/sos/trigger
router.post('/trigger', auth, async (req, res) => {
  try {
    const { journeyId, lat, lng, triggerType } = req.body;

    if (typeof lat !== 'number' || typeof lng !== 'number') {
      return res.status(400).json({ error: 'Valid location coordinates are required.' });
    }

    const contacts = await LovedOne.find({ userId: req.userId });
    const policeStation = await fetchNearestPoliceStation(lat, lng);

    if (journeyId) {
      await Journey.findByIdAndUpdate(journeyId, { status: 'sos' });
    }

    let address = '';
    try {
      const fetch = require('node-fetch');
      const geoUrl = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18`;
      const geoRes = await fetch(geoUrl, { headers: { 'User-Agent': 'Safelle/1.0' } });
      const geoData = await geoRes.json();
      address = geoData.display_name || '';
    } catch (geoErr) {
      console.error('Reverse geocoding error:', geoErr.message);
    }

    const sosLog = new SOSLog({
      userId: req.userId,
      triggerType: triggerType || 'manual',
      location: { lat, lng },
      address,
      contactsNotified: contacts.map(c => c.phone),
      nearestPoliceStation: policeStation ? {
        name: policeStation.name,
        phone: policeStation.phone || '',
        lat: policeStation.lat,
        lng: policeStation.lng
      } : undefined
    });

    await sosLog.save();

    res.json({
      sosId: sosLog._id,
      contacts: contacts.map(c => ({ name: c.name, phone: c.phone })),
      policeStation,
      location: { lat, lng },
      address,
      mapLink: `https://maps.google.com/?q=${lat},${lng}`,
      message: `🚨 SAFELLE EMERGENCY ALERT 🚨\n${req.user.fullName} needs immediate help!\n📍 Location: https://maps.google.com/?q=${lat},${lng}\n⏰ Time: ${new Date().toLocaleString()}\nPlease check on her or call 112 immediately.`
    });
  } catch (error) {
    console.error('SOS trigger error:', error);
    res.status(500).json({ error: 'Failed to trigger SOS. Please call 112 directly.' });
  }
});

// GET /api/sos/history
router.get('/history', auth, async (req, res) => {
  try {
    const logs = await SOSLog.find({ userId: req.userId }).sort({ createdAt: -1 }).limit(20);
    res.json({ logs });
  } catch (error) {
    console.error('SOS history error:', error);
    res.status(500).json({ error: 'Failed to fetch SOS history.' });
  }
});

module.exports = router;
