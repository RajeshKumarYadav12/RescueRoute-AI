import { useEffect, useState } from 'react';
import { Car, MapPin, Activity, Navigation, AlertCircle } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { api, endpoints } from '@/lib/api';

interface Vehicle {
  _id: string;
  vehicle_id: string;
  type: string;
  status: string;
  current_location: {
    type: string;
    coordinates: [number, number];
  };
  assigned_emergency?: {
    emergency_id: string;
    location: {
      coordinates: [number, number];
    };
  };
}

export default function VehiclePage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchVehicles();
    // Refresh every 5 seconds for real-time updates
    const interval = setInterval(fetchVehicles, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchVehicles = async () => {
    try {
      const response = await api.get<{ success: boolean; vehicles: Vehicle[] }>(endpoints.getVehicles);
      if (response.success) {
        setVehicles(response.vehicles);
      }
      setLoading(false);
    } catch (err: any) {
      console.error('Failed to fetch vehicles:', err);
      setError(err.message || 'Failed to load vehicles');
      setLoading(false);
    }
  };

  const activeVehicles = vehicles.filter((v) => v.status === 'dispatched' || v.status === 'on_scene');
  const idleVehicles = vehicles.filter((v) => v.status === 'available');

  // Calculate map center from all vehicle locations
  const getMapCenter = (): [number, number] => {
    if (vehicles.length === 0) return [28.6139, 77.209]; // Only fallback if no vehicles
    
    const avgLat = vehicles.reduce((sum, v) => sum + v.current_location.coordinates[1], 0) / vehicles.length;
    const avgLon = vehicles.reduce((sum, v) => sum + v.current_location.coordinates[0], 0) / vehicles.length;
    return [avgLat, avgLon];
  };

  const typeLabels: Record<string, string> = {
    ambulance: 'Ambulance',
    fire_truck: 'Fire Truck',
    police_van: 'Police Van',
  };

  const statusLabels: Record<string, string> = {
    available: 'Available',
    dispatched: 'En Route',
    on_scene: 'On Scene',
    returning: 'Returning',
  };

  const calculateETA = (vehicle: Vehicle) => {
    if (!vehicle.assigned_emergency) return '-';
    // Simple ETA calculation - in production, use real routing API
    const distance = calculateDistance(
      vehicle.current_location.coordinates,
      vehicle.assigned_emergency.location.coordinates
    );
    const estimatedTime = Math.round((distance / 60) * 60); // Assuming 60 km/h average
    return `${estimatedTime} min`;
  };

  const calculateDistance = (coord1: [number, number], coord2: [number, number]) => {
    const R = 6371; // Earth's radius in km
    const dLat = ((coord2[1] - coord1[1]) * Math.PI) / 180;
    const dLon = ((coord1[0] - coord2[0]) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((coord1[1] * Math.PI) / 180) *
        Math.cos((coord2[1] * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading vehicles...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
            <AlertCircle className="w-6 h-6 text-red-600" />
            <div>
              <h3 className="font-semibold text-red-900">Error Loading Vehicles</h3>
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-primary flex items-center gap-3">
            <Car className="w-8 h-8 text-secondary" />
            Vehicle Tracking
          </h1>
          <p className="text-text-muted mt-2">Real-time emergency vehicle monitoring</p>
        </div>

        {vehicles.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <Car className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Vehicles Available</h3>
            <p className="text-gray-600">No vehicles are currently registered in the system.</p>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Vehicle List - 2/3 Width on Left */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 mb-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Car className="w-6 h-6 text-secondary" />
                  Vehicle Fleet ({vehicles.length})
                </h2>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                {vehicles.map((vehicle) => (
                  <VehicleCard
                    key={vehicle._id}
                    vehicle={vehicle}
                    eta={calculateETA(vehicle)}
                  />
                ))}
              </div>
            </div>

            {/* Live Map - 1/3 Width on Right */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden sticky top-8">
                <div className="p-4 bg-gradient-to-r from-primary to-secondary">
                  <div className="flex items-center gap-3 mb-3">
                    <MapPin className="w-6 h-6 text-white" />
                    <h2 className="text-xl font-bold text-white">Live Map</h2>
                  </div>
                  {/* Stats at top of map */}
                  <div className="grid grid-cols-3 gap-2">
                    <div className="bg-white/20 backdrop-blur-sm rounded-lg p-2 text-center">
                      <div className="flex items-center justify-center gap-1 mb-1">
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                        <span className="text-xs text-white font-medium">Active</span>
                      </div>
                      <span className="text-lg font-bold text-white">{activeVehicles.length}</span>
                    </div>
                    <div className="bg-white/20 backdrop-blur-sm rounded-lg p-2 text-center">
                      <div className="flex items-center justify-center gap-1 mb-1">
                        <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                        <span className="text-xs text-white font-medium">Idle</span>
                      </div>
                      <span className="text-lg font-bold text-white">{idleVehicles.length}</span>
                    </div>
                    <div className="bg-white/20 backdrop-blur-sm rounded-lg p-2 text-center">
                      <div className="flex items-center justify-center gap-1 mb-1">
                        <Activity className="w-3 h-3 text-white" />
                        <span className="text-xs text-white font-medium">Total</span>
                      </div>
                      <span className="text-lg font-bold text-white">{vehicles.length}</span>
                    </div>
                  </div>
                </div>
                <div className="relative" style={{ height: 'calc(100vh - 350px)', minHeight: '500px' }}>
                  <MapContainer
                    center={getMapCenter()}
                    zoom={12}
                    style={{ height: '100%', width: '100%' }}
                    scrollWheelZoom={true}
                    zoomControl={true}
                  >
                    <TileLayer
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    />
                    {vehicles.map((vehicle) => (
                      <Marker
                        key={vehicle._id}
                        position={[
                          vehicle.current_location.coordinates[1],
                          vehicle.current_location.coordinates[0],
                        ]}
                      >
                        <Popup>
                          <div className="min-w-[200px]">
                            <div className="bg-gradient-to-r from-primary to-secondary text-white px-3 py-2 -m-3 mb-2 rounded-t-lg">
                              <strong className="text-base font-bold">{vehicle.vehicle_id}</strong>
                            </div>
                            <div className="space-y-1 text-sm">
                              <div className="flex justify-between">
                                <span className="text-gray-600 font-medium">Type:</span>
                                <span className="font-semibold">{typeLabels[vehicle.type] || vehicle.type}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600 font-medium">Status:</span>
                                <span className={`font-semibold ${
                                  vehicle.status === 'dispatched' || vehicle.status === 'on_scene'
                                    ? 'text-green-600'
                                    : 'text-gray-600'
                                }`}>
                                  {statusLabels[vehicle.status] || vehicle.status}
                                </span>
                              </div>
                              <div className="pt-2 border-t border-gray-200">
                                <span className="text-gray-600 text-xs">Coordinates:</span>
                                <br />
                                <span className="text-xs font-mono text-gray-800">
                                  {vehicle.current_location.coordinates[1].toFixed(6)}°N,
                                  <br />
                                  {vehicle.current_location.coordinates[0].toFixed(6)}°E
                                </span>
                              </div>
                              {vehicle.assigned_emergency && (
                                <div className="pt-2 border-t border-gray-200 bg-red-50 -mx-3 px-3 py-2 -mb-2 rounded-b-lg">
                                  <div className="flex items-center gap-1 text-red-600">
                                    <AlertCircle className="w-3 h-3" />
                                    <span className="text-xs font-semibold">Emergency Assigned</span>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </Popup>
                      </Marker>
                    ))}
                  </MapContainer>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function VehicleCard({ vehicle, eta }: { vehicle: Vehicle; eta: string }) {
  const isActive = vehicle.status === 'dispatched' || vehicle.status === 'on_scene';
  
  const statusLabels: Record<string, string> = {
    available: 'Available',
    dispatched: 'En Route',
    on_scene: 'On Scene',
    returning: 'Returning',
  };

  const typeLabels: Record<string, string> = {
    ambulance: 'Ambulance',
    fire_truck: 'Fire Truck',
    police_van: 'Police Van',
  };

  const formatLocation = () => {
    const [lon, lat] = vehicle.current_location.coordinates;
    return `${lat.toFixed(4)}°N, ${lon.toFixed(4)}°E`;
  };

  return (
    <div className={`bg-surface rounded-lg shadow-md p-3 border-l-4 ${
      isActive ? 'border-accent bg-accent-50/50' : 'border-gray-300'
    } hover:shadow-lg transition-shadow cursor-pointer`}>
      <div className="flex items-start gap-2 mb-2">
        <div className={`p-2 rounded-lg ${
          isActive ? 'bg-accent-100' : 'bg-gray-100'
        }`}>
          <Car className={`w-4 h-4 ${
            isActive ? 'text-accent-600' : 'text-gray-400'
          }`} />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-sm text-gray-900 truncate">{vehicle.vehicle_id}</h3>
          <p className="text-xs text-gray-600">{typeLabels[vehicle.type] || vehicle.type}</p>
        </div>
      </div>

      <div className="space-y-1.5">
        <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium ${
          isActive
            ? 'bg-success-100 text-success-700'
            : 'bg-gray-100 text-gray-700'
        }`}>
          <div className={`w-1.5 h-1.5 rounded-full ${
            isActive ? 'bg-success-500 animate-pulse' : 'bg-gray-400'
          }`}></div>
          {statusLabels[vehicle.status] || vehicle.status}
        </div>

        {vehicle.assigned_emergency && (
          <div className="mt-2 p-2 bg-red-50 rounded-lg border border-red-200">
            <div className="flex items-center gap-1 mb-1">
              <AlertCircle className="w-3 h-3 text-red-600" />
              <span className="text-xs font-semibold text-red-900">Emergency</span>
            </div>
            <div className="text-xs text-red-700">
              <div className="flex items-center gap-1">
                <Navigation className="w-3 h-3" />
                <span>ETA: {eta}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
