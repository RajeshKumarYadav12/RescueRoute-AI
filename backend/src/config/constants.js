module.exports = {
  // Emergency Types
  EMERGENCY_TYPES: {
    ACCIDENT: "accident",
    FIRE: "fire",
    MEDICAL: "medical",
    POLICE: "police",
  },

  // Emergency Statuses
  EMERGENCY_STATUS: {
    REPORTED: "reported",
    DISPATCHED: "dispatched",
    ONGOING: "ongoing",
    RESOLVED: "resolved",
  },

  // Vehicle Types
  VEHICLE_TYPES: {
    AMBULANCE: "ambulance",
    FIRE_TRUCK: "fire_truck",
    POLICE_VAN: "police_van",
  },

  // Vehicle Statuses
  VEHICLE_STATUS: {
    AVAILABLE: "available",
    DISPATCHED: "dispatched",
    ON_SCENE: "on_scene",
    RETURNING: "returning",
  },

  // Traffic Signal States
  SIGNAL_STATES: {
    RED: "red",
    YELLOW: "yellow",
    GREEN: "green",
  },

  // User Roles
  USER_ROLES: {
    CITIZEN: "citizen",
    EMERGENCY_DRIVER: "emergency_driver",
    TRAFFIC_CONTROLLER: "traffic_controller",
    ADMIN: "admin",
  },

  // Severity Weights (for priority calculation)
  URGENCY_WEIGHTS: {
    CARDIAC_ARREST: 100,
    MAJOR_ACCIDENT: 85,
    FIRE: 80,
    POLICE_CHASE: 70,
    MINOR_INJURY: 60,
  },

  // Priority Score Weights
  PRIORITY_WEIGHTS: {
    URGENCY: 0.4,
    TIME_ELAPSED: 0.3,
    TRAFFIC_DENSITY: 0.2,
    DISTANCE: 0.1,
  },

  // Cache TTLs (in seconds)
  CACHE_TTL: {
    ML_PREDICTION: 1800, // 30 minutes
    TRAFFIC_DATA: 300, // 5 minutes
    ROUTE_CALCULATION: 600, // 10 minutes
    ANALYTICS: 60, // 1 minute
  },

  // Socket.io Namespaces
  SOCKET_NAMESPACES: {
    EMERGENCY: "/emergency",
    VEHICLE: "/vehicle",
    TRAFFIC: "/traffic",
    SIGNAL: "/signal",
    CHAT: "/chat",
    ANALYTICS: "/analytics",
  },

  // Rate Limiting
  RATE_LIMIT: {
    WINDOW_MS: 15 * 60 * 1000, // 15 minutes
    MAX_REQUESTS: 100,
  },

  // Geospatial Constants
  EARTH_RADIUS_KM: 6371,
  MAX_SEARCH_RADIUS_KM: 50,

  // Traffic Density Thresholds
  TRAFFIC_DENSITY: {
    LOW: 30,
    MEDIUM: 60,
    HIGH: 80,
  },
};
