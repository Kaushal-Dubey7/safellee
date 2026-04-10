const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');
const LovedOne = require('../models/LovedOne');
const SOSLog = require('../models/SOSLog');
const Journey = require('../models/Journey');
const { 
  sendSOSToAllContacts, 
  callAllContacts, 
  alertPoliceStation 
} = require('../services/twilioService');

// Fetch nearest police station from Overpass
const getNearestPoliceStation = async (lat, lng) => {
  try {
    const fetch = require('node-fetch');
    const query = `[out:json][timeout:10];node[amenity=police](around:3000,${lat},${lng});out body;`;
    const res = await fetch('https://overpass-api.de/api/interpreter', {
      method: 'POST',
      body: query
    });
    const data = await res.json();
    if (!data.elements || data.elements.length === 0) return null;
    
    const station = data.elements[0];
    return {
      name: station.tags?.name || 'Nearest Police Station',
      phone: station.tags?.phone || station.tags?.['contact:phone'] || null,
      lat: station.lat,
      lng: station.lon
    };
  } catch (err) {
    console.error('Police station fetch failed:', err.message);
    return null;
  }
};

// POST /api/sos/trigger — THE MAIN SOS ENDPOINT
router.post('/trigger', auth, async (req, res) => {
  try {
    const { lat, lng, triggerType, journeyId } = req.body;

    if (!lat || !lng) {
      return res.status(400).json({ message: 'Location required for SOS' });
    }

    // 1. Get user details
    const user = await User.findById(req.userId).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });

    // 2. Get all loved ones
    const contacts = await LovedOne.find({ userId: req.userId });
    if (!contacts || contacts.length === 0) {
      return res.status(400).json({ 
        message: 'No emergency contacts found. Please add loved ones in your profile.' 
      });
    }

    // 3. Get nearest police station
    const policeStation = await getNearestPoliceStation(lat, lng);

    // 4. Send SMS to ALL contacts via Twilio (automatic, real delivery)
    const smsResults = await sendSOSToAllContacts(
      contacts, 
      user.fullName, 
      lat, 
      lng
    );

    // 5. Make calls to ALL contacts via Twilio
    const callResults = await callAllContacts(
      contacts,
      user.fullName,
      lat,
      lng
    );

    // 6. Alert nearest police station if phone available
    let policeAlerted = false;
    if (policeStation?.phone) {
      const policeResult = await alertPoliceStation(
        policeStation.phone,
        user.fullName,
        lat,
        lng
      );
      policeAlerted = policeResult.success;
    }

    // 7. Update journey status to SOS
    if (journeyId) {
      await Journey.findByIdAndUpdate(journeyId, { status: 'sos' });
    }

    // 8. Log SOS event to database
    const sosLog = new SOSLog({
      userId: req.userId,
      triggerType: triggerType || 'manual',
      location: { lat, lng },
      contactsNotified: contacts.map(c => c.phone),
      nearestPoliceStation: policeStation,
      createdAt: new Date()
    });
    await sosLog.save();

    // 9. Return full response to frontend
    return res.status(200).json({
      success: true,
      message: 'SOS activated successfully',
      data: {
        contactsNotified: contacts.map(c => ({ 
          name: c.name, 
          phone: c.phone,
          smsSent: smsResults.sent > 0
        })),
        smsResults,
        callResults,
        policeStation,
        policeAlerted,
        locationLink: `https://maps.google.com/?q=${lat},${lng}`,
        timestamp: new Date().toISOString()
      }
    });

  } catch (err) {
    console.error('SOS trigger error:', err);
    return res.status(500).json({ 
      message: 'SOS system error', 
      error: err.message 
    });
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
