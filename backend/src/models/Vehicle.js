const mongoose = require("mongoose");
const { VEHICLE_TYPES, VEHICLE_STATUS } = require("../config/constants");

const vehicleSchema = new mongoose.Schema(
  {
    vehicle_id: {
      type: String,
      unique: true,
      required: true,
    },
    type: {
      type: String,
      enum: Object.values(VEHICLE_TYPES),
      required: true,
    },
    current_location: {
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
    status: {
      type: String,
      enum: Object.values(VEHICLE_STATUS),
      default: VEHICLE_STATUS.AVAILABLE,
    },
    base_station: {
      name: String,
      coordinates: [Number], // [longitude, latitude]
    },
    equipment_list: [String],
    crew_size: {
      type: Number,
      min: 1,
    },
    live_route: {
      type: [[Number]], // Array of [longitude, latitude] pairs
      default: [],
    },
    signal_priority_active: {
      type: Boolean,
      default: false,
    },
    assigned_emergency: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Emergency",
      default: null,
    },
    last_updated: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
vehicleSchema.index({ current_location: "2dsphere" });
vehicleSchema.index({ status: 1 });
vehicleSchema.index({ type: 1, status: 1 });

// Method to update location
vehicleSchema.methods.updateLocation = async function (coordinates) {
  this.current_location.coordinates = coordinates;
  this.last_updated = new Date();
  await this.save();
};

// Method to assign to emergency
vehicleSchema.methods.assignToEmergency = async function (emergencyId) {
  this.assigned_emergency = emergencyId;
  this.status = VEHICLE_STATUS.DISPATCHED;
  await this.save();
};

// Method to calculate ETA (placeholder - actual calculation in service)
vehicleSchema.methods.calculateETA = function (destinationCoords, trafficData) {
  // This would call the route service for actual ETA calculation
  // For now, returning a placeholder
  const distance = this.calculateDistance(
    this.current_location.coordinates,
    destinationCoords
  );
  // Rough estimate: 30 km/h average speed with traffic
  return Math.ceil((distance / 30) * 3600); // in seconds
};

// Helper method to calculate distance (Haversine formula)
vehicleSchema.methods.calculateDistance = function (coords1, coords2) {
  const R = 6371; // Earth's radius in km
  const lat1 = (coords1[1] * Math.PI) / 180;
  const lat2 = (coords2[1] * Math.PI) / 180;
  const deltaLat = ((coords2[1] - coords1[1]) * Math.PI) / 180;
  const deltaLon = ((coords2[0] - coords1[0]) * Math.PI) / 180;

  const a =
    Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
    Math.cos(lat1) *
      Math.cos(lat2) *
      Math.sin(deltaLon / 2) *
      Math.sin(deltaLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distance in km
};

// Static method to find nearest available vehicle
vehicleSchema.statics.findNearestAvailable = async function (
  location,
  vehicleType
) {
  return this.findOne({
    type: vehicleType,
    status: VEHICLE_STATUS.AVAILABLE,
    current_location: {
      $near: {
        $geometry: {
          type: "Point",
          coordinates: location,
        },
        $maxDistance: 50000, // 50 km radius
      },
    },
  });
};

module.exports = mongoose.model("Vehicle", vehicleSchema);
