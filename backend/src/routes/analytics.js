const express = require("express");
const router = express.Router();
const analyticsController = require("../controllers/analyticsController");
const { protect, authorize } = require("../middleware/auth");

// @route   GET /api/analytics
// @desc    Get dashboard analytics
// @access  Private (Traffic Controller, Admin)
router.get(
  "/",
  protect,
  authorize("traffic_controller", "admin"),
  analyticsController.getDashboardAnalytics
);

// @route   GET /api/analytics/hotspots
// @desc    Get accident hotspots
// @access  Private
router.get("/hotspots", protect, analyticsController.getAccidentHotspots);

// @route   GET /api/analytics/response-times
// @desc    Get average response times
// @access  Private (Traffic Controller, Admin)
router.get(
  "/response-times",
  protect,
  authorize("traffic_controller", "admin"),
  analyticsController.getResponseTimes
);

// @route   GET /api/analytics/emergency-stats
// @desc    Get emergency statistics
// @access  Private (Traffic Controller, Admin)
router.get(
  "/emergency-stats",
  protect,
  authorize("traffic_controller", "admin"),
  analyticsController.getEmergencyStats
);

// @route   GET /api/analytics/vehicle-utilization
// @desc    Get vehicle utilization stats
// @access  Private (Admin)
router.get(
  "/vehicle-utilization",
  protect,
  authorize("admin"),
  analyticsController.getVehicleUtilization
);

module.exports = router;
