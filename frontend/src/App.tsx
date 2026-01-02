import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import DashboardPage from './pages/DashboardPage';
import EmergencyPage from './pages/EmergencyPage';
import VehiclePage from './pages/VehiclePage';
import TrafficPage from './pages/TrafficPage';
import AnalyticsPage from './pages/AnalyticsPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="emergency" element={<EmergencyPage />} />
        <Route path="vehicle" element={<VehiclePage />} />
        <Route path="traffic" element={<TrafficPage />} />
        <Route path="analytics" element={<AnalyticsPage />} />
      </Route>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
    </Routes>
  );
}

export default App;
