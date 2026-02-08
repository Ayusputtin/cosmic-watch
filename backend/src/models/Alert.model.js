const mongoose = require('mongoose');

const AlertSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['approach', 'hazardous', 'threshold'],
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
  createdByRole: {
    type: String,
    default: 'system', // 'scientist' or 'system'
  },
  asteroidName: String,
  read: {
    type: Boolean,
    default: false, // For individual user tracking, this might need a separate mechanism, but keeping simple for global alerts
  }
});

module.exports = mongoose.model('Alert', AlertSchema);
