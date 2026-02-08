const Alert = require('../models/Alert.model');
const logger = require('../utils/logger');

const getAlerts = async (req, res) => {
  try {
    const alerts = await Alert.find().sort({ timestamp: -1 });
    res.json(alerts);
  } catch (error) {
    logger.error(error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

const createAlert = async (req, res) => {
  try {
    const { type, title, description, asteroidName } = req.body;

    const newAlert = new Alert({
      type,
      title,
      description,
      asteroidName,
      createdByRole: req.user.role,
    });

    await newAlert.save();
    
    // Socket.io emit will be handled in the route or service, 
    // but typically controller handles response.
    // For now, we assume the frontend gets it via polling or the socket connection handles the broadcast separately.
    // To do it properly, we should import io instance or use event emitter.
    // For this implementation, we will rely on the socket service to have been triggered 
    // or the client to broadcast via socket after successful API call, 
    // OR better, we access io here if we attach it to req.
    
    if (req.io) {
        req.io.emit('receive_alert', newAlert);
    }

    res.status(201).json(newAlert);
  } catch (error) {
    logger.error(error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getAlerts, createAlert };
