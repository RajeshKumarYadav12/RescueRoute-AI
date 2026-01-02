const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
require("dotenv").config();

// Import routes
const authRoutes = require("./routes/auth");
const emergencyRoutes = require("./routes/emergency");
const vehicleRoutes = require("./routes/vehicle");
const trafficRoutes = require("./routes/traffic");
const signalRoutes = require("./routes/signal");
const analyticsRoutes = require("./routes/analytics");
const translationRoutes = require("./routes/translation");

// Import middleware
const errorHandler = require("./middleware/errorHandler");
const logger = require("./utils/logger");

const app = express();

// Security middleware
app.use(helmet());
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  })
);

// Body parser middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Logging middleware
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
} else {
  app.use(
    morgan("combined", {
      stream: {
        write: (message) => logger.info(message.trim()),
      },
    })
  );
}

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 900000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  message: "Too many requests from this IP, please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
});

app.use("/api/", limiter);

// Welcome endpoint
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "RescueRoute AI API Server",
    version: "1.0.0",
    documentation: "/api/docs",
    endpoints: {
      health: "/health",
      auth: "/api/auth",
      emergency: "/api/emergency",
      vehicle: "/api/vehicle",
      traffic: "/api/traffic",
      signal: "/api/signal",
      analytics: "/api/analytics",
      translation: "/api/translation",
    },
    timestamp: new Date().toISOString(),
  });
});

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/emergency", emergencyRoutes);
app.use("/api/vehicle", vehicleRoutes);
app.use("/api/traffic", trafficRoutes);
app.use("/api/signal", signalRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/translation", translationRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

// Error handling middleware (must be last)
app.use(errorHandler);

module.exports = app;
