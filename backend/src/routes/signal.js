const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const signalController = require("../controllers/signalController");
const { protect, authorize } = require("../middleware/auth");

// @route   GET /api/signal
// @desc    Get all signals
// @access  Private
router.get("/", protect, signalController.getAllSignals);

// @route   GET /api/signal/:id
// @desc    Get signal by ID
// @access  Private
router.get("/:id", protect, signalController.getSignalById);

// @route   POST /api/signal/priority
// @desc    Request signal priority for emergency vehicle
// @access  Private (Emergency Driver, Admin)
router.post(
  "/priority",
  protect,
  authorize("emergency_driver", "admin"),
  [
    body("vehicleId").notEmpty().withMessage("Vehicle ID is required"),
    body("signalId").notEmpty().withMessage("Signal ID is required"),
    body("priorityScore").isNumeric().withMessage("Priority score is required"),
  ],
  signalController.requestPriority
);

// @route   POST /api/signal/priority/clear
// @desc    Clear signal priority
// @access  Private (Emergency Driver, Admin)
router.post(
  "/priority/clear",
  protect,
  authorize("emergency_driver", "admin"),
  signalController.clearPriority
);

// @route   GET /api/signal/nearby/:longitude/:latitude/:radius
// @desc    Get nearby signals
// @access  Private
router.get(
  "/nearby/:longitude/:latitude/:radius",
  protect,
  signalController.getNearbySignals
);

// @route   PUT /api/signal/:id/optimize
// @desc    Optimize signal timing
// @access  Private (Traffic Controller, Admin)
router.put(
  "/:id/optimize",
  protect,
  authorize("traffic_controller", "admin"),
  signalController.optimizeSignalTiming
);

module.exports = router;
