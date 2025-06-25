const app = require("./app"); // Import the app
const mongoose = require("mongoose");
const http = require("http");
const socketIo = require("socket.io");
const cors = require("cors");

require("dotenv").config(); // Load environment variables

const PORT = process.env.PORT || 5001;

// Create HTTP server using the Express app
const server = http.createServer(app);

// Set up Socket.IO with CORS
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Map to store user socket connections
const userSocketMap = new Map();
// Map to store room participants
const rooms = new Map();

io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  // Register user ID with socket ID
  socket.on('register', ({ userId }) => {
    console.log(`User ${userId} registered with socket ${socket.id}`);
    userSocketMap.set(userId, socket.id);
  });

  // Handle joining a room
  socket.on('join-room', ({ roomId }) => {
    console.log(`Socket ${socket.id} joining room ${roomId}`);
    
    // Add user to room
    socket.join(roomId);
    
    // Initialize room if it doesn't exist
    if (!rooms.has(roomId)) {
      rooms.set(roomId, new Set());
    }
    
    const room = rooms.get(roomId);
    room.add(socket.id);
    
    // Notify other users in room
    socket.to(roomId).emit('user-connected');
    
    console.log(`Room ${roomId} now has ${room.size} participants`);
  });

  // Handle leaving a room
  socket.on('leave-room', ({ roomId }) => {
    console.log(`Socket ${socket.id} leaving room ${roomId}`);
    
    socket.leave(roomId);
    
    if (rooms.has(roomId)) {
      const room = rooms.get(roomId);
      room.delete(socket.id);
      
      // Clean up empty rooms
      if (room.size === 0) {
        rooms.delete(roomId);
        console.log(`Room ${roomId} deleted (empty)`);
      }
    }
    
    // Notify others that user has left
    socket.to(roomId).emit('user-disconnected');
  });

  // Handle call initiation
  socket.on('call-user', ({ from, to }) => {
    console.log(`Call from ${from} to ${to}`);
    
    const toSocketId = userSocketMap.get(to);
    
    if (toSocketId) {
      io.to(toSocketId).emit('incoming-call', { from });
    } else {
      console.log(`User ${to} is not online`);
      // You might want to notify the caller that the user is not available
    }
  });

  // Handle call acceptance
  socket.on('accept-call', ({ to }) => {
    console.log(`Call accepted, notifying ${to}`);
    
    const toSocketId = userSocketMap.get(to);
    
    if (toSocketId) {
      io.to(toSocketId).emit('call-accepted');
    }
  });

  // WebRTC signaling
  socket.on('offer', ({ roomId, offer }) => {
    console.log(`Relaying offer in room ${roomId}`);
    socket.to(roomId).emit('offer', { offer });
  });

  socket.on('answer', ({ roomId, answer }) => {
    console.log(`Relaying answer in room ${roomId}`);
    socket.to(roomId).emit('answer', { answer });
  });

  socket.on('ice-candidate', ({ roomId, candidate }) => {
    console.log(`Relaying ICE candidate in room ${roomId}`);
    socket.to(roomId).emit('ice-candidate', { candidate });
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    
    // Remove user from userSocketMap
    for (const [userId, socketId] of userSocketMap.entries()) {
      if (socketId === socket.id) {
        userSocketMap.delete(userId);
        break;
      }
    }
    
    // Remove user from all rooms and notify other participants
    for (const [roomId, participants] of rooms.entries()) {
      if (participants.has(socket.id)) {
        participants.delete(socket.id);
        
        // Notify others in the room
        socket.to(roomId).emit('user-disconnected');
        
        // Clean up empty rooms
        if (participants.size === 0) {
          rooms.delete(roomId);
          console.log(`Room ${roomId} deleted (empty after disconnect)`);
        }
      }
    }
  });
});

// MongoDB connection
mongoose
  .connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => {
    console.error("MongoDB connection error:", err.message);
    process.exit(1); // Exit process with failure
  });

// Graceful shutdown
process.on("SIGINT", () => {
  mongoose.connection.close(() => {
    console.log("Mongoose connection closed");
    process.exit(0);
  });
});

// Start the server (changed from app.listen to server.listen)
server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  console.log(`Socket.IO server is also running on port ${PORT}`);
});