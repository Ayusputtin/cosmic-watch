const http = require("http");
const { Server } = require("socket.io");
const app = require("./app");
const connectDB = require("./config/db");
const { PORT } = require("./config/env");
const logger = require("./utils/logger");
const ChatMessage = require("./models/ChatMessage.model");
const cron = require("node-cron");
const { fetchAndCacheAsteroids } = require("./services/nasa.service");

// Connect to Database
connectDB();

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // Allow all for now, restrict in production
    methods: ["GET", "POST"],
  },
});

// Attach io to app so controllers can access it (optional, but good pattern)
app.use((req, res, next) => {
  req.io = io;
  next();
});

io.on("connection", (socket) => {
  logger.info(`User Connected: ${socket.id}`);

  // Join Asteroid Chat Room
  socket.on("join_asteroid", (asteroidId) => {
    socket.join(asteroidId);
    logger.info(`User ${socket.id} joined asteroid room: ${asteroidId}`);
  });

  // Handle Chat Message
  socket.on("send_message", async (data) => {
    // data: { asteroidId, user, role, text }
    try {
      const newMessage = new ChatMessage({
        asteroidId: data.asteroidId,
        user: data.user,
        role: data.role,
        text: data.text,
        timestamp: new Date(),
      });
      await newMessage.save();

      io.to(data.asteroidId).emit("receive_message", newMessage);
    } catch (error) {
      logger.error(`Error saving chat message: ${error.message}`);
    }
  });

  // Handle Alert Creation (Real-time broadcast)
  socket.on("create_alert", (alertData) => {
    // Basic validation if needed, though API route is primary for creation
    // This event might be emitted by the client who successfully called the API
    // OR we can rely on the API controller to emit.
    // If we use the API controller to emit (as implemented in alert.controller.js),
    // we don't strictly need this listener for CREATION, but clients need to listen for 'receive_alert'.
    // However, if we want to support socket-only events (less secure without middleware), we keep this.
    // Let's assume the API handles the creation and broadcast.
  });

  socket.on("disconnect", () => {
    logger.info("User Disconnected", socket.id);
  });
});

server.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
});
