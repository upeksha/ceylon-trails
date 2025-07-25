import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthProvider';

const ProtectedAdminRoute = ({ children }) => {
  const { user, userData, loading } = useAuth();

  // Show loading while checking authentication
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!user) {
    console.log('🚫 ProtectedAdminRoute: User not authenticated, redirecting to login');
    return <Navigate to="/" replace />;
  }

  // Check if user has admin role
  if (!userData || userData.role !== 'admin') {
    console.log('🚫 ProtectedAdminRoute: User is not admin, showing access denied');
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="text-red-500 text-6xl mb-4">🚫</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-6">
            You don't have permission to access the admin panel. 
            Only administrators can view this page.
          </p>
          <button
            onClick={() => window.history.back()}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // User is authenticated and has admin role
  console.log('✅ ProtectedAdminRoute: User is admin, allowing access');
  return children;
};

export default ProtectedAdminRoute; 