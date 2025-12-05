require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/database');
const routes = require('./routes');
const { errorHandler, notFound } = require('./middleware');
const { initializeWebSocket } = require('./websocket');

// Initialize express app
const app = express();

// Create HTTP server
const server = http.createServer(app);

// Initialize WebSocket
initializeWebSocket(server);

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// API Routes
app.use('/api', routes);

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// Root route
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Video Call Server API',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      rooms: '/api/rooms',
      admin: '/api/admin'
    }
  });
});

// Error handlers
app.use(notFound);
app.use(errorHandler);

// Server configuration
const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`
    ╔═══════════════════════════════════════╗
    ║   Video Call Server Running           ║
    ║   Port: ${PORT}                        ║
    ║   Environment: ${process.env.NODE_ENV || 'development'}        ║
    ║   Socket.IO: Enabled                  ║
    ╚═══════════════════════════════════════╝
  `);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error(`Unhandled Rejection: ${err.message}`);
  server.close(() => process.exit(1));
});

module.exports = { app, server };
