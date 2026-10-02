/**
 * server.js
 * Main Entry Point for Nebula 2026 Web Service
 * Configured for local development and Render deployment.
 */

const express = require('express');
const http = require('http');
const path = require('path');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const { Server } = require('socket.io');

const authRoutes = require('./routes/authRoutes');
const teamRoutes = require('./routes/teamRoutes');
const adminRoutes = require('./routes/adminRoutes');
const { authMiddleware } = require('./auth');
const db = require('./db');

const app = express();
const server = http.createServer(app);

// Initialize Socket.IO
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Attach io to express app so routes can broadcast
app.set('io', io);

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());
app.use(authMiddleware);

// Serve Static Frontend Files
const publicPath = path.join(__dirname, '..', 'public');
app.use(express.static(publicPath));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/contest', teamRoutes);
app.use('/api/admin', adminRoutes);

// Health check endpoint for Render
app.get('/healthz', (req, res) => {
  res.status(200).json({ status: 'healthy', uptime: process.uptime() });
});

// Frontend Page Routing
app.get('/contest', (req, res) => {
  res.sendFile(path.join(publicPath, 'contest.html'));
});

app.get('/admin', (req, res) => {
  res.sendFile(path.join(publicPath, 'admin.html'));
});

// Catch-all route for SPA navigation (Express 5 compatible)
app.use((req, res) => {
  res.sendFile(path.join(publicPath, 'index.html'));
});

// WebSocket Connection Events
io.on('connection', (socket) => {
  // Join admin room
  socket.on('join_admin', () => {
    socket.join('admin_channel');
  });

  // Team ping for real-time online status
  socket.on('team_online', (data) => {
    if (data && data.teamId) {
      socket.teamId = data.teamId;
      io.to('admin_channel').emit('team_status_changed', {
        teamId: data.teamId,
        online: true
      });
    }
  });

  socket.on('disconnect', () => {
    if (socket.teamId) {
      io.to('admin_channel').emit('team_status_changed', {
        teamId: socket.teamId,
        online: false
      });
    }
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`================================================`);
  console.log(`🚀 Nebula 2026 Event Server running on port ${PORT}`);
  console.log(`🌐 Local URL: http://localhost:${PORT}`);
  console.log(`🛡️ Admin Portal: http://localhost:${PORT}/admin`);
  console.log(`👥 Contest Portal: http://localhost:${PORT}/contest`);
  console.log(`================================================`);
});
