const mongoose = require('mongoose');

const AsteroidSchema = new mongoose.Schema({
  nasaId: {
    type: String,
    required: true,
    unique: true,
  },
  name: {
    type: String,
    required: true,
  },
  diameterMin: Number, // km
  diameterMax: Number, // km
  velocity: Number, // km/h
  missDistance: Number, // km
  closeApproachDate: Date,
  isHazardous: Boolean,
  riskScore: Number, // Calculated 0-100
  lastUpdated: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Asteroid', AsteroidSchema);
