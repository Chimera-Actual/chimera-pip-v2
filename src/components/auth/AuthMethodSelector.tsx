import React from 'react';
import { Navigate } from 'react-router-dom';

export const AuthMethodSelector: React.FC = () => {
  // Redirect to standard login since we're simplifying auth
  return <Navigate to="/auth/login" replace />;

};