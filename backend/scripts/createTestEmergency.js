const mongoose = require("mongoose");
require("dotenv").config();

const emergencySchema = new mongoose.Schema({
  emergency_id: String,
  type: String,
  location: {
    type: { type: String, default: "Point" },
    coordinates: [Number],
    address: String,
  },
  severity: Number,
  status: String,
  assigned_vehicles: [mongoose.Schema.Types.ObjectId],
  description: {
    en: String,
    hi: String,
  },
  timestamp: { type: Date, default: Date.now },
});

const vehicleSchema = new mongoose.Schema({
  vehicle_id: String,
  type: String,
  status: String,
  current_location: {
    type: { type: String, default: "Point" },
    coordinates: [Number],
  },
  assigned_emergency: mongoose.Schema.Types.ObjectId,
});

const Emergency = mongoose.model("Emergency", emergencySchema);
const Vehicle = mongoose.model("Vehicle", vehicleSchema);

async function createTestEmergency() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB");

    // Find an available ambulance
    const ambulance = await Vehicle.findOne({
      type: "ambulance",
      status: "available",
    });

    if (!ambulance) {
      console.log(
        "❌ No available ambulance found. Please run seedVehicles.js first."
      );
      process.exit(1);
    }

    // Create emergency
    const emergency = await Emergency.create({
      emergency_id: `EMG-${Date.now()}`,
      type: "medical",
      location: {
        type: "Point",
        coordinates: [77.22, 28.625], // Near Connaught Place, Delhi
        address: "Connaught Place, New Delhi",
      },
      severity: 9,
      status: "dispatched",
      description: {
        en: "Heart attack patient needs immediate ambulance",
        hi: "हृदय रोग के मरीज को तत्काल एम्बुलेंस की आवश्यकता है",
      },
    });

    // Assign vehicle to emergency
    ambulance.status = "dispatched";
    ambulance.assigned_emergency = emergency._id;
    await ambulance.save();

    // Update emergency with assigned vehicle
    emergency.assigned_vehicles = [ambulance._id];
    await emergency.save();

    console.log("✅ Test emergency created successfully!");
    console.log(`  Emergency ID: ${emergency.emergency_id}`);
    console.log(`  Type: ${emergency.type}`);
    console.log(`  Severity: ${emergency.severity}/10`);
    console.log(`  Location: ${emergency.location.address}`);
    console.log(`  Assigned Vehicle: ${ambulance.vehicle_id}`);
    console.log(
      `\n🚨 Now check the Vehicle Tracking page to see ${ambulance.vehicle_id} dispatched!`
    );

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error("❌ Error creating test emergency:", error);
    process.exit(1);
  }
}

createTestEmergency();
