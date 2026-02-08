const express = require('express');
const router = express.Router();
const { getAlerts, createAlert } = require('../controllers/alert.controller');
const authenticateToken = require('../middlewares/auth.middleware');
const requireRole = require('../middlewares/role.middleware');

router.get('/', authenticateToken, getAlerts);
router.post('/', authenticateToken, requireRole('scientist'), createAlert);

module.exports = router;
