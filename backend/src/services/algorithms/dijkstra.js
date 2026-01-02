const PriorityQueue = require("./priorityQueue");
const { TRAFFIC_DENSITY } = require("../../config/constants");

/**
 * Modified Dijkstra's algorithm for emergency route optimization
 * Considers: traffic density, signal timing, weather, road conditions
 */
class DijkstraRouter {
  constructor(graph, trafficData, signals, weather = "clear") {
    this.graph = graph; // { nodeId: { neighbors: [{ nodeId, segmentId, baseDistance }] } }
    this.trafficData = trafficData; // Map of segmentId -> traffic data
    this.signals = signals; // Map of nodeId -> signal data
    this.weather = weather;
  }

  /**
   * Calculate optimal route from start to end
   * @param {Array} startCoords - [lon, lat]
   * @param {Array} endCoords - [lon, lat]
   * @param {String} vehicleType - Type of emergency vehicle
   * @returns {Object} Route with path, distance, time, signals
   */
  calculateRoute(startCoords, endCoords, vehicleType = "ambulance") {
    const startNode = this.findNearestNode(startCoords);
    const endNode = this.findNearestNode(endCoords);

    if (!startNode || !endNode) {
      throw new Error("Cannot find route nodes");
    }

    // Initialize distances and visited set
    const distances = new Map();
    const previous = new Map();
    const pq = new PriorityQueue((a, b) => a.priority < b.priority);
    const visited = new Set();

    // Initialize all nodes with infinity distance
    Object.keys(this.graph).forEach((nodeId) => {
      distances.set(nodeId, Infinity);
    });
    distances.set(startNode, 0);

    pq.insert({ nodeId: startNode, priority: 0 });

    while (!pq.isEmpty()) {
      const { nodeId: currentNode } = pq.extractMin();

      if (currentNode === endNode) {
        break;
      }

      if (visited.has(currentNode)) {
        continue;
      }

      visited.add(currentNode);

      const neighbors = this.graph[currentNode]?.neighbors || [];

      for (const neighbor of neighbors) {
        if (visited.has(neighbor.nodeId)) {
          continue;
        }

        const edgeWeight = this.calculateEdgeWeight(
          currentNode,
          neighbor,
          vehicleType
        );

        const altDistance = distances.get(currentNode) + edgeWeight;

        if (altDistance < distances.get(neighbor.nodeId)) {
          distances.set(neighbor.nodeId, altDistance);
          previous.set(neighbor.nodeId, currentNode);
          pq.insert({ nodeId: neighbor.nodeId, priority: altDistance });
        }
      }
    }

    // Reconstruct path
    const path = this.reconstructPath(previous, startNode, endNode);
    const signalsOnRoute = this.getSignalsOnRoute(path);
    const totalDistance = distances.get(endNode);
    const estimatedTime = this.calculateTotalTime(path);

    return {
      path: path.map((nodeId) => this.getNodeCoordinates(nodeId)),
      nodes: path,
      distance: totalDistance,
      estimatedTime: Math.ceil(estimatedTime),
      signals: signalsOnRoute,
      alternativeRoutes: this.findAlternativeRoutes(startNode, endNode, path),
    };
  }

  /**
   * Calculate dynamic edge weight based on multiple factors
   */
  calculateEdgeWeight(fromNode, toEdge, vehicleType) {
    const { segmentId, baseDistance } = toEdge;

    // Base weight from distance
    let weight = baseDistance;

    // Traffic density factor (0.3x - 3x multiplier)
    const trafficInfo = this.trafficData.get(segmentId);
    if (trafficInfo) {
      const densityMultiplier = this.getTrafficMultiplier(
        trafficInfo.current_density
      );
      weight *= densityMultiplier;
    }

    // Weather factor
    const weatherMultiplier = this.getWeatherMultiplier(this.weather);
    weight *= weatherMultiplier;

    // Signal delay
    const signal = this.signals.get(toEdge.nodeId);
    if (signal && !signal.override_active) {
      // Add average signal wait time
      weight += signal.normal_cycle_timing.cycle_duration / 4; // Average wait
    } else if (signal && signal.override_active) {
      // Emergency vehicle has priority - minimal delay
      weight += 5;
    }

    // Vehicle type factor (ambulances get slight preference on certain roads)
    if (vehicleType === "ambulance" && this.isHospitalRoute(segmentId)) {
      weight *= 0.9; // 10% preference
    }

    return weight;
  }

