import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Spinner } from '../ui/spinner';
import type { UserRole } from '../../types/auth';
import { useAuth } from '../../context/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowedRoles,
}) => {
  const { isAuthenticated, user, isLoading } = useAuth();
  const location = useLocation();

  console.log('ProtectedRoute check:', { 
    isLoading, 
    isAuthenticated, 
    user, 
    allowedRoles,
    currentPath: location.pathname 
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    console.log('Redirecting to login - not authenticated or no user');
    // Redirect to login page with return URL
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    console.log('Redirecting to unauthorized - role mismatch:', {
      userRole: user.role,
      allowedRoles
    });
    // Redirect to unauthorized page
    return <Navigate to="/unauthorized" replace />;
  }

  console.log('ProtectedRoute allowing access');
  return <>{children}</>;
};