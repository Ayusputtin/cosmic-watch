const express = require('express');
const router = express.Router();
const { getAsteroids, refreshAsteroids } = require('../controllers/asteroid.controller');
const authenticateToken = require('../middlewares/auth.middleware');

router.get('/', authenticateToken, getAsteroids);
router.post('/refresh', authenticateToken, refreshAsteroids);

module.exports = router;
