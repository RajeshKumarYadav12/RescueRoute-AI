import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LayoutDashboard, Activity, Car, TrendingUp, AlertTriangle } from 'lucide-react';

export default function DashboardPage() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    activeEmergencies: 0,
    vehiclesDeployed: 0,
    avgResponse: '0min',
    successRate: '0%',
  });
  const [emergencies, setEmergencies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      // Fetch emergencies
      const emergencyResponse = await fetch('http://localhost:5000/api/emergency', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (emergencyResponse.ok) {
        const emergencyData = await emergencyResponse.json();
        const emergencies = emergencyData.emergencies || emergencyData.data || [];
        setEmergencies(Array.isArray(emergencies) ? emergencies.slice(0, 5) : []); // Show last 5 emergencies

        // Calculate stats from real data
        const activeCount = Array.isArray(emergencies) ? emergencies.filter((e: any) => e.status === 'active' || e.status === 'reported' || e.status === 'dispatched').length : 0;
        setStats({
          activeEmergencies: activeCount,
          vehiclesDeployed: Array.isArray(emergencies) ? emergencies.filter((e: any) => e.assigned_vehicles?.length > 0).length : 0,
          avgResponse: '4.2min', // This would need backend calculation
          successRate: '94%', // This would need backend calculation
        });
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-primary flex items-center gap-3">
            <LayoutDashboard className="w-8 h-8 text-secondary" />
            Dashboard
          </h1>
          <p className="text-text-muted mt-2">Real-time overview of emergency operations</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-gray-500">Loading dashboard data...</div>
          </div>
        ) : (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <DashboardCard
                title="Active Emergencies"
                value={stats.activeEmergencies.toString()}
                change="+0"
                icon={AlertTriangle}
                color="emergency"
              />
              <DashboardCard
                title="Vehicles Deployed"
                value={stats.vehiclesDeployed.toString()}
                change="+0"
                icon={Car}
                color="info"
              />
              <DashboardCard
                title="Average Response"
                value={stats.avgResponse}
                change="-0.8"
                icon={Activity}
                color="success"
                positive
              />
              <DashboardCard
                title="Success Rate"
                value={stats.successRate}
                change="+2%"
                icon={TrendingUp}
                color="success"
                positive
              />
            </div>

            {/* Main Content Grid */}
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Recent Emergencies */}
              <div className="lg:col-span-2 bg-white rounded-xl shadow-lg p-6 border border-gray-100">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-emergency-600" />
                  Recent Emergencies
                </h2>
                <div className="space-y-3">
                  {emergencies.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      No emergencies found
                    </div>
                  ) : (
                    emergencies.map((emergency: any) => (
                      <EmergencyItem
                        key={emergency._id}
                        type={emergency.type}
                        location={emergency.location?.address || 'Unknown location'}
                        status={emergency.status}
                        time={getTimeAgo(emergency.timestamp)}
                        severity={emergency.severity}
                      />
                    ))
                  )}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
                <div className="space-y-3">
                  <button
                    onClick={() => navigate('/emergency')}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-error text-white rounded-lg hover:bg-error-700 transition-colors font-medium"
                  >
                    <Activity className="w-5 h-5" />
                    New Emergency
                  </button>
                  <button
                    onClick={() => navigate('/vehicle')}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-secondary text-white rounded-lg hover:bg-secondary-700 transition-colors font-medium"
                  >
                    <Car className="w-5 h-5" />
                    Track Vehicle
                  </button>
                  <button
                    onClick={() => navigate('/analytics')}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                  >
                    <Activity className="w-5 h-5" />
                    View Analytics
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
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
  if (diffMins < 60) return `${diffMins} min ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
}

function DashboardCard({ title, value, change, icon: Icon, color, positive }: any) {
  const colorClasses = {
    emergency: 'from-error to-error-700',
    info: 'from-secondary to-secondary-700',
    success: 'from-accent to-accent-700',
    warning: 'from-warning to-warning-700',
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className={`p-3 rounded-lg bg-gradient-to-br ${colorClasses[color as keyof typeof colorClasses]}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        <span
          className={`text-sm font-medium px-2 py-1 rounded ${
            positive !== false ? 'text-success-700 bg-success-50' : 'text-emergency-700 bg-emergency-50'
          }`}
        >
          {change}
        </span>
      </div>
      <div className="text-2xl font-bold text-gray-900 mb-1">{value}</div>
      <div className="text-sm text-gray-600">{title}</div>
    </div>
  );
}

function EmergencyItem({ type, location, status, time, severity }: any) {
  const getSeverityLabel = (sev: any) => {
    if (typeof sev === 'number') {
      if (sev >= 8) return 'critical';
      if (sev >= 5) return 'high';
      return 'medium';
    }
    return String(sev || 'medium').toLowerCase();
  };

  const severityLabel = getSeverityLabel(severity);
  
  const severityColors = {
    critical: 'bg-emergency-100 text-emergency-800 border-emergency-300',
    high: 'bg-warning-100 text-warning-800 border-warning-300',
    medium: 'bg-info-100 text-info-800 border-info-300',
  };

  return (
    <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
      <div className={`px-3 py-1 rounded-full text-xs font-medium border ${severityColors[severityLabel as keyof typeof severityColors]}`}>
        {typeof severity === 'number' ? severity : severityLabel.toUpperCase()}
      </div>
      <div className="flex-1">
        <div className="font-semibold text-gray-900">{type}</div>
        <div className="text-sm text-gray-600">{location}</div>
      </div>
      <div className="text-right">
        <div className="text-sm font-medium text-gray-900">{status}</div>
        <div className="text-xs text-gray-500">{time}</div>
      </div>
    </div>
  );
}
