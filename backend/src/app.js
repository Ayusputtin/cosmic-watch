const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth.routes');
const asteroidRoutes = require('./routes/asteroid.routes');
const watchlistRoutes = require('./routes/watchlist.routes');
const alertRoutes = require('./routes/alert.routes');
const chatRoutes = require('./routes/chat.routes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/asteroids', asteroidRoutes);
app.use('/api/watchlist', watchlistRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/chat', chatRoutes);

// Base route
app.get('/', (req, res) => {
  res.send('Cosmic Watch API is running');
});

module.exports = app;
