import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { EMAIL_CONFIG } from '../../config/appConfig';

// Loading component
const LoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 dark:border-indigo-400"></div>
  </div>
);

export default function AdminRoute({ children }) {
  const { user, clientData, loading } = useAuth();
  
  if (loading) {
    return <LoadingSpinner />;
  }

  // Check if user is authenticated
  if (!user || !clientData) {
    return <Navigate to="/login" />;
  }

  // Check if user is admin
  const isAdmin = EMAIL_CONFIG.ADMIN_EMAILS.includes(user.email) && clientData.role === 'admin';
  if (!isAdmin) {
    console.log('Not admin:', { email: user.email, role: clientData.role });
    return <Navigate to="/" />;
  }

  return children;
}
