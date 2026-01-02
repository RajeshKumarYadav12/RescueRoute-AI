const Emergency = require("../models/Emergency");
const Vehicle = require("../models/Vehicle");
const AccidentHistorical = require("../models/AccidentHistorical");
const logger = require("../utils/logger");
const { cacheGet, cacheSet } = require("../config/redis");

// @desc    Get dashboard analytics
// @route   GET /api/analytics
// @access  Private
exports.getDashboardAnalytics = async (req, res, next) => {
  try {
    // Try cache first
    const cacheKey = "analytics:dashboard";
    const cached = await cacheGet(cacheKey);

    if (cached) {
      return res.json({
        success: true,
        analytics: cached,
        cached: true,
      });
    }

    // Active emergencies
    const activeEmergencies = await Emergency.countDocuments({
      status: { $in: ["reported", "dispatched", "ongoing"] },
    });

    // Average response time (last 24 hours)
    const last24h = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const resolvedEmergencies = await Emergency.find({
      status: "resolved",
      resolved_at: { $gte: last24h },
      response_time: { $exists: true },
    });

    const avgResponseTime =
      resolvedEmergencies.length > 0
        ? resolvedEmergencies.reduce((sum, e) => sum + e.response_time, 0) /
          resolvedEmergencies.length
        : 0;

    // Vehicle status breakdown
    const vehicleStats = await Vehicle.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    // Emergency type breakdown
    const emergencyTypeStats = await Emergency.aggregate([
      {
        $match: {
          timestamp: { $gte: last24h },
        },
      },
      {
        $group: {
          _id: "$type",
          count: { $sum: 1 },
        },
      },
    ]);

    const analytics = {
      activeEmergencies,
      avgResponseTime: Math.round(avgResponseTime),
      vehicleStats,
      emergencyTypeStats,
      timestamp: new Date(),
    };

    // Cache for 1 minute
    await cacheSet(cacheKey, analytics, 60);

    res.json({
      success: true,
      analytics,
      cached: false,
    });
  } catch (error) {
    logger.error(`Get dashboard analytics error: ${error.message}`);
    next(error);
  }
};

// @desc    Get accident hotspots
// @route   GET /api/analytics/hotspots
// @access  Private
exports.getAccidentHotspots = async (req, res, next) => {
  try {
    // This would use K-Means clustering algorithm
    // For now, returning aggregated data by location

    const hotspots = await AccidentHistorical.aggregate([
      {
        $group: {
          _id: {
            lat: {
              $round: [{ $arrayElemAt: ["$location.coordinates", 1] }, 2],
            },
            lon: {
              $round: [{ $arrayElemAt: ["$location.coordinates", 0] }, 2],
            },
          },
          count: { $sum: 1 },
          avgSeverity: { $avg: "$severity" },
          location: { $first: "$location" },
        },
      },
      {
        $match: {
          count: { $gte: 3 }, // At least 3 accidents
        },
      },
      {
        $sort: { count: -1 },
      },
      {
        $limit: 20,
      },
    ]);

    res.json({
      success: true,
      count: hotspots.length,
      hotspots,
    });
  } catch (error) {
    logger.error(`Get accident hotspots error: ${error.message}`);
    next(error);
  }
};

// @desc    Get response times
// @route   GET /api/analytics/response-times
// @access  Private
exports.getResponseTimes = async (req, res, next) => {
  try {
    const { days = 7 } = req.query;

    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const responseTimes = await Emergency.aggregate([
      {
        $match: {
          status: "resolved",
          resolved_at: { $gte: startDate },
          response_time: { $exists: true },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$timestamp" },
          },
          avgResponseTime: { $avg: "$response_time" },
          minResponseTime: { $min: "$response_time" },
          maxResponseTime: { $max: "$response_time" },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ]);

    res.json({
      success: true,
      responseTimes,
    });
  } catch (error) {
    logger.error(`Get response times error: ${error.message}`);
    next(error);
  }
};

// @desc    Get emergency statistics
// @route   GET /api/analytics/emergency-stats
// @access  Private
exports.getEmergencyStats = async (req, res, next) => {
  try {
    const { period = "week" } = req.query;

    let startDate;
    if (period === "day") {
      startDate = new Date(Date.now() - 24 * 60 * 60 * 1000);
    } else if (period === "week") {
      startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    } else {
      startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    }

    const stats = await Emergency.aggregate([
      {
        $match: {
          timestamp: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          avgSeverity: { $avg: "$severity" },
          highSeverity: {
            $sum: { $cond: [{ $gte: ["$severity", 7] }, 1, 0] },
          },
          resolved: {
            $sum: { $cond: [{ $eq: ["$status", "resolved"] }, 1, 0] },
          },
        },
      },
    ]);

    res.json({
      success: true,
      stats: stats[0] || {},
    });
  } catch (error) {
    logger.error(`Get emergency stats error: ${error.message}`);
    next(error);
  }
};

// @desc    Get vehicle utilization
// @route   GET /api/analytics/vehicle-utilization
// @access  Private
exports.getVehicleUtilization = async (req, res, next) => {
  try {
    const utilization = await Vehicle.aggregate([
      {
        $group: {
          _id: "$type",
          total: { $sum: 1 },
          available: {
            $sum: { $cond: [{ $eq: ["$status", "available"] }, 1, 0] },
          },
          dispatched: {
            $sum: { $cond: [{ $eq: ["$status", "dispatched"] }, 1, 0] },
          },
          onScene: {
            $sum: { $cond: [{ $eq: ["$status", "on_scene"] }, 1, 0] },
          },
        },
      },
    ]);

    res.json({
      success: true,
      utilization,
    });
  } catch (error) {
    logger.error(`Get vehicle utilization error: ${error.message}`);
    next(error);
  }
};
