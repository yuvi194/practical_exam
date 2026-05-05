require('dotenv').config();
const express = require('express');
const { rateLimiter } = require('./middleware/rateLimiter');
const { errorHandler } = require('./middleware/errorHandler');
const { sendError } = require('./utils/responseUtils');

const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');

const app = express();
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));


app.use(rateLimiter);


app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});


app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);

app.use((req, res) => {
  return sendError(res, 404, `Route ${req.originalUrl} not found`);
});


app.use(errorHandler);

module.exports = app;
