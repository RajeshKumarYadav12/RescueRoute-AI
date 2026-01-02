const mongoose = require("mongoose");
const { SIGNAL_STATES } = require("../config/constants");

const signalSchema = new mongoose.Schema(
  {
    signal_id: {
      type: String,
      unique: true,
      required: true,
    },
    location: {
      type: {
        type: String,
        enum: ["Point"],
        required: true,
        default: "Point",
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: true,
      },
    },
    current_state: {
      type: String,
      enum: Object.values(SIGNAL_STATES),
      default: SIGNAL_STATES.RED,
    },
    normal_cycle_timing: {
      north_south: {
        type: Number,
        default: 60, // seconds
      },
      east_west: {
        type: Number,
        default: 60,
      },
      cycle_duration: {
        type: Number,
        default: 120,
      },
    },
    override_active: {
      type: Boolean,
      default: false,
    },
    priority_queue: [
      {
        vehicle_id: String,
        priority_score: Number,
        eta: Number, // seconds
        timestamp: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    connected_roads: [String], // segment_ids
    camera_feed_url: String,
    last_override_time: Date,
    traffic_density: {
      north: { type: Number, default: 0 },
      south: { type: Number, default: 0 },
      east: { type: Number, default: 0 },
      west: { type: Number, default: 0 },
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
signalSchema.index({ location: "2dsphere" });
signalSchema.index({ override_active: 1 });

// Method to request priority
signalSchema.methods.requestPriority = async function (
  vehicleId,
  priorityScore,
  eta
) {
  // Check if vehicle already in queue
  const existingIndex = this.priority_queue.findIndex(
    (item) => item.vehicle_id === vehicleId
  );

  if (existingIndex !== -1) {
    // Update existing entry
    this.priority_queue[existingIndex].priority_score = priorityScore;
    this.priority_queue[existingIndex].eta = eta;
    this.priority_queue[existingIndex].timestamp = new Date();
  } else {
    // Add new entry
    this.priority_queue.push({
      vehicle_id: vehicleId,
      priority_score: priorityScore,
      eta: eta,
    });
  }

  // Sort by priority score (descending)
  this.priority_queue.sort((a, b) => b.priority_score - a.priority_score);

  // Activate override if highest priority
  if (this.priority_queue[0].vehicle_id === vehicleId) {
    this.override_active = true;
    this.last_override_time = new Date();
    this.current_state = SIGNAL_STATES.GREEN;
  }

  await this.save();
};

// Method to clear priority
signalSchema.methods.clearPriority = async function (vehicleId) {
  this.priority_queue = this.priority_queue.filter(
    (item) => item.vehicle_id !== vehicleId
  );

  // If queue is empty, return to normal operation
  if (this.priority_queue.length === 0) {
    this.override_active = false;
    this.current_state = SIGNAL_STATES.RED;
  } else {
    // Activate next vehicle in queue
    this.override_active = true;
    this.current_state = SIGNAL_STATES.GREEN;
  }

  await this.save();
};

// Method to optimize timing (placeholder for ML service)
signalSchema.methods.optimizeTiming = async function () {
  // This would call the ML service for optimization
  // For now, using simple density-based logic
  const totalDensity =
    this.traffic_density.north +
    this.traffic_density.south +
    this.traffic_density.east +
    this.traffic_density.west;

  if (totalDensity === 0) return;

  const nsPercent =
    (this.traffic_density.north + this.traffic_density.south) / totalDensity;
  const ewPercent =
    (this.traffic_density.east + this.traffic_density.west) / totalDensity;

  // Allocate time proportionally
  const totalCycle = this.normal_cycle_timing.cycle_duration;
  this.normal_cycle_timing.north_south = Math.floor(totalCycle * nsPercent);
  this.normal_cycle_timing.east_west = Math.floor(totalCycle * ewPercent);

  await this.save();
};

// Static method to find nearby signals
signalSchema.statics.findNearbySignals = async function (
  location,
  radius = 5000
) {
  return this.find({
    location: {
      $near: {
        $geometry: {
          type: "Point",
          coordinates: location,
        },
        $maxDistance: radius, // in meters
      },
    },
  });
};

module.exports = mongoose.model("Signal", signalSchema);
