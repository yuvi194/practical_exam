require('dotenv').config();
const express = require('express');
const { rateLimiter } = require('./middleware/rateLimiter');
const { errorHandler } = require('./middleware/errorHandler');
const { sendError } = require('./utils/responseUtils');

const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');

const app = express();

// Body parsing
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Global rate limiter
app.use(rateLimiter);

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);

// 404 handler
app.use((req, res) => {
  return sendError(res, 404, `Route ${req.originalUrl} not found`);
});

// Global error handler
app.use(errorHandler);

module.exports = app;
