import app from './src/app.js';
import config from './src/config/index.js';
import connectDatabase from './src/config/database.js';

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT EXCEPTION! 💥 Shutting down...');
  console.error(err.name, err.message, err.stack);
  process.exit(1);
});

// Connect to MongoDB
connectDatabase();

// Start HTTP server
const server = app.listen(config.port, () => {
  console.log(
    `[Server] Trading Assistant API listening on port ${config.port} in [${config.env}] mode`
  );
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('UNHANDLED REJECTION! 💥 Shutting down...');
  console.error(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});
