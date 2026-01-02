const { validationResult } = require("express-validator");
const Vehicle = require("../models/Vehicle");
const logger = require("../utils/logger");

// @desc    Get all vehicles
// @route   GET /api/vehicle
// @access  Private
exports.getAllVehicles = async (req, res, next) => {
  try {
    const { type, status } = req.query;

    const query = {};
    if (type) query.type = type;
    if (status) query.status = status;

    const vehicles = await Vehicle.find(query).populate(
      "assigned_emergency",
      "emergency_id type severity location"
    );

    res.json({
      success: true,
      count: vehicles.length,
      vehicles,
    });
  } catch (error) {
    logger.error(`Get vehicles error: ${error.message}`);
    next(error);
  }
};

// @desc    Get vehicle by ID
// @route   GET /api/vehicle/:id
// @access  Private
exports.getVehicleById = async (req, res, next) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id).populate(
      "assigned_emergency",
      "emergency_id type severity location status"
    );

    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: "Vehicle not found",
      });
    }

    res.json({
      success: true,
      vehicle,
    });
  } catch (error) {
    logger.error(`Get vehicle error: ${error.message}`);
    next(error);
  }
};

// @desc    Update vehicle location
// @route   PUT /api/vehicle/:id/location
// @access  Private
exports.updateVehicleLocation = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      });
    }

    const { coordinates } = req.body;

    const vehicle = await Vehicle.findById(req.params.id);
    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: "Vehicle not found",
      });
    }

    await vehicle.updateLocation(coordinates);

    res.json({
      success: true,
      vehicle,
    });
  } catch (error) {
    logger.error(`Update vehicle location error: ${error.message}`);
    next(error);
  }
};

// @desc    Update vehicle status
// @route   PUT /api/vehicle/:id/status
// @access  Private
exports.updateVehicleStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    const vehicle = await Vehicle.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );

    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: "Vehicle not found",
      });
    }

    logger.info(`Vehicle ${vehicle.vehicle_id} status updated to ${status}`);

    res.json({
      success: true,
      vehicle,
    });
  } catch (error) {
    logger.error(`Update vehicle status error: ${error.message}`);
    next(error);
  }
};

// @desc    Get available vehicles by type
// @route   GET /api/vehicle/available/:type
// @access  Private
exports.getAvailableVehicles = async (req, res, next) => {
  try {
    const { type } = req.params;

    const vehicles = await Vehicle.find({
      type,
      status: "available",
    });

    res.json({
      success: true,
      count: vehicles.length,
      vehicles,
    });
  } catch (error) {
    logger.error(`Get available vehicles error: ${error.message}`);
    next(error);
  }
};

// @desc    Find nearest available vehicle
// @route   GET /api/vehicle/nearest/:type/:longitude/:latitude
// @access  Private
exports.findNearestVehicle = async (req, res, next) => {
  try {
    const { type, longitude, latitude } = req.params;

    const vehicle = await Vehicle.findNearestAvailable(
      [parseFloat(longitude), parseFloat(latitude)],
      type
    );

    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: "No available vehicle found",
      });
    }

    res.json({
      success: true,
      vehicle,
    });
  } catch (error) {
    logger.error(`Find nearest vehicle error: ${error.message}`);
    next(error);
  }
};
