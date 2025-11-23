/**
 * Protected Route Component
 *
 * Wraps routes that require authentication.
 * Redirects to login if user is not authenticated.
 */

import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface ProtectedRouteProps {
  children: ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading } = useAuth();

  // 🎓 LEARNING NOTE: While checking auth status, show loading state
  // This prevents a flash of the login page before we know if user is logged in
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  // 🎓 LEARNING NOTE: If not authenticated, redirect to login
  // Navigate component from React Router changes the URL
  // replace={true} replaces current history entry (can't go back to this page)
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // 🎓 LEARNING NOTE: User is authenticated, show the protected content
  // {children} is whatever component was wrapped in <ProtectedRoute>
  return <>{children}</>;
}
