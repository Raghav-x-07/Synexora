import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Loader2 } from 'lucide-react';

interface RoleProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
  strict?: boolean;
}

export const RoleProtectedRoute: React.FC<RoleProtectedRouteProps> = ({
  children,
  allowedRoles = [],
  strict = false,
}) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
          <p className="text-xs text-slate-500 font-medium">Verifying authorization...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If specific roles required, verify user has one of them
  if (allowedRoles.length > 0) {
    const userRole = user.role;
    const isSuper = userRole === 'super_admin' || userRole === 'admin';
    const isAllowed = allowedRoles.includes(userRole) || (!strict && isSuper);

    if (!isAllowed) {
      // Redirect to user's permitted default portal
      if (userRole === 'super_admin' || userRole === 'admin') {
        return <Navigate to="/admin" replace />;
      }
      if (userRole === 'institution_admin') {
        return <Navigate to="/institution-portal" replace />;
      }
      return <Navigate to="/dashboard" replace />;
    }
  }

  return <>{children}</>;
};