  /**
   * Get traffic density multiplier
   */
  getTrafficMultiplier(density) {
    if (density < TRAFFIC_DENSITY.LOW) return 0.5; // Light traffic - faster
    if (density < TRAFFIC_DENSITY.MEDIUM) return 1.0; // Normal traffic
    if (density < TRAFFIC_DENSITY.HIGH) return 1.8; // Heavy traffic
    return 3.0; // Very heavy traffic
  }

  /**
   * Get weather condition multiplier
   */
  getWeatherMultiplier(weather) {
    const multipliers = {
      clear: 1.0,
      rain: 1.3,
      fog: 1.5,
      snow: 2.0,
      storm: 2.5,
    };
    return multipliers[weather] || 1.0;
  }

  /**
   * Reconstruct path from previous map
   */
  reconstructPath(previous, start, end) {
    const path = [];
    let current = end;

    while (current !== start) {
      path.unshift(current);
      current = previous.get(current);

      if (!current) {
        throw new Error("No path found");
      }
    }

    path.unshift(start);
    return path;
  }

  /**
   * Get all signals on the route
   */
  getSignalsOnRoute(path) {
    return path
      .filter((nodeId) => this.signals.has(nodeId))
      .map((nodeId) => ({
        signal_id: this.signals.get(nodeId).signal_id,
        location: this.signals.get(nodeId).location.coordinates,
        current_state: this.signals.get(nodeId).current_state,
      }));
  }

  /**
   * Calculate total estimated time for the route
   */
  calculateTotalTime(path) {
    let totalTime = 0;

    for (let i = 0; i < path.length - 1; i++) {
      const neighbors = this.graph[path[i]]?.neighbors || [];
      const edge = neighbors.find((n) => n.nodeId === path[i + 1]);

      if (edge) {
        const segment = this.trafficData.get(edge.segmentId);
        const speed = segment?.average_speed || 30; // default 30 km/h
        const timeInHours = edge.baseDistance / speed;
        totalTime += timeInHours * 3600; // convert to seconds
      }
    }

    return totalTime;
  }

  /**
   * Find alternative routes (simplified A* with different heuristics)
   */
  findAlternativeRoutes(start, end, mainPath, maxAlternatives = 2) {
    // This would implement alternative route finding
    // For now, returning empty array as placeholder
    return [];
  }

  /**
   * Helper methods (to be implemented based on actual data structure)
   */
  findNearestNode(coords) {
    // Find nearest graph node to given coordinates
    // This would use spatial indexing in production
    return `node_${coords[0].toFixed(4)}_${coords[1].toFixed(4)}`;
  }

  getNodeCoordinates(nodeId) {
    // Return coordinates for a node
    // Parse from nodeId for now
    const parts = nodeId.split("_");
    return [parseFloat(parts[1]), parseFloat(parts[2])];
  }

  isHospitalRoute(segmentId) {
    // Check if segment is part of hospital access route
    // This would check against a database of hospital routes
    return false;
  }
}

/**
 * Update graph weights in real-time
 */
function updateGraphWeights(graph, trafficData, signals) {
  // This function would be called periodically to update edge weights
  // based on new traffic data and signal states
  const updatedGraph = { ...graph };

  // Update would happen here based on new data

  return updatedGraph;
}

module.exports = {
  DijkstraRouter,
  updateGraphWeights,
};
