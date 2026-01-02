const mongoose = require("mongoose");
require("dotenv").config();

const vehicleSchema = new mongoose.Schema({
  vehicle_id: String,
  type: String,
  status: String,
  current_location: {
    type: { type: String, default: "Point" },
    coordinates: [Number],
  },
  assigned_emergency: mongoose.Schema.Types.ObjectId,
  driver_info: {
    name: String,
    phone: String,
  },
});

const Vehicle = mongoose.model("Vehicle", vehicleSchema);

const sampleVehicles = [
  {
    vehicle_id: "AMB-001",
    type: "ambulance",
    status: "available",
    current_location: {
      type: "Point",
      coordinates: [77.209, 28.6139], // Delhi
    },
    driver_info: {
      name: "Rajesh Kumar",
      phone: "+91-9876543210",
    },
  },
  {
    vehicle_id: "AMB-002",
    type: "ambulance",
    status: "available",
    current_location: {
      type: "Point",
      coordinates: [77.231, 28.6304], // North Delhi
    },
    driver_info: {
      name: "Priya Sharma",
      phone: "+91-9876543211",
    },
  },
  {
    vehicle_id: "FIRE-001",
    type: "fire_truck",
    status: "available",
    current_location: {
      type: "Point",
      coordinates: [77.1925, 28.5355], // South Delhi
    },
    driver_info: {
      name: "Amit Singh",
      phone: "+91-9876543212",
    },
  },
  {
    vehicle_id: "POLICE-001",
    type: "police_van",
    status: "available",
    current_location: {
      type: "Point",
      coordinates: [77.2167, 28.6448], // Central Delhi
    },
    driver_info: {
      name: "Vikram Patel",
      phone: "+91-9876543213",
    },
  },
];

async function seedVehicles() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB");

    // Clear existing vehicles
    await Vehicle.deleteMany({});
    console.log("Cleared existing vehicles");

    // Insert sample vehicles
    const vehicles = await Vehicle.insertMany(sampleVehicles);
    console.log(`✅ Added ${vehicles.length} vehicles:`);
    vehicles.forEach((v) =>
      console.log(
        `  - ${v.vehicle_id} (${v.type}) at [${v.current_location.coordinates}]`
      )
    );

    await mongoose.disconnect();
    console.log("\n✅ Seeding completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding vehicles:", error);
    process.exit(1);
  }
}

seedVehicles();
