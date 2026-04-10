const mongoose = require('mongoose');

const CrimeZoneSchema = new mongoose.Schema({
  name:          String,
  city:          String,
  crimeScore:    { type: Number, min: 0, max: 100 },
  lightingScore: { type: Number, min: 0, max: 100 },
  crowdScore:    { type: Number, min: 0, max: 100 },
  areaType:      { type: String, enum: ['commercial','residential','industrial','mixed','public','government'], default: 'mixed' },
  type:          { type: String, enum: ['high','medium','low'] },
  incidentCount: Number,
  lastUpdated:   Date,
  geometry: {
    type:        { type: String, enum: ['Polygon'], required: true },
    coordinates: { type: [[[Number]]], required: true }
  }
});

CrimeZoneSchema.index({ geometry: '2dsphere' });
module.exports = mongoose.model('CrimeZone', CrimeZoneSchema);
