import { Navigate, useLocation } from 'react-router-dom';
import { useAuth, roleHomeRoute } from '@/contexts/AuthContext';
import type { Role } from '@/types';
import { AuthLoadingScreen } from '@/screens/auth/AuthLoadingScreen';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: Role;
}

export function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <AuthLoadingScreen />;
  }

  // 1. If not authenticated, redirect to /auth/login
  if (!user) {
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }

  // 2. Strict Role Verification & Route Protection
  if (requiredRole && user.role !== requiredRole) {
    // User is signed in but attempted to navigate to an unauthorized portal.
    // Strictly redirect to their own authorized role portal.
    return <Navigate to={roleHomeRoute(user.role)} replace />;
  }

  return <>{children}</>;
}
