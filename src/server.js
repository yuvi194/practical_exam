require('dotenv').config();
const app = require('./app');
const connectDB = require('./config/db');

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  await connectDB();

  const server = app.listen(PORT, () => {
    console.log(
      `Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`
    );
  });


  const shutdown = async (signal) => {
    console.log(`\n${signal} received. Shutting down gracefully...`);
    server.close(async () => {
      const mongoose = require('mongoose');
      await mongoose.connection.close();
      console.log('MongoDB connection closed.');
      process.exit(0);
    });
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));

  process.on('unhandledRejection', (err) => {
    console.error('Unhandled Rejection:', err);
    server.close(() => process.exit(1));
  });
};

startServer();
