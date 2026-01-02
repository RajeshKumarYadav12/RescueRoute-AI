const { validationResult } = require("express-validator");
const Emergency = require("../models/Emergency");
const Vehicle = require("../models/Vehicle");
const logger = require("../utils/logger");
const { cacheGet, cacheSet, cacheDel } = require("../config/redis");

// @desc    Create new emergency
// @route   POST /api/emergency/create
// @access  Private
exports.createEmergency = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      });
    }

    const emergencyData = {
      ...req.body,
      reporter_info: {
        user_id: req.user._id,
        name: req.user.username,
        phone: req.user.contact_info?.phone,
      },
    };

    const emergency = await Emergency.create(emergencyData);

    // Find nearest available vehicle
    const vehicleType = getVehicleTypeForEmergency(emergency.type);
    const nearestVehicle = await Vehicle.findNearestAvailable(
      emergency.location.coordinates,
      vehicleType
    );

    if (nearestVehicle && emergency.severity >= 7) {
      await emergency.assignVehicle(nearestVehicle._id);
      nearestVehicle.status = "dispatched";
      nearestVehicle.assigned_emergency = emergency._id;
      await nearestVehicle.save();
    }

    logger.info(`Emergency created: ${emergency.emergency_id}`);

    res.status(201).json({
      success: true,
      emergency,
      assignedVehicle: nearestVehicle ? nearestVehicle.vehicle_id : null,
    });
  } catch (error) {
    logger.error(`Create emergency error: ${error.message}`);
    next(error);
  }
};

// @desc    Get all emergencies
// @route   GET /api/emergency
// @access  Private
exports.getAllEmergencies = async (req, res, next) => {
  try {
    const { status, type, page = 1, limit = 20 } = req.query;

    const query = {};
    if (status) query.status = status;
    if (type) query.type = type;

    const emergencies = await Emergency.find(query)
      .populate("assigned_vehicles", "vehicle_id type status current_location")
      .sort({ timestamp: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await Emergency.countDocuments(query);

    res.json({
      success: true,
      emergencies,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      total: count,
    });
  } catch (error) {
    logger.error(`Get emergencies error: ${error.message}`);
    next(error);
  }
};

// @desc    Get emergency by ID
// @route   GET /api/emergency/:id
// @access  Private
exports.getEmergencyById = async (req, res, next) => {
  try {
    const emergency = await Emergency.findById(req.params.id)
      .populate("assigned_vehicles", "vehicle_id type status current_location")
      .populate("reporter_info.user_id", "username email");

    if (!emergency) {
      return res.status(404).json({
        success: false,
        message: "Emergency not found",
      });
    }

    res.json({
      success: true,
      emergency,
    });
  } catch (error) {
    logger.error(`Get emergency error: ${error.message}`);
    next(error);
  }
};

// @desc    Update emergency
// @route   PUT /api/emergency/:id
// @access  Private
exports.updateEmergency = async (req, res, next) => {
  try {
    const emergency = await Emergency.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!emergency) {
      return res.status(404).json({
        success: false,
        message: "Emergency not found",
      });
    }

    logger.info(`Emergency updated: ${emergency.emergency_id}`);

    res.json({
      success: true,
      emergency,
    });
  } catch (error) {
    logger.error(`Update emergency error: ${error.message}`);
    next(error);
  }
};

// @desc    Update emergency status
// @route   PUT /api/emergency/:id/status
// @access  Private
exports.updateEmergencyStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    const emergency = await Emergency.findById(req.params.id);
    if (!emergency) {
      return res.status(404).json({
        success: false,
        message: "Emergency not found",
      });
    }

    await emergency.updateStatus(status);

    logger.info(
      `Emergency status updated: ${emergency.emergency_id} -> ${status}`
    );

    res.json({
      success: true,
      emergency,
    });
  } catch (error) {
    logger.error(`Update emergency status error: ${error.message}`);
    next(error);
  }
};

// @desc    Assign vehicle to emergency
// @route   POST /api/emergency/:id/assign-vehicle
// @access  Private
exports.assignVehicle = async (req, res, next) => {
  try {
    const { vehicleId } = req.body;

    const emergency = await Emergency.findById(req.params.id);
    if (!emergency) {
      return res.status(404).json({
        success: false,
        message: "Emergency not found",
      });
    }

    const vehicle = await Vehicle.findById(vehicleId);
    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: "Vehicle not found",
      });
    }

    await emergency.assignVehicle(vehicleId);
    await vehicle.assignToEmergency(emergency._id);

    logger.info(
      `Vehicle ${vehicle.vehicle_id} assigned to emergency ${emergency.emergency_id}`
    );

    res.json({
      success: true,
      emergency,
    });
  } catch (error) {
    logger.error(`Assign vehicle error: ${error.message}`);
    next(error);
  }
};

// @desc    Get nearby emergencies
// @route   GET /api/emergency/nearby/:longitude/:latitude/:radius
// @access  Private
exports.getNearbyEmergencies = async (req, res, next) => {
  try {
    const { longitude, latitude, radius } = req.params;

    const emergencies = await Emergency.find({
      location: {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [parseFloat(longitude), parseFloat(latitude)],
          },
          $maxDistance: parseInt(radius) * 1000, // Convert km to meters
        },
      },
      status: { $ne: "resolved" },
    }).limit(10);

    res.json({
      success: true,
      count: emergencies.length,
      emergencies,
    });
  } catch (error) {
    logger.error(`Get nearby emergencies error: ${error.message}`);
    next(error);
  }
};

// Helper function
function getVehicleTypeForEmergency(emergencyType) {
  const mapping = {
    accident: "ambulance",
    medical: "ambulance",
    fire: "fire_truck",
    police: "police_van",
  };
  return mapping[emergencyType] || "ambulance";
}
