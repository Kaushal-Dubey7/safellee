const mongoose = require('mongoose');

const RoutScoreCacheSchema = new mongoose.Schema({
  // Geohash-style area key: rounded to 2 decimal places (user specified 100/100)
  areaKey:        { type: String, index: true, unique: true },
  centerLat:      Number,
  centerLng:      Number,
  totalRatings:   { type: Number, default: 0 },
  averageRating:  { type: Number, default: 3.0 }, // 1-5 scale
  positiveCount:  { type: Number, default: 0 },
  negativeCount:  { type: Number, default: 0 },
  topLikes:       [String],
  topDislikes:    [String],
  communityScore: { type: Number, default: 70 }, // 0-100 scale
  lastUpdated:    { type: Date, default: Date.now }
});

module.exports = mongoose.model('RouteScoreCache', RoutScoreCacheSchema);
