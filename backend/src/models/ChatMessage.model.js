const mongoose = require('mongoose');

const ChatMessageSchema = new mongoose.Schema({
  asteroidId: {
    type: String,
    required: true,
  },
  user: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    default: 'Enthusiast',
  },
  text: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('ChatMessage', ChatMessageSchema);
