import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './services/authContext';
import AppLayout from './components/layout/AppLayout';

import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import SOS from './pages/SOS';
import Journey from './pages/Journey';
import Detector from './pages/Detector';
import Evidence from './pages/Evidence';
import MapHub from './pages/MapHub';
import PoliceAssistance from './pages/PoliceAssistance';
import PrivacyChecklist from './pages/PrivacyChecklist';
import OfflineHandbook from './pages/OfflineHandbook';
import Settings from './pages/Settings';

// Protected Route Guard
function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

// Public Route Guard (redirects authenticated users to dashboard)
function PublicRoute({ children }) {
  const { isAuthenticated } = useAuth();
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Authentication Route */}
          <Route
            path="/login"
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            }
          />

          {/* Protected Application Routes wrapped in AppLayout */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="sos" element={<SOS />} />
            <Route path="journey" element={<Journey />} />
            <Route path="detector" element={<Detector />} />
            <Route path="evidence" element={<Evidence />} />
            <Route path="map" element={<MapHub />} />
            <Route path="police" element={<PoliceAssistance />} />
            <Route path="privacy" element={<PrivacyChecklist />} />
            <Route path="offline" element={<OfflineHandbook />} />
            <Route path="settings" element={<Settings />} />
          </Route>

          {/* Catch-all Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
