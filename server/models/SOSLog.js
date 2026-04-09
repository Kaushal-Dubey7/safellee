const mongoose = require('mongoose');

const sosLogSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  triggerType: { type: String, enum: ['auto', 'manual', 'lowbattery'], required: true },
  location: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true }
  },
  address: { type: String, default: '' },
  contactsNotified: [String],
  nearestPoliceStation: {
    name: { type: String, default: '' },
    phone: { type: String, default: '' },
    lat: Number,
    lng: Number
  },
  resolvedAt: { type: Date },
  createdAt: { type: Date, default: Date.now }
});

sosLogSchema.index({ userId: 1 });

module.exports = mongoose.model('SOSLog', sosLogSchema);
