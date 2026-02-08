const Watchlist = require('../models/Watchlist.model');
const Asteroid = require('../models/Asteroid.model');
const logger = require('../utils/logger');

const getWatchlist = async (req, res) => {
  try {
    const userId = req.user.id;
    const watchlist = await Watchlist.find({ user: userId });
    
    // Enrich with asteroid data
    // Note: In a real app, we might use populate if we referenced ObjectId, 
    // but here we stored nasaId.
    const asteroidIds = watchlist.map(w => w.asteroid);
    const asteroids = await Asteroid.find({ nasaId: { $in: asteroidIds } });

    res.json(asteroids);
  } catch (error) {
    logger.error(error.message);
    res.status(500).json({ message: 'Server error fetching watchlist' });
  }
};

const addToWatchlist = async (req, res) => {
  try {
    const userId = req.user.id;
    const { asteroidId } = req.body;

    if (!asteroidId) return res.status(400).json({ message: 'Asteroid ID required' });

    const newItem = new Watchlist({
      user: userId,
      asteroid: asteroidId,
    });

    await newItem.save();
    res.status(201).json({ message: 'Added to watchlist' });
  } catch (error) {
    if (error.code === 11000) {
        return res.status(400).json({ message: 'Already in watchlist' });
    }
    logger.error(error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

const removeFromWatchlist = async (req, res) => {
  try {
    const userId = req.user.id;
    const { asteroidId } = req.params;

    await Watchlist.findOneAndDelete({ user: userId, asteroid: asteroidId });
    res.json({ message: 'Removed from watchlist' });
  } catch (error) {
    logger.error(error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getWatchlist, addToWatchlist, removeFromWatchlist };
