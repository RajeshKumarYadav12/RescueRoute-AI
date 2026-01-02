const app = require("./app");
const connectDB = require("./config/database");
const { connectRedis } = require("./config/redis");
const logger = require("./utils/logger");

// Load environment variables
require("dotenv").config();

const PORT = process.env.PORT || 5000;

// Connect to databases
const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectDB();

    // Connect to Redis
    await connectRedis();

    // Load models to ensure indexes are created
    require("./models/Emergency");
    require("./models/Vehicle");
    require("./models/TrafficData");
    require("./models/Signal");
    require("./models/User");
    require("./models/AccidentHistorical");

    // Start Express server
    const server = app.listen(PORT, () => {
      logger.info(
        `🚀 Server running on port ${PORT} in ${process.env.NODE_ENV} mode`
      );
      logger.info(`📍 API URL: http://localhost:${PORT}`);
    });

    // Graceful shutdown
    process.on("SIGTERM", () => {
      logger.info("SIGTERM signal received: closing HTTP server");
      server.close(() => {
        logger.info("HTTP server closed");
        process.exit(0);
      });
    });

    process.on("SIGINT", () => {
      logger.info("SIGINT signal received: closing HTTP server");
      server.close(() => {
        logger.info("HTTP server closed");
        process.exit(0);
      });
    });
  } catch (error) {
    logger.error(`Failed to start server: ${error.message}`);
    process.exit(1);
  }
};

// Handle uncaught exceptions
process.on("uncaughtException", (error) => {
  logger.error(`Uncaught Exception: ${error.message}`);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (error) => {
  logger.error(`Unhandled Rejection: ${error.message}`);
  process.exit(1);
});

// Start the server
startServer();
