const express = require('express');
const router = express.Router();
const { getAsteroids, refreshAsteroids } = require('../controllers/asteroid.controller');
const authenticateToken = require('../middlewares/auth.middleware');

router.get('/', getAsteroids); // Temporarily removed auth for testing
router.post('/refresh', refreshAsteroids); // Temporarily removed auth for testing

module.exports = router;
