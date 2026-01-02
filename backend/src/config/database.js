const mongoose = require("mongoose");
const logger = require("../utils/logger");

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);

    logger.info(`MongoDB Connected: ${conn.connection.host}`);

    // Create indexes for geospatial queries
    await createGeoIndexes();
  } catch (error) {
    logger.error(`MongoDB Connection Error: ${error.message}`);
    process.exit(1);
  }
};

const createGeoIndexes = async () => {
  try {
    const Emergency = mongoose.model("Emergency");
    const Vehicle = mongoose.model("Vehicle");
    const Signal = mongoose.model("Signal");

    await Emergency.collection.createIndex({ location: "2dsphere" });
    await Vehicle.collection.createIndex({ current_location: "2dsphere" });
    await Signal.collection.createIndex({ location: "2dsphere" });

    logger.info("Geospatial indexes created successfully");
  } catch (error) {
    logger.warn("Geospatial indexes may not be created yet");
  }
};

module.exports = connectDB;
