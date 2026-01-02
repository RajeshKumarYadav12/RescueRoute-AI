const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const emergencyController = require("../controllers/emergencyController");
const { protect, authorize } = require("../middleware/auth");

// @route   POST /api/emergency/create
// @desc    Create new emergency
// @access  Private
router.post(
  "/create",
  protect,
  [
    body("type")
      .isIn(["accident", "fire", "medical", "police"])
      .withMessage("Invalid emergency type"),
    body("location.coordinates")
      .isArray({ min: 2, max: 2 })
      .withMessage("Valid coordinates required"),
    body("severity")
      .isInt({ min: 1, max: 10 })
      .withMessage("Severity must be between 1-10"),
    body("description.en").notEmpty().withMessage("Description is required"),
  ],
  emergencyController.createEmergency
);

// @route   GET /api/emergency
// @desc    Get all emergencies
// @access  Private
router.get("/", protect, emergencyController.getAllEmergencies);

// @route   GET /api/emergency/:id
// @desc    Get emergency by ID
// @access  Private
router.get("/:id", protect, emergencyController.getEmergencyById);

// @route   PUT /api/emergency/:id
// @desc    Update emergency
// @access  Private
router.put("/:id", protect, emergencyController.updateEmergency);

// @route   PUT /api/emergency/:id/status
// @desc    Update emergency status
// @access  Private (Emergency Driver, Traffic Controller, Admin)
router.put(
  "/:id/status",
  protect,
  authorize("emergency_driver", "traffic_controller", "admin"),
  emergencyController.updateEmergencyStatus
);

// @route   POST /api/emergency/:id/assign-vehicle
// @desc    Assign vehicle to emergency
// @access  Private (Traffic Controller, Admin)
router.post(
  "/:id/assign-vehicle",
  protect,
  authorize("traffic_controller", "admin"),
  emergencyController.assignVehicle
);

// @route   GET /api/emergency/nearby
// @desc    Get nearby emergencies
// @access  Private
router.get(
  "/nearby/:longitude/:latitude/:radius",
  protect,
  emergencyController.getNearbyEmergencies
);

module.exports = router;
