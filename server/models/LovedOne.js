const mongoose = require('mongoose');

const lovedOneSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  phone: { type: String, required: true },
  relationship: { type: String, default: '' }
});

lovedOneSchema.index({ userId: 1 });

module.exports = mongoose.model('LovedOne', lovedOneSchema);
