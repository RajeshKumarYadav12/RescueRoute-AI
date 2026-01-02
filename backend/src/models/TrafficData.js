const mongoose = require("mongoose");

const trafficDataSchema = new mongoose.Schema(
  {
    segment_id: {
      type: String,
      unique: true,
      required: true,
    },
    location: {
      type: {
        type: String,
        enum: ["LineString"],
        required: true,
        default: "LineString",
      },
      coordinates: {
        type: [[Number]], // Array of [longitude, latitude] pairs
        required: true,
        validate: {
          validator: function (coords) {
            return coords.length >= 2;
          },
          message: "LineString must have at least 2 points",
        },
      },
      start_coord: [Number],
      end_coord: [Number],
    },
    current_density: {
      type: Number,
      min: 0,
      max: 100,
      required: true,
    },
    average_speed: {
      type: Number, // in km/h
      min: 0,
    },
    weather_condition: {
      type: String,
      enum: ["clear", "rain", "fog", "snow", "storm"],
      default: "clear",
    },
    incidents: [
      {
        type: {
          type: String,
          enum: ["accident", "construction", "breakdown", "congestion"],
        },
        location: [Number],
        severity: Number,
        timestamp: Date,
      },
    ],
    predicted_density_30min: {
      type: Number,
      min: 0,
      max: 100,
    },
    historical_pattern: {
      type: Map,
      of: Number, // hour -> average density
    },
    vehicle_count: {
      type: Number,
      default: 0,
    },
    timestamp: {
      type: Date,
      default: Date.now,
      expires: 3600, // TTL index - documents expire after 1 hour
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
trafficDataSchema.index({ timestamp: -1 });
trafficDataSchema.index({ current_density: 1 });

// Method to update density
trafficDataSchema.methods.updateDensity = async function (
  newDensity,
  speed,
  vehicleCount
) {
  this.current_density = newDensity;
  this.average_speed = speed;
  this.vehicle_count = vehicleCount;
  this.timestamp = new Date();
  await this.save();
};

// Method to predict next 30 min (placeholder for ML service call)
trafficDataSchema.methods.predictNext30Min = async function () {
  // This would call the ML service for prediction
  // For now, using simple heuristic
  const hour = new Date().getHours();
  const historicalAvg =
    this.historical_pattern?.get(hour.toString()) || this.current_density;

  // Simple trend-based prediction
  this.predicted_density_30min = Math.min(
    100,
    Math.max(0, historicalAvg * 1.1) // 10% increase as default
  );
  await this.save();
};

// Static method to get segments by density range
trafficDataSchema.statics.getSegmentsByDensity = async function (
  minDensity,
  maxDensity
) {
  return this.find({
    current_density: {
      $gte: minDensity,
      $lte: maxDensity,
    },
  }).sort({ current_density: -1 });
};

module.exports = mongoose.model("TrafficData", trafficDataSchema);
