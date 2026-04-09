const mongoose = require('mongoose');

const crimeZoneSchema = new mongoose.Schema({
  name: { type: String, required: true },
  city: { type: String, default: 'Delhi' },
  crimeScore: { type: Number, min: 0, max: 100, required: true },
  lightingScore: { type: Number, min: 0, max: 100, required: true },
  crowdScore: { type: Number, min: 0, max: 100, required: true },
  type: { type: String, enum: ['high', 'medium', 'low'], required: true },
  geometry: {
    type: { type: String, enum: ['Polygon'], default: 'Polygon' },
    coordinates: { type: [[[Number]]], required: true }
  },
  incidentCount: { type: Number, default: 0 },
  lastUpdated: { type: Date, default: Date.now }
});

crimeZoneSchema.index({ geometry: '2dsphere' });

module.exports = mongoose.model('CrimeZone', crimeZoneSchema);
