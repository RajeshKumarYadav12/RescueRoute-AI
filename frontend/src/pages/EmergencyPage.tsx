import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity, MapPin, Clock, AlertCircle, Phone, User, Navigation } from 'lucide-react';

export default function EmergencyPage() {
  const navigate = useNavigate();
  const [emergencies, setEmergencies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    type: '',
    location: '',
    contact_name: '',
    contact_phone: '',
    description: '',
    latitude: null as number | null,
    longitude: null as number | null,
  });
  const [gettingLocation, setGettingLocation] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchEmergencies();
  }, []);

  const fetchEmergencies = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch('http://localhost:5000/api/emergency', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        const emergencyList = data.emergencies || [];
        setEmergencies(emergencyList.filter((e: any) => e.status !== 'resolved').slice(0, 5));
      }
    } catch (error) {
      console.error('Failed to fetch emergencies:', error);
    }
  };

  const getCurrentLocation = () => {
    setGettingLocation(true);
    setError('');

    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      setGettingLocation(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setFormData({
          ...formData,
          latitude,
          longitude,
        });

        // Reverse geocoding to get address (optional - requires API)
        try {
          // You can use Google Maps Geocoding API or OpenStreetMap Nominatim
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
          );
          const data = await response.json();
          setFormData({
            ...formData,
            location: data.display_name || `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
            latitude,
            longitude,
          });
        } catch (err) {
          setFormData({
            ...formData,
            location: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
            latitude,
            longitude,
          });
        }
        setGettingLocation(false);
      },
      (error) => {
        setError('Unable to get your location. Please enter manually.');
        setGettingLocation(false);
        console.error('Geolocation error:', error);
      }
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      const emergencyData = {
        type: formData.type,
        location: {
          type: 'Point',
          coordinates: formData.latitude && formData.longitude 
            ? [formData.longitude, formData.latitude] 
            : [0, 0],
          address: formData.location,
        },
        severity: formData.type === 'fire' ? 10 : formData.type === 'medical' ? 8 : formData.type === 'accident' ? 6 : 5,
        contact_name: formData.contact_name,
        contact_phone: formData.contact_phone,
        description: {
          en: formData.description,
          hi: formData.description, // Can be translated later
        },
      };

      const response = await fetch('http://localhost:5000/api/emergency/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(emergencyData),
      });

      if (response.ok) {
        alert('Emergency reported successfully! Response team has been notified.');
        // Reset form
        setFormData({
          type: '',
          location: '',
          contact_name: '',
          contact_phone: '',
          description: '',
          latitude: null,
          longitude: null,
        });
        // Refresh emergencies list
        fetchEmergencies();
      } else {
        const data = await response.json();
        setError(data.message || 'Failed to report emergency');
      }
    } catch (err) {
      setError('Unable to connect to server. Please try again.');
      console.error('Error reporting emergency:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-primary flex items-center gap-3">
            <Activity className="w-8 h-8 text-error" />
            Emergency Management
          </h1>
          <p className="text-text-muted mt-2">Report and track emergency incidents</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* New Emergency Form */}
          <div className="bg-surface rounded-xl shadow-lg p-8 border border-border">
            <h2 className="text-2xl font-bold text-primary mb-6">Report Emergency</h2>
            
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {error}
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-text-main mb-2">
                  Emergency Type
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full px-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-secondary focus:border-transparent"
                  required
                >
                  <option value="">Select emergency type</option>
                  <option value="medical">Medical Emergency</option>
                  <option value="accident">Traffic Accident</option>
                  <option value="fire">Fire Emergency</option>
                  <option value="police">Police Emergency</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-main mb-2">
                  <MapPin className="w-4 h-4 inline mr-1" />
                  Location
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="Enter location or use GPS"
                    className="flex-1 px-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-secondary focus:border-transparent"
                    required
                  />
                  <button
                    type="button"
                    onClick={getCurrentLocation}
                    disabled={gettingLocation}
                    className="px-4 py-3 bg-secondary text-white rounded-lg hover:bg-secondary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Get current location"
                  >
                    <Navigation className={`w-5 h-5 ${gettingLocation ? 'animate-pulse' : ''}`} />
                  </button>
                </div>
                {formData.latitude && formData.longitude && (
                  <p className="mt-1 text-xs text-gray-500">
                    GPS: {formData.latitude.toFixed(6)}, {formData.longitude.toFixed(6)}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-text-main mb-2">
                  <User className="w-4 h-4 inline mr-1" />
                  Contact Name
                </label>
                <input
                  type="text"
                  value={formData.contact_name}
                  onChange={(e) => setFormData({ ...formData, contact_name: e.target.value })}
                  placeholder="Your name"
                  className="w-full px-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-secondary focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-main mb-2">
                  <Phone className="w-4 h-4 inline mr-1" />
                  Contact Phone
                </label>
                <input
                  type="tel"
                  value={formData.contact_phone}
                  onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
                  placeholder="+91 XXXXX XXXXX"
                  className="w-full px-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-secondary focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-main mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={4}
                  placeholder="Describe the emergency situation..."
                  className="w-full px-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-secondary focus:border-transparent resize-none"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-error text-white rounded-lg hover:bg-error-700 transition-colors font-semibold text-lg shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <AlertCircle className="w-5 h-5" />
                {loading ? 'Submitting...' : 'Submit Emergency Alert'}
              </button>
            </form>
          </div>

          {/* Active Emergencies List */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Active Emergencies</h2>
              <div className="space-y-4">
                {emergencies.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No active emergencies
                  </div>
                ) : (
                  emergencies.map((emergency: any) => (
                    <EmergencyCard
                      key={emergency._id}
                      type={emergency.type}
                      location={emergency.location?.address || 'Unknown location'}
                      time={getTimeAgo(emergency.timestamp)}
                      status={emergency.status}
                      severity={emergency.severity}
                    />
                  ))
                )}
              </div>
            </div>

            {/* Emergency Tips */}
            <div className="bg-gradient-to-br from-info-500 to-info-700 rounded-xl shadow-lg p-8 text-white">
              <h3 className="text-xl font-bold mb-4">Emergency Tips</h3>
              <ul className="space-y-3 text-info-50">
                <li className="flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <span>Stay calm and provide accurate location details</span>
                </li>
                <li className="flex items-start gap-2">
                  <Clock className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <span>Keep your phone accessible for updates</span>
                </li>
                <li className="flex items-start gap-2">
                  <Phone className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <span>For immediate danger, call 108 (ambulance) or 100 (police)</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper function to calculate time ago
function getTimeAgo(timestamp: string) {
  const now = new Date();
  const past = new Date(timestamp);
  const diffMs = now.getTime() - past.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
}

function EmergencyCard({ type, location, time, status, severity }: any) {
  const severityColors = {
    critical: 'border-l-4 border-emergency-600 bg-emergency-50',
    high: 'border-l-4 border-warning-600 bg-warning-50',
    medium: 'border-l-4 border-info-600 bg-info-50',
  };

  return (
    <div className={`p-4 rounded-lg ${severityColors[severity as keyof typeof severityColors]}`}>
      <div className="flex items-start justify-between mb-2">
        <h4 className="font-semibold text-gray-900">{type}</h4>
        <span className="px-3 py-1 bg-white rounded-full text-xs font-medium text-gray-700 border border-gray-200">
          {status}
        </span>
      </div>
      <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
        <MapPin className="w-4 h-4" />
        <span>{location}</span>
      </div>
      <div className="flex items-center gap-2 text-sm text-gray-600">
        <Clock className="w-4 h-4" />
        <span>{time}</span>
      </div>
    </div>
  );
}
