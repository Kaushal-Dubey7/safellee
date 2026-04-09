import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { JourneyProvider } from './context/JourneyContext';
import { SOSProvider } from './context/SOSContext';

import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import ProfileSetup from './pages/ProfileSetup';
import Dashboard from './pages/Dashboard';
import RoutePlanner from './pages/RoutePlanner';
import ActiveJourney from './pages/ActiveJourney';
import SOSPage from './pages/SOSPage';
import LovedOnes from './pages/LovedOnes';
import CommunityRatings from './pages/CommunityRatings';
import Profile from './pages/Profile';

const ProtectedRoute = ({ children, requireProfile = true }) => {
  const { isAuthenticated, isProfileComplete, loading } = useAuth();

  if (loading) {
    return (
      <div className="loading-overlay">
        <div className="loading-spinner" />
        <p style={{ color: '#585F6C', marginTop: 12, fontWeight: 500 }}>Loading Safelle...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requireProfile && !isProfileComplete) {
    return <Navigate to="/profile-setup" replace />;
  }

  return children;
};

const PublicRoute = ({ children }) => {
  const { isAuthenticated, isProfileComplete, loading } = useAuth();

  if (loading) {
    return (
      <div className="loading-overlay">
        <div className="loading-spinner" />
      </div>
    );
  }

  if (isAuthenticated && isProfileComplete) {
    return <Navigate to="/dashboard" replace />;
  }

  if (isAuthenticated && !isProfileComplete) {
    return <Navigate to="/profile-setup" replace />;
  }

  return children;
};

const App = () => {
  return (
    <Router>
      <AuthProvider>
        <JourneyProvider>
          <SOSProvider>
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<Landing />} />
              <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
              <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />

              {/* Profile setup - protected but doesn't require profile complete */}
              <Route path="/profile-setup" element={
                <ProtectedRoute requireProfile={false}><ProfileSetup /></ProtectedRoute>
              } />

              {/* Protected routes - require complete profile */}
              <Route path="/dashboard" element={
                <ProtectedRoute><Dashboard /></ProtectedRoute>
              } />
              <Route path="/route-planner" element={
                <ProtectedRoute><RoutePlanner /></ProtectedRoute>
              } />
              <Route path="/journey/active" element={
                <ProtectedRoute><ActiveJourney /></ProtectedRoute>
              } />
              <Route path="/sos" element={
                <ProtectedRoute requireProfile={false}><SOSPage /></ProtectedRoute>
              } />
              <Route path="/loved-ones" element={
                <ProtectedRoute><LovedOnes /></ProtectedRoute>
              } />
              <Route path="/community-ratings" element={
                <ProtectedRoute><CommunityRatings /></ProtectedRoute>
              } />
              <Route path="/profile" element={
                <ProtectedRoute><Profile /></ProtectedRoute>
              } />

              {/* 404 fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </SOSProvider>
        </JourneyProvider>
      </AuthProvider>
    </Router>
  );
};

export default App;
