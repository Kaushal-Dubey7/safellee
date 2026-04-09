const mongoose = require('mongoose');

const journeySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  source: {
    name: { type: String, default: '' },
    coordinates: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true }
    }
  },
  destination: {
    name: { type: String, default: '' },
    coordinates: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true }
    }
  },
  selectedRoute: { type: String, enum: ['safe', 'medium', 'risky'], default: 'safe' },
  safetyScore: { type: Number, default: 0 },
  status: { type: String, enum: ['active', 'paused', 'completed', 'sos'], default: 'active' },
  locationHistory: [{
    lat: Number,
    lng: Number,
    timestamp: { type: Date, default: Date.now }
  }],
  lastLocationUpdate: { type: Date, default: Date.now },
  startedAt: { type: Date, default: Date.now },
  endedAt: { type: Date }
});

journeySchema.index({ userId: 1, status: 1 });

module.exports = mongoose.model('Journey', journeySchema);
