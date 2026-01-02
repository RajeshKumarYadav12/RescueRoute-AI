import { useEffect, useState } from 'react';
import { BarChart3, TrendingUp, Activity, MapPin } from 'lucide-react';
import { api, endpoints } from '@/lib/api';

interface Hotspot {
  _id: any;
  count: number;
  avgSeverity: number;
  location: {
    coordinates: [number, number];
  };
}

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<any>(null);
  const [hotspots, setHotspots] = useState<Hotspot[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const [analyticsResponse, hotspotsResponse] = await Promise.all([
        api.get<{ success: boolean; analytics: any }>(endpoints.getAnalytics),
        api.get<{ success: boolean; hotspots: Hotspot[] }>(endpoints.getHotspots),
      ]);

      if (analyticsResponse.success) {
        setAnalytics(analyticsResponse.analytics);
      }
      if (hotspotsResponse.success) {
        setHotspots(hotspotsResponse.hotspots || []);
      }
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  const getSeverity = (avgSeverity: number) => {
    if (avgSeverity >= 8) return 'high';
    if (avgSeverity >= 5) return 'medium';
    return 'low';
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-primary flex items-center gap-3">
            <BarChart3 className="w-8 h-8 text-secondary" />
            Analytics Dashboard
          </h1>
          <p className="text-text-muted mt-2">AI-powered insights and predictions</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 mb-8">
          <AnalyticCard
            title="Active Emergencies"
            value={analytics?.activeEmergencies?.toString() || '0'}
            icon={Activity}
            period="Currently Active"
          />
          <AnalyticCard
            title="Avg Response Time"
            value={analytics?.avgResponseTime ? `${analytics.avgResponseTime} min` : 'N/A'}
            icon={TrendingUp}
            period="Last 24 hours"
          />
          <AnalyticCard
            title="Hotspot Areas"
            value={hotspots.length.toString()}
            icon={MapPin}
            period="Detected"
          />
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Chart Placeholder */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Emergency Trends</h2>
            <div className="aspect-video bg-gradient-to-br from-primary-50 to-primary-100 rounded-lg flex items-center justify-center text-gray-500">
              <BarChart3 className="w-16 h-16" />
            </div>
          </div>

          {/* Hotspots */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Accident Hotspots</h2>
            {hotspots.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <MapPin className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                <p>No accident hotspots detected</p>
                <p className="text-sm mt-1">Data will appear as emergencies are reported</p>
              </div>
            ) : (
              <div className="space-y-3">
                {hotspots.map((hotspot, index) => (
                  <HotspotItem
                    key={index}
                    location={`${hotspot.location.coordinates[1].toFixed(4)}°N, ${hotspot.location.coordinates[0].toFixed(4)}°E`}
                    incidents={hotspot.count}
                    severity={getSeverity(hotspot.avgSeverity)}
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

function AnalyticCard({ title, value, icon: Icon, period }: any) {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
      <div className="flex items-start justify-between mb-4">
        <div className="p-3 rounded-lg bg-gradient-to-br from-primary-500 to-primary-700">
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
      <div className="text-3xl font-bold text-gray-900 mb-1">{value}</div>
      <div className="text-sm text-gray-600">{title}</div>
      <div className="text-xs text-gray-500 mt-2">{period}</div>
    </div>
  );
}

function HotspotItem({ location, incidents, severity }: any) {
  const severityColors = {
    high: 'bg-emergency-500',
    medium: 'bg-warning-500',
    low: 'bg-success-500',
  };

  return (
    <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
      <div className={`w-2 h-2 rounded-full ${severityColors[severity as keyof typeof severityColors]} animate-pulse`}></div>
      <div className="flex-1">
        <div className="font-semibold text-gray-900">{location}</div>
        <div className="text-sm text-gray-600">{incidents} incidents this month</div>
      </div>
      <MapPin className="w-5 h-5 text-gray-400" />
    </div>
  );
}
