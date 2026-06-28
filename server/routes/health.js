const express = require('express');
const router = express.Router();
const { getCurrentHealthState } = require('../services/healthMonitorService');
const SystemHealthLog = require('../models/SystemHealthLog');

// GET /api/health/status — current live snapshot, no auth required
// (so it works even if JWT auth itself were ever the problem)
router.get('/status', (req, res) => {
  const state = getCurrentHealthState();
  res.json(state);
});

// GET /api/health/history — last 50 checks, for the admin dashboard chart
router.get('/history', async (req, res) => {
  try {
    const logs = await SystemHealthLog.find()
      .sort({ checkedAt: -1 })
      .limit(50);
    res.json(logs);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch health history', error: err.message });
  }
});

module.exports = router;
