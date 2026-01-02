/**
 * Calculate distance between two coordinates using Haversine formula
 * @param lat1 - Latitude of first point
 * @param lon1 - Longitude of first point
 * @param lat2 - Latitude of second point
 * @param lon2 - Longitude of second point
 * @returns Distance in kilometers
 */
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

/**
 * Format ETA seconds to human-readable string
 * @param seconds - ETA in seconds
 * @returns Formatted string like "5 min" or "1h 30min"
 */
export function formatETA(seconds: number): string {
  if (seconds < 60) {
    return `${Math.round(seconds)} sec`;
  } else if (seconds < 3600) {
    return `${Math.round(seconds / 60)} min`;
  } else {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.round((seconds % 3600) / 60);
    return `${hours}h ${minutes}min`;
  }
}

/**
 * Get severity color based on value
 * @param severity - Severity number from 1-10
 * @returns Tailwind color class
 */
export function getSeverityColor(severity: number): string {
  if (severity >= 8) return 'text-emergency-700 bg-emergency-50';
  if (severity >= 5) return 'text-warning-700 bg-warning-50';
  return 'text-info-700 bg-info-50';
}

/**
 * Get status color based on emergency status
 * @param status - Emergency status
 * @returns Tailwind color class
 */
export function getStatusColor(
  status: 'reported' | 'dispatched' | 'ongoing' | 'resolved'
): string {
  switch (status) {
    case 'reported':
      return 'bg-warning-100 text-warning-800';
    case 'dispatched':
      return 'bg-info-100 text-info-800';
    case 'ongoing':
      return 'bg-emergency-100 text-emergency-800';
    case 'resolved':
      return 'bg-success-100 text-success-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

/**
 * Format timestamp to relative time
 * @param timestamp - ISO timestamp string
 * @returns Relative time like "5 minutes ago"
 */
export function formatRelativeTime(timestamp: string): string {
  const now = new Date();
  const past = new Date(timestamp);
  const diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1000);

  if (diffInSeconds < 60) return 'just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
  return `${Math.floor(diffInSeconds / 86400)} days ago`;
}

/**
 * Validate coordinates
 * @param lat - Latitude
 * @param lon - Longitude
 * @returns True if valid
 */
export function isValidCoordinates(lat: number, lon: number): boolean {
  return lat >= -90 && lat <= 90 && lon >= -180 && lon <= 180;
}

/**
 * Debounce function
 * @param func - Function to debounce
 * @param wait - Wait time in milliseconds
 * @returns Debounced function
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}
