const ChatMessage = require('../models/ChatMessage.model');
const logger = require('../utils/logger');

const getChatHistory = async (req, res) => {
  try {
    const { asteroidId } = req.params;
    const messages = await ChatMessage.find({ asteroidId }).sort({ timestamp: 1 });
    res.json(messages);
  } catch (error) {
    logger.error(error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getChatHistory };
