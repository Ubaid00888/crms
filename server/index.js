// Server entry point - Updated CORS configuration
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const http = require('http');
const { Server } = require('socket.io');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');
const { initCronJobs } = require('./services/crimeFeedService');

// Import routes
const authRoutes = require('./routes/authRoutes');
const criminalRoutes = require('./routes/criminalRoutes');
const crimeRoutes = require('./routes/crimeRoutes');
const caseRoutes = require('./routes/caseRoutes');
const intelligenceRoutes = require('./routes/intelligenceRoutes');
const publicRoutes = require('./routes/publicRoutes');
const adminRoutes = require('./routes/adminRoutes');

// Connect to database
connectDB();

// Initialize cron jobs for global crime feed
initCronJobs();

const app = express();
const server = http.createServer(app);

// CORS Configuration
const allowedOrigins = process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',')
    : ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175'];

const corsOptions = {
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);

        if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV === 'development') {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
    optionsSuccessStatus: 200 // Some legacy browsers (IE11, various SmartTVs) choke on 204
};

// Socket.IO setup
const io = new Server(server, {
    cors: corsOptions
});

// Make io accessible to routes
app.set('io', io);

// Middleware
app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" }
}));
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later',
});
app.use('/api/', limiter);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/criminals', criminalRoutes);
app.use('/api/crimes', crimeRoutes);
app.use('/api/cases', caseRoutes);
app.use('/api/intelligence', intelligenceRoutes);
app.use('/api/public', publicRoutes);
app.use('/api/admin', adminRoutes);

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Error handler (must be last)
app.use(errorHandler);

// Socket.IO connection handling
io.on('connection', (socket) => {
    console.log(`✅ Client connected: ${socket.id}`);

    socket.on('disconnect', () => {
        console.log(`❌ Client disconnected: ${socket.id}`);
    });

    // Join room based on user role
    socket.on('join-room', (room) => {
        socket.join(room);
        console.log(`User joined room: ${room}`);
    });
});

// Global socket emitter helper
global.emitToAll = (event, data) => {
    io.emit(event, data);
};

global.emitToRoom = (room, event, data) => {
    io.to(room).emit(event, data);
};

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
    console.log(`
  ╔═══════════════════════════════════════╗
  ║   🚔 Crime Management System (CMS)    ║
  ║   Server running on port ${PORT}        ║
  ║   Environment: ${process.env.NODE_ENV || 'development'}          ║
  ╚═══════════════════════════════════════╝
  `);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
    console.log(`❌ Error: ${err.message}`);
    server.close(() => process.exit(1));
});
