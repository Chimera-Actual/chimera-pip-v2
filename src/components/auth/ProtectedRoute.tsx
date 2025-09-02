import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { BootSequence } from '@/components/PipBoy/BootSequence';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiresCharacter?: boolean;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requiresCharacter = false 
}) => {
  const { user, profile, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <BootSequence />;
  }

  if (!user) {
    // Save the attempted location for redirecting after login
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }

  if (requiresCharacter && profile && !profile.character_name) {
    return <Navigate to="/auth/character" replace />;
  }

  return <>{children}</>;
};