const mongoose = require('mongoose');

const SystemHealthLogSchema = new mongoose.Schema({
  overall: { type: String, enum: ['healthy', 'degraded', 'down'], required: true },
  services: { type: mongoose.Schema.Types.Mixed, required: true },
  checkedAt: { type: Date, default: Date.now }
});

// Auto-delete logs older than 24 hours to avoid unbounded growth
SystemHealthLogSchema.index({ checkedAt: 1 }, { expireAfterSeconds: 86400 });

module.exports = mongoose.model('SystemHealthLog', SystemHealthLogSchema);
