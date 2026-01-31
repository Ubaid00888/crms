import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Provider, useSelector } from 'react-redux';
import { store } from './store/store';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import LandingPage from './pages/LandingPage';
import CriminalExplorer from './pages/CriminalExplorer';
import CaseManagement from './pages/CaseManagement';
import Analytics from './pages/Analytics';
import MostWanted from './pages/MostWanted';
import QRLogin from './pages/QRLogin';
import UserManagement from './pages/admin/UserManagement';
import IntelReview from './pages/admin/IntelReview';
import AnalystDashboard from './pages/AnalystDashboard';
import DashboardLayout from './components/Layout/DashboardLayout';
import './index.css';
// Protected Route Component for Admin/Agent
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { token, user } = useSelector((state) => state.auth);

  if (!token) {
    return <Navigate to="/login" />;
  }

  // Redirect Analyst to their specific dashboard if they try to access main dashboard
  if (user?.role === 'analyst' && !allowedRoles?.includes('analyst')) {
    return <Navigate to="/analyst-dashboard" />;
  }

  return (
    <DashboardLayout>
      {children}
    </DashboardLayout>
  );
};

// Protected Route for Analyst specific
const AnalystRoute = ({ children }) => {
  const { token, user } = useSelector((state) => state.auth);

  if (!token) {
    return <Navigate to="/login" />;
  }

  if (user?.role !== 'analyst') {
    return <Navigate to="/dashboard" />;
  }

  return children;
};

function AppRoutes() {
  const { token } = useSelector((state) => state.auth);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/most-wanted" element={<MostWanted />} />
        <Route path="/qr-login" element={<QRLogin />} />
        <Route path="/login" element={<Login />} />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute allowedRoles={['admin', 'agent']}>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/users"
          element={
            <ProtectedRoute>
              <UserManagement />
            </ProtectedRoute>
          }
        />

        <Route
          path="/criminals"
          element={
            <ProtectedRoute>
              <CriminalExplorer />
            </ProtectedRoute>
          }
        />

        <Route
          path="/cases"
          element={
            <ProtectedRoute>
              <CaseManagement />
            </ProtectedRoute>
          }
        />

        <Route
          path="/analytics"
          element={
            <ProtectedRoute>
              <Analytics />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/intelligence"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <IntelReview />
            </ProtectedRoute>
          }
        />
        <Route
          path="/analyst-dashboard"
          element={
            <AnalystRoute>
              <DashboardLayout>
                <AnalystDashboard />
              </DashboardLayout>
            </AnalystRoute>
          }
        />
      </Routes>
    </Router>
  );
}

function App() {
  return (
    <Provider store={store}>
      <AppRoutes />
    </Provider>
  );
}

export default App;
