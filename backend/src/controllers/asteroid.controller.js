const Asteroid = require('../models/Asteroid.model');
const { fetchAndCacheAsteroids } = require('../services/nasa.service');
const logger = require('../utils/logger');

const getAsteroids = async (req, res) => {
  try {
    // Try to get from DB first
    let asteroids = await Asteroid.find().sort({ closeApproachDate: 1 });

    // If DB empty or stale (simplification: if empty), fetch from NASA
    if (asteroids.length === 0) {
        asteroids = await fetchAndCacheAsteroids();
    }

    res.json(asteroids);
  } catch (error) {
    logger.error(error.message);
    res.status(500).json({ message: 'Server error fetching asteroids' });
  }
};

const refreshAsteroids = async (req, res) => {
    try {
        const asteroids = await fetchAndCacheAsteroids();
        res.json(asteroids);
    } catch (error) {
        logger.error(error.message);
        res.status(500).json({ message: 'Server error refreshing asteroids' });
    }
}

module.exports = { getAsteroids, refreshAsteroids };
