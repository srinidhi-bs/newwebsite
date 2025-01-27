import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

export default function PrivateRoute({ children }) {
  const { user, clientData, loading } = useAuth();
  const location = useLocation();

  // Show loading spinner while auth state is being determined
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 dark:border-indigo-400"></div>
      </div>
    );
  }

  // Check if user is authenticated and approved
  const isAuthenticated = user && clientData && (clientData.approved || clientData.role === 'admin');

  return isAuthenticated ? (
    children
  ) : (
    <Navigate 
      to="/login" 
      state={{ from: location.pathname }}
      replace 
    />
  );
}
