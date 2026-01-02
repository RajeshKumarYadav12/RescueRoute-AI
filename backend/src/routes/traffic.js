const express = require("express");
const router = express.Router();
const trafficController = require("../controllers/trafficController");
const { protect, authorize } = require("../middleware/auth");

// @route   GET /api/traffic
// @desc    Get all traffic data
// @access  Private
router.get("/", protect, trafficController.getAllTrafficData);

// @route   GET /api/traffic/segment/:segmentId
// @desc    Get traffic data by segment ID
// @access  Private
router.get(
  "/segment/:segmentId",
  protect,
  trafficController.getTrafficBySegment
);

// @route   POST /api/traffic/update
// @desc    Update traffic data
// @access  Private (Traffic Controller, Admin)
router.post(
  "/update",
  protect,
  authorize("traffic_controller", "admin"),
  trafficController.updateTrafficData
);

// @route   GET /api/traffic/predict/:segmentId
// @desc    Get predicted traffic for segment
// @access  Private
router.get("/predict/:segmentId", protect, trafficController.predictTraffic);

// @route   GET /api/traffic/high-density
// @desc    Get high-density traffic segments
// @access  Private
router.get("/high-density", protect, trafficController.getHighDensitySegments);

module.exports = router;
