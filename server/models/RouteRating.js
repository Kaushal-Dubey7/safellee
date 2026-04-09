const mongoose = require('mongoose');

const routeRatingSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  routeId: { type: String, default: '' },
  sourceCoords: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true }
  },
  destCoords: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true }
  },
  rating: { type: Number, min: 1, max: 5, required: true },
  likes: [String],
  dislikes: [String],
  comment: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now }
});

routeRatingSchema.index({ routeId: 1 });
routeRatingSchema.index({ userId: 1 });

module.exports = mongoose.model('RouteRating', routeRatingSchema);
