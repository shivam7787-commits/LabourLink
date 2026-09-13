import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const ProtectedRoute = ({ children, allowedRole }) => {
  const { user, getPortalPathForRole } = useAuth();

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (allowedRole && user.role !== allowedRole && user.role !== 'admin') {
    // Redirect to their own rightful portal
    return <Navigate to={getPortalPathForRole(user.role)} replace />;
  }

  return children;
};
