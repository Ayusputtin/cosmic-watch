const mongoose = require('mongoose');

const WatchlistSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  asteroid: {
    type: String, // Storing nasaId for easier reference, or could be ObjectId if we strictly link to Asteroid model
    required: true,
  },
  addedAt: {
    type: Date,
    default: Date.now,
  },
});

// Unique compound index to prevent duplicate watches
WatchlistSchema.index({ user: 1, asteroid: 1 }, { unique: true });

module.exports = mongoose.model('Watchlist', WatchlistSchema);
