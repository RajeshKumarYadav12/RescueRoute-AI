import { useEffect, useState } from 'react';
import { TrafficCone, Activity, TrendingUp, AlertTriangle } from 'lucide-react';
import { api, endpoints } from '@/lib/api';

interface TrafficSegment {
  _id: string;
  segment_id: string;
  current_density: number;
  average_speed: number;
  location: {
    start_coord: [number, number];
    end_coord: [number, number];
  };
}

interface Signal {
  _id: string;
  signal_id: string;
  location: {
    coordinates: [number, number];
  };
  current_state: string;
  override_active: boolean;
  priority_queue: any[];
}

export default function TrafficPage() {
  const [trafficData, setTrafficData] = useState<TrafficSegment[]>([]);
  const [signals, setSignals] = useState<Signal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000); // Refresh every 10 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      const [trafficResponse, signalsResponse] = await Promise.all([
        api.get<{ success: boolean; trafficData: TrafficSegment[] }>(endpoints.getTrafficData),
        api.get<{ success: boolean; signals: Signal[] }>(endpoints.getSignals),
      ]);

      if (trafficResponse.success) {
        setTrafficData(trafficResponse.trafficData || []);
      }
      if (signalsResponse.success) {
        setSignals(signalsResponse.signals || []);
      }
    } catch (error) {
      console.error('Failed to fetch traffic data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate stats from real data
  const avgDensity = trafficData.length > 0
    ? trafficData.reduce((sum, seg) => sum + seg.current_density, 0) / trafficData.length
    : 0;
  
  const avgSpeed = trafficData.length > 0
    ? trafficData.reduce((sum, seg) => sum + (seg.average_speed || 0), 0) / trafficData.length
    : 0;
  
  const congestedCount = trafficData.filter(seg => seg.current_density > 70).length;

  const getDensityLabel = (density: number) => {
    if (density >= 70) return 'High';
    if (density >= 40) return 'Medium';
    return 'Low';
  };

  const getDensityStatus = (density: number) => {
    if (density >= 70) return 'Congested';
    if (density >= 40) return 'Moderate';
    return 'Clear';
  };

  const getDensityColor = (density: number) => {
    if (density >= 70) return 'emergency';
    if (density >= 40) return 'warning';
    return 'success';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading traffic data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-primary flex items-center gap-3">
            <TrafficCone className="w-8 h-8 text-warning" />
            Traffic Management
          </h1>
          <p className="text-text-muted mt-2">Real-time traffic monitoring and signal control</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 mb-8">
          <TrafficStatCard
            title="Traffic Density"
            value={getDensityLabel(avgDensity)}
            icon={Activity}
            color={getDensityColor(avgDensity)}
          />
          <TrafficStatCard
            title="Average Speed"
            value={avgSpeed > 0 ? `${Math.round(avgSpeed)} km/h` : 'N/A'}
            icon={TrendingUp}
            color="info"
          />
          <TrafficStatCard
            title="Congested Areas"
            value={congestedCount.toString()}
            icon={AlertTriangle}
            color="emergency"
          />
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Traffic Segments</h2>
            {trafficData.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <TrafficCone className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                <p>No traffic data available</p>
              </div>
            ) : (
              <div className="space-y-3">
                {trafficData.map((segment) => (
                  <TrafficSegmentCard
                    key={segment._id}
                    name={segment.segment_id}
                    density={getDensityLabel(segment.current_density)}
                    status={getDensityStatus(segment.current_density)}
                    color={getDensityColor(segment.current_density)}
                    speed={segment.average_speed}
                  />
                ))}
              </div>
            )}
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Signal Control</h2>
            {signals.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Activity className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                <p>No signals configured</p>
              </div>
            ) : (
              <div className="space-y-3">
                {signals.map((signal) => (
                  <SignalControlCard
                    key={signal._id}
                    id={signal.signal_id}
                    location={`${signal.location.coordinates[1].toFixed(4)}°N, ${signal.location.coordinates[0].toFixed(4)}°E`}
                    status={signal.override_active ? 'Priority Mode' : signal.current_state}
                    priority={signal.priority_queue.length > 0 ? 'Emergency Vehicle' : 'None'}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function TrafficStatCard({ title, value, icon: Icon, color }: any) {
  const colorClasses = {
    emergency: 'from-emergency-500 to-emergency-700',
    warning: 'from-warning-500 to-warning-700',
    info: 'from-info-500 to-info-700',
    success: 'from-success-500 to-success-700',
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
      <div className={`inline-flex p-3 rounded-lg bg-gradient-to-br ${colorClasses[color as keyof typeof colorClasses]} mb-4`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      <div className="text-3xl font-bold text-gray-900 mb-1">{value}</div>
      <div className="text-sm text-gray-600">{title}</div>
    </div>
  );
}

function TrafficSegmentCard({ name, density, status, color, speed }: any) {
  const colorClasses = {
    emergency: 'bg-emergency-50 text-emergency-800 border-emergency-300',
    warning: 'bg-warning-50 text-warning-800 border-warning-300',
    success: 'bg-success-50 text-success-800 border-success-300',
  };

  return (
    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
      <div>
        <div className="font-semibold text-gray-900">{name}</div>
        <div className="text-sm text-gray-600">
          Density: {density} • Speed: {speed ? `${Math.round(speed)} km/h` : 'N/A'}
        </div>
      </div>
      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${colorClasses[color as keyof typeof colorClasses]}`}>
        {status}
      </span>
    </div>
  );
}

function SignalControlCard({ id, location, status, priority }: any) {
  return (
    <div className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
      <div className="flex items-start justify-between mb-2">
        <div>
          <div className="font-semibold text-gray-900">{id}</div>
          <div className="text-sm text-gray-600">{location}</div>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4 mt-3">
        <div>
          <div className="text-xs text-gray-500">Status</div>
          <div className="text-sm font-medium text-gray-900">{status}</div>
        </div>
        <div>
          <div className="text-xs text-gray-500">Priority</div>
          <div className="text-sm font-medium text-gray-900">{priority}</div>
        </div>
      </div>
    </div>
  );
}
