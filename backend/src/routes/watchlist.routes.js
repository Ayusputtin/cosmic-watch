const express = require('express');
const router = express.Router();
const { getWatchlist, addToWatchlist, removeFromWatchlist } = require('../controllers/watchlist.controller');
const authenticateToken = require('../middlewares/auth.middleware');

router.get('/', authenticateToken, getWatchlist);
router.post('/', authenticateToken, addToWatchlist);
router.delete('/:asteroidId', authenticateToken, removeFromWatchlist);

module.exports = router;
