const mongoose = require("mongoose");

const accidentHistoricalSchema = new mongoose.Schema(
  {
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
      address: String,
    },
    timestamp: {
      type: Date,
      required: true,
    },
    severity: {
      type: String,
      enum: ["minor", "moderate", "major", "critical"],
      required: true,
    },
    type: {
      type: String,
      enum: ["vehicle_collision", "pedestrian", "motorcycle", "truck", "other"],
    },
    casualties: {
      injured: { type: Number, default: 0 },
      fatal: { type: Number, default: 0 },
    },
    weather_condition: {
      type: String,
      enum: ["clear", "rain", "fog", "snow", "storm"],
    },
    road_condition: {
      type: String,
      enum: ["good", "poor", "under_construction", "damaged"],
    },
    time_of_day: {
      hour: Number,
      period: {
        type: String,
        enum: ["morning", "afternoon", "evening", "night"],
      },
    },
    day_of_week: {
      type: Number,
      min: 0,
      max: 6, // 0 = Sunday, 6 = Saturday
    },
    contributing_factors: [String],
    cluster_id: String, // Assigned by clustering algorithm
  },
  {
    timestamps: true,
  }
);

// Indexes
accidentHistoricalSchema.index({ location: "2dsphere" });
accidentHistoricalSchema.index({ timestamp: -1 });
accidentHistoricalSchema.index({ cluster_id: 1 });
accidentHistoricalSchema.index({ severity: 1 });

module.exports = mongoose.model("AccidentHistorical", accidentHistoricalSchema);
