// ============================================================
// Express Application Setup
// ============================================================
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
require('dotenv').config();

const app = express();

// ============================================================
// Middleware
// ============================================================

// Security headers
app.use(helmet());

// CORS configuration
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Request logging
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ============================================================
// Routes
// ============================================================
const authRoutes = require('./routes/auth');
const studentRoutes = require('./routes/students');
const subjectRoutes = require('./routes/subjects');
const examRoutes = require('./routes/exams');
const questionRoutes = require('./routes/questions');
const resultRoutes = require('./routes/results');
const reportRoutes = require('./routes/reports');
const dashboardRoutes = require('./routes/dashboard');

app.use('/api/auth', authRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/subjects', subjectRoutes);
app.use('/api/exams', examRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/results', resultRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/dashboard', dashboardRoutes);

// ============================================================
// Health Check
// ============================================================
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        message: 'Online Exam System API is running',
        timestamp: new Date().toISOString()
    });
});

// ============================================================
// Error Handling Middleware
// ============================================================
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
