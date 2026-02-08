const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join_asteroid', (asteroidId) => {
    socket.join(asteroidId);
    console.log(`User ${socket.id} joined asteroid room: ${asteroidId}`);
  });

  socket.on('send_message', (data) => {
    // data: { asteroidId, user, text, timestamp, role }
    io.to(data.asteroidId).emit('receive_message', data);
  });

  socket.on('create_alert', (alertData) => {
    // Simple role check if provided in metadata (in a real app, verify via token)
    if (alertData.role && alertData.role !== 'scientist') {
      console.log('Unauthorized alert creation attempt by:', alertData.role);
      return;
    }
    
    // Broadcast to all connected clients
    io.emit('receive_alert', alertData);
    console.log('Alert broadcasted:', alertData.title);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
