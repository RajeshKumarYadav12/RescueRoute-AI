const mongoose = require("mongoose");
const { EMERGENCY_TYPES, EMERGENCY_STATUS } = require("../config/constants");

const emergencySchema = new mongoose.Schema(
  {
    emergency_id: {
      type: String,
      unique: true,
      required: true,
      default: () =>
        `EMG-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    },
    type: {
      type: String,
      enum: Object.values(EMERGENCY_TYPES),
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
        validate: {
          validator: function (coords) {
            return (
              coords.length === 2 &&
              coords[1] >= -90 &&
              coords[1] <= 90 &&
              coords[0] >= -180 &&
              coords[0] <= 180
            );
          },
          message: "Invalid coordinates",
        },
      },
      address: {
        type: String,
        required: false,
      },
    },
    severity: {
      type: Number,
      min: 1,
      max: 10,
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(EMERGENCY_STATUS),
      default: EMERGENCY_STATUS.REPORTED,
    },
    assigned_vehicles: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Vehicle",
      },
    ],
    reporter_info: {
      user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      name: String,
      phone: String,
    },
    description: {
      en: {
        type: String,
        required: true,
      },
      hi: {
        type: String,
        required: false,
      },
    },
    media_urls: [String],
    estimated_casualties: {
      type: Number,
      default: 0,
      min: 0,
    },
    verification_status: {
      type: Boolean,
      default: false,
    },
    response_time: {
      type: Number, // in seconds
    },
    resolved_at: Date,
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
emergencySchema.index({ location: "2dsphere" });
emergencySchema.index({ status: 1, timestamp: -1 });
emergencySchema.index({ type: 1 });

// Virtual for isActive
emergencySchema.virtual("isActive").get(function () {
  return this.status !== EMERGENCY_STATUS.RESOLVED;
});

// Virtual for priorityScore
emergencySchema.virtual("priorityScore").get(function () {
  const timestamp = this.timestamp || new Date();
  const timeElapsed = (Date.now() - timestamp.getTime()) / 1000 / 60; // in minutes
  const urgencyScore = this.severity * 10;
  const timeScore = Math.min(timeElapsed * 2, 50);
  return urgencyScore + timeScore;
});

// Method to assign a vehicle
emergencySchema.methods.assignVehicle = async function (vehicleId) {
  if (!this.assigned_vehicles.includes(vehicleId)) {
    this.assigned_vehicles.push(vehicleId);
    this.status = EMERGENCY_STATUS.DISPATCHED;
    await this.save();
  }
};

// Method to update status
emergencySchema.methods.updateStatus = async function (newStatus) {
  this.status = newStatus;
  if (newStatus === EMERGENCY_STATUS.RESOLVED) {
    this.resolved_at = new Date();
    this.calculateResponseTime();
  }
  await this.save();
};

// Method to calculate response time
emergencySchema.methods.calculateResponseTime = function () {
  if (this.resolved_at) {
    this.response_time = Math.floor((this.resolved_at - this.timestamp) / 1000);
  }
};

// Ensure virtuals are included in JSON
emergencySchema.set("toJSON", { virtuals: true });
emergencySchema.set("toObject", { virtuals: true });

module.exports = mongoose.model("Emergency", emergencySchema);
