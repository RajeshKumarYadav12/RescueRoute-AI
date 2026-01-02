const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const vehicleController = require("../controllers/vehicleController");
const { protect, authorize } = require("../middleware/auth");

// @route   GET /api/vehicle
// @desc    Get all vehicles
// @access  Private
router.get("/", protect, vehicleController.getAllVehicles);

// @route   GET /api/vehicle/:id
// @desc    Get vehicle by ID
// @access  Private
router.get("/:id", protect, vehicleController.getVehicleById);

// @route   PUT /api/vehicle/:id/location
// @desc    Update vehicle location
// @access  Private (Emergency Driver)
router.put(
  "/:id/location",
  protect,
  authorize("emergency_driver", "admin"),
  [
    body("coordinates")
      .isArray({ min: 2, max: 2 })
      .withMessage("Valid coordinates required"),
  ],
  vehicleController.updateVehicleLocation
);

// @route   PUT /api/vehicle/:id/status
// @desc    Update vehicle status
// @access  Private (Emergency Driver, Admin)
router.put(
  "/:id/status",
  protect,
  authorize("emergency_driver", "admin"),
  vehicleController.updateVehicleStatus
);

// @route   GET /api/vehicle/available/:type
// @desc    Get available vehicles by type
// @access  Private
router.get("/available/:type", protect, vehicleController.getAvailableVehicles);

// @route   GET /api/vehicle/nearest/:type/:longitude/:latitude
// @desc    Find nearest available vehicle
// @access  Private
router.get(
  "/nearest/:type/:longitude/:latitude",
  protect,
  vehicleController.findNearestVehicle
);

module.exports = router;
