const express = require('express');
const router = express.Router();
const { getChatHistory } = require('../controllers/chat.controller');
const authenticateToken = require('../middlewares/auth.middleware');

router.get('/:asteroidId', authenticateToken, getChatHistory);

module.exports = router;
