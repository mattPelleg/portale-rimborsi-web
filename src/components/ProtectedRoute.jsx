import React from 'react';
import { Navigate } from 'react-router-dom';
import authService from '../services/authService';

const ProtectedRoute = ({ children }) => {
  const isAuthenticated = authService.isAuthenticated();
  console.log('ProtectedRoute — isAuthenticated:', isAuthenticated);
  console.log('ProtectedRoute — localStorage user:', localStorage.getItem('user'));
  console.log('ProtectedRoute — path:', window.location.pathname);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;