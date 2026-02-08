const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User.model');
const { JWT_SECRET } = require('../config/env');
const logger = require('../utils/logger');

const register = async (req, res) => {
  try {
    const { username, password, role } = req.body;
    
    // Check if user exists
    const existingUser = await User.findOne({ username });
    if (existingUser) return res.status(400).json({ message: 'Username already exists' });

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const user = new User({
      username,
      password: hashedPassword,
      role: role || 'enthusiast',
    });

    await user.save();

    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    logger.error(error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Check user
    const user = await User.findOne({ username });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    // Generate JWT
    const token = jwt.sign(
      { id: user._id, username: user.username, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({ token, user: { id: user._id, username: user.username, role: user.role } });
  } catch (error) {
    logger.error(error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { register, login };
