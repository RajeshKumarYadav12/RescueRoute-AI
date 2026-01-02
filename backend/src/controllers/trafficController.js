const TrafficData = require("../models/TrafficData");
const logger = require("../utils/logger");
const { cacheGet, cacheSet } = require("../config/redis");

// @desc    Get all traffic data
// @route   GET /api/traffic
// @access  Private
exports.getAllTrafficData = async (req, res, next) => {
  try {
    const { minDensity, maxDensity } = req.query;

    let trafficData;

    if (minDensity && maxDensity) {
      trafficData = await TrafficData.getSegmentsByDensity(
        parseInt(minDensity),
        parseInt(maxDensity)
      );
    } else {
      trafficData = await TrafficData.find().sort({ timestamp: -1 }).limit(100);
    }

    res.json({
      success: true,
      count: trafficData.length,
      trafficData,
    });
  } catch (error) {
    logger.error(`Get traffic data error: ${error.message}`);
    next(error);
  }
};

// @desc    Get traffic data by segment
// @route   GET /api/traffic/segment/:segmentId
// @access  Private
exports.getTrafficBySegment = async (req, res, next) => {
  try {
    const { segmentId } = req.params;

    // Try cache first
    const cacheKey = `traffic:segment:${segmentId}`;
    const cached = await cacheGet(cacheKey);

    if (cached) {
      return res.json({
        success: true,
        trafficData: cached,
        cached: true,
      });
    }

    const trafficData = await TrafficData.findOne({ segment_id: segmentId });

    if (!trafficData) {
      return res.status(404).json({
        success: false,
        message: "Traffic segment not found",
      });
    }

    // Cache for 5 minutes
    await cacheSet(cacheKey, trafficData, 300);

    res.json({
      success: true,
      trafficData,
      cached: false,
    });
  } catch (error) {
    logger.error(`Get traffic by segment error: ${error.message}`);
    next(error);
  }
};

// @desc    Update traffic data
// @route   POST /api/traffic/update
// @access  Private
exports.updateTrafficData = async (req, res, next) => {
  try {
    const { segment_id, current_density, average_speed, vehicle_count } =
      req.body;

    let trafficData = await TrafficData.findOne({ segment_id });

    if (trafficData) {
      await trafficData.updateDensity(
        current_density,
        average_speed,
        vehicle_count
      );
    } else {
      trafficData = await TrafficData.create(req.body);
    }

    logger.info(`Traffic data updated for segment ${segment_id}`);

    res.json({
      success: true,
      trafficData,
    });
  } catch (error) {
    logger.error(`Update traffic data error: ${error.message}`);
    next(error);
  }
};

// @desc    Get predicted traffic
// @route   GET /api/traffic/predict/:segmentId
// @access  Private
exports.predictTraffic = async (req, res, next) => {
  try {
    const { segmentId } = req.params;

    const trafficData = await TrafficData.findOne({ segment_id: segmentId });

    if (!trafficData) {
      return res.status(404).json({
        success: false,
        message: "Traffic segment not found",
      });
    }

    await trafficData.predictNext30Min();

    res.json({
      success: true,
      prediction: {
        segment_id: trafficData.segment_id,
        current_density: trafficData.current_density,
        predicted_density_30min: trafficData.predicted_density_30min,
        confidence: 0.85,
      },
    });
  } catch (error) {
    logger.error(`Predict traffic error: ${error.message}`);
    next(error);
  }
};

// @desc    Get high-density traffic segments
// @route   GET /api/traffic/high-density
// @access  Private
exports.getHighDensitySegments = async (req, res, next) => {
  try {
    const highDensitySegments = await TrafficData.getSegmentsByDensity(70, 100);

    res.json({
      success: true,
      count: highDensitySegments.length,
      segments: highDensitySegments,
    });
  } catch (error) {
    logger.error(`Get high-density segments error: ${error.message}`);
    next(error);
  }
};
