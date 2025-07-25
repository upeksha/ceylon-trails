import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthProvider';
import { ItineraryProvider } from './contexts/ItineraryContext';
import MapContainer from './components/MapContainer';
import PublicItineraryPage from './pages/PublicItineraryPage';
import LoginModal from './components/LoginModal';
import ItineraryManager from './components/ItineraryManager';
import { User, LogOut, FolderOpen } from 'lucide-react';
import { useAuth } from './contexts/AuthProvider';
import { useItinerary } from './contexts/ItineraryContext';
import './styles/App.css';

// Admin components
import ProtectedAdminRoute from './admin/ProtectedAdminRoute';
import AdminLayout from './admin/AdminLayout';
import AdminDashboard from './admin/AdminDashboard';
import AdminPlaces from './admin/AdminPlaces';

// Main App Component with Auth and Itinerary Contexts
const AppContent = () => {
  const { user, logout } = useAuth();
  const { currentItineraryTitle } = useItinerary();
  
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showItineraryManager, setShowItineraryManager] = useState(false);

  const handleLogout = async () => {
    await logout();
    // Clear any local state if needed
  };

  return (
    <div className="app-container">
      {/* Header with Auth and Itinerary Management */}
      <div className="app-header">
        {/* App Title and Current Itinerary */}
        <div className="header-left">
          <h1 className="app-title">
            Ceylon Trails
          </h1>
          
          {user && currentItineraryTitle && currentItineraryTitle !== 'Untitled Itinerary' && (
            <div className="itinerary-badge">
              {currentItineraryTitle}
            </div>
          )}
        </div>

        {/* Auth and Itinerary Management Buttons */}
        <div className="header-right">
          {/* My Itineraries Button - Only show when user is logged in */}
          {user && (
            <button
              onClick={() => setShowItineraryManager(true)}
              className="btn-primary"
            >
              <FolderOpen size={16} />
              My Itineraries
            </button>
          )}

          {/* Auth Button */}
          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div className="user-info">
                <User size={14} />
                {user.displayName || user.email}
              </div>
              <button
                onClick={handleLogout}
                className="btn-danger"
              >
                <LogOut size={14} />
                Logout
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowLoginModal(true)}
              className="btn-success"
            >
              <User size={16} />
              Sign In
            </button>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="main-content">
        <Routes>
          <Route path="/" element={<MapContainer />} />
          <Route path="/itinerary/:id" element={<PublicItineraryPage />} />
          
          {/* Admin Routes */}
          <Route
            path="/admin"
            element={
              <ProtectedAdminRoute>
                <AdminLayout />
              </ProtectedAdminRoute>
            }
          >
            <Route index element={<AdminDashboard />} />
            <Route path="places" element={<AdminPlaces />} />
            {/* Future admin routes will go here */}
            {/* <Route path="users" element={<AdminUsers />} /> */}
            {/* <Route path="itineraries" element={<AdminItineraries />} /> */}
          </Route>
        </Routes>
      </div>

      {/* Modals */}
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onSuccess={() => {
          setShowLoginModal(false);
          console.log('✅ User logged in successfully');
        }}
      />

      <ItineraryManager
        isOpen={showItineraryManager}
        onClose={() => setShowItineraryManager(false)}
      />
    </div>
  );
};

// Main App Component
const App = () => {
  return (
    <AuthProvider>
      <ItineraryProvider>
        <Router>
          <AppContent />
        </Router>
      </ItineraryProvider>
    </AuthProvider>
  );
};

export default App;
