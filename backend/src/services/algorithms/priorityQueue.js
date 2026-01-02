/**
 * Max Heap-based Priority Queue for emergency vehicle signal priority
 * Supports O(log n) insert and extractMax operations
 */
class PriorityQueue {
  constructor(comparator = (a, b) => a > b) {
    this.heap = [];
    this.comparator = comparator;
  }

  /**
   * Get parent index
   */
  parent(index) {
    return Math.floor((index - 1) / 2);
  }

  /**
   * Get left child index
   */
  leftChild(index) {
    return 2 * index + 1;
  }

  /**
   * Get right child index
   */
  rightChild(index) {
    return 2 * index + 2;
  }

  /**
   * Swap two elements
   */
  swap(i, j) {
    [this.heap[i], this.heap[j]] = [this.heap[j], this.heap[i]];
  }

  /**
   * Insert element with priority
   * Time complexity: O(log n)
   */
  insert(element) {
    this.heap.push(element);
    this.heapifyUp(this.heap.length - 1);
  }

  /**
   * Heapify up from given index
   */
  heapifyUp(index) {
    let currentIndex = index;

    while (
      currentIndex > 0 &&
      this.comparator(
        this.heap[currentIndex],
        this.heap[this.parent(currentIndex)]
      )
    ) {
      this.swap(currentIndex, this.parent(currentIndex));
      currentIndex = this.parent(currentIndex);
    }
  }

  /**
   * Extract maximum element
   * Time complexity: O(log n)
   */
  extractMax() {
    if (this.isEmpty()) {
      return null;
    }

    if (this.heap.length === 1) {
      return this.heap.pop();
    }

    const max = this.heap[0];
    this.heap[0] = this.heap.pop();
    this.heapifyDown(0);

    return max;
  }

  /**
   * Heapify down from given index
   */
  heapifyDown(index) {
    let currentIndex = index;

    while (this.leftChild(currentIndex) < this.heap.length) {
      let largestIndex = currentIndex;
      const leftIndex = this.leftChild(currentIndex);
      const rightIndex = this.rightChild(currentIndex);

      if (this.comparator(this.heap[leftIndex], this.heap[largestIndex])) {
        largestIndex = leftIndex;
      }

      if (
        rightIndex < this.heap.length &&
        this.comparator(this.heap[rightIndex], this.heap[largestIndex])
      ) {
        largestIndex = rightIndex;
      }

      if (largestIndex === currentIndex) {
        break;
      }

      this.swap(currentIndex, largestIndex);
      currentIndex = largestIndex;
    }
  }

  /**
   * Extract minimum element (for min-heap usage)
   * Time complexity: O(log n)
   */
  extractMin() {
    return this.extractMax(); // Works if comparator is reversed
  }

  /**
   * Peek at maximum element without removing
   * Time complexity: O(1)
   */
  peek() {
    return this.isEmpty() ? null : this.heap[0];
  }

  /**
   * Update priority of an element
   * Time complexity: O(n) for find + O(log n) for heapify
   */
  updatePriority(matcher, newPriority) {
    const index = this.heap.findIndex(matcher);

    if (index === -1) {
      return false;
    }

    const oldPriority = this.heap[index].priority;
    this.heap[index].priority = newPriority;

    if (newPriority > oldPriority) {
      this.heapifyUp(index);
    } else {
      this.heapifyDown(index);
    }

    return true;
  }

  /**
   * Remove specific element
   * Time complexity: O(n) for find + O(log n) for heapify
   */
  remove(matcher) {
    const index = this.heap.findIndex(matcher);

    if (index === -1) {
      return null;
    }

    if (index === this.heap.length - 1) {
      return this.heap.pop();
    }

    const removed = this.heap[index];
    this.heap[index] = this.heap.pop();

    // Could go up or down
    this.heapifyDown(index);
    this.heapifyUp(index);

    return removed;
  }

  /**
   * Get all elements in priority order (non-destructive)
   */
  getAllOrdered() {
    const temp = [...this.heap];
    const ordered = [];

    while (!this.isEmpty()) {
      ordered.push(this.extractMax());
    }

    this.heap = temp;
    this.rebuildHeap();

    return ordered;
  }

  /**
   * Rebuild heap from current array
   */
  rebuildHeap() {
    for (let i = Math.floor(this.heap.length / 2) - 1; i >= 0; i--) {
      this.heapifyDown(i);
    }
  }

  /**
   * Check if heap is empty
   */
  isEmpty() {
    return this.heap.length === 0;
  }

  /**
   * Get size of heap
   */
  size() {
    return this.heap.length;
  }

  /**
   * Clear all elements
   */
  clear() {
    this.heap = [];
  }
}

/**
 * Calculate priority score for emergency vehicle
 * @param {Object} params - { urgency, timeElapsed, trafficDensity, distance }
 * @returns {Number} Priority score (0-100)
 */
function calculatePriorityScore({
  urgency,
  timeElapsed,
  trafficDensity,
  distance,
}) {
  const {
    PRIORITY_WEIGHTS,
    URGENCY_WEIGHTS,
  } = require("../../config/constants");

  // Normalize values
  const urgencyScore = urgency; // Already 0-100
  const timeScore = Math.min((timeElapsed / 60) * 10, 100); // Convert minutes to score
  const trafficScore = trafficDensity; // Already 0-100
  const distanceScore = Math.max(100 - distance * 2, 0); // Closer = higher score

  // Weighted sum
  const priorityScore =
    urgencyScore * PRIORITY_WEIGHTS.URGENCY +
    timeScore * PRIORITY_WEIGHTS.TIME_ELAPSED +
    trafficScore * PRIORITY_WEIGHTS.TRAFFIC_DENSITY +
    distanceScore * PRIORITY_WEIGHTS.DISTANCE;

  return Math.min(Math.max(priorityScore, 0), 100);
}

module.exports = PriorityQueue;
module.exports.calculatePriorityScore = calculatePriorityScore;
