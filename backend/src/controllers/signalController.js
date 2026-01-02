const { validationResult } = require("express-validator");
const Signal = require("../models/Signal");
const logger = require("../utils/logger");

// @desc    Get all signals
// @route   GET /api/signal
// @access  Private
exports.getAllSignals = async (req, res, next) => {
  try {
    const signals = await Signal.find();

    res.json({
      success: true,
      count: signals.length,
      signals,
    });
  } catch (error) {
    logger.error(`Get signals error: ${error.message}`);
    next(error);
  }
};

// @desc    Get signal by ID
// @route   GET /api/signal/:id
// @access  Private
exports.getSignalById = async (req, res, next) => {
  try {
    const signal = await Signal.findById(req.params.id);

    if (!signal) {
      return res.status(404).json({
        success: false,
        message: "Signal not found",
      });
    }

    res.json({
      success: true,
      signal,
    });
  } catch (error) {
    logger.error(`Get signal error: ${error.message}`);
    next(error);
  }
};

// @desc    Request signal priority
// @route   POST /api/signal/priority
// @access  Private
exports.requestPriority = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      });
    }

    const { vehicleId, signalId, priorityScore, eta } = req.body;

    const signal = await Signal.findOne({ signal_id: signalId });

    if (!signal) {
      return res.status(404).json({
        success: false,
        message: "Signal not found",
      });
    }

    await signal.requestPriority(vehicleId, priorityScore, eta || 60);

    logger.info(
      `Priority requested: Vehicle ${vehicleId} at signal ${signalId}`
    );

    res.json({
      success: true,
      signal,
      message: "Priority request processed",
    });
  } catch (error) {
    logger.error(`Request priority error: ${error.message}`);
    next(error);
  }
};

// @desc    Clear signal priority
// @route   POST /api/signal/priority/clear
// @access  Private
exports.clearPriority = async (req, res, next) => {
  try {
    const { vehicleId, signalId } = req.body;

    const signal = await Signal.findOne({ signal_id: signalId });

    if (!signal) {
      return res.status(404).json({
        success: false,
        message: "Signal not found",
      });
    }

    await signal.clearPriority(vehicleId);

    logger.info(`Priority cleared: Vehicle ${vehicleId} at signal ${signalId}`);

    res.json({
      success: true,
      signal,
      message: "Priority cleared",
    });
  } catch (error) {
    logger.error(`Clear priority error: ${error.message}`);
    next(error);
  }
};

// @desc    Get nearby signals
// @route   GET /api/signal/nearby/:longitude/:latitude/:radius
// @access  Private
exports.getNearbySignals = async (req, res, next) => {
  try {
    const { longitude, latitude, radius } = req.params;

    const signals = await Signal.findNearbySignals(
      [parseFloat(longitude), parseFloat(latitude)],
      parseInt(radius)
    );

    res.json({
      success: true,
      count: signals.length,
      signals,
    });
  } catch (error) {
    logger.error(`Get nearby signals error: ${error.message}`);
    next(error);
  }
};

// @desc    Optimize signal timing
// @route   PUT /api/signal/:id/optimize
// @access  Private
exports.optimizeSignalTiming = async (req, res, next) => {
  try {
    const signal = await Signal.findById(req.params.id);

    if (!signal) {
      return res.status(404).json({
        success: false,
        message: "Signal not found",
      });
    }

    await signal.optimizeTiming();

    logger.info(`Signal timing optimized: ${signal.signal_id}`);

    res.json({
      success: true,
      signal,
      message: "Signal timing optimized",
    });
  } catch (error) {
    logger.error(`Optimize signal timing error: ${error.message}`);
    next(error);
  }
};
