import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Sparkles } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0b0f19] flex flex-col items-center justify-center">
        <div className="relative flex items-center justify-center">
          <div className="w-16 h-16 border-4 border-indigo-500/20 border-t-cyan-400 rounded-full animate-spin" />
          <Sparkles className="w-6 h-6 text-cyan-400 absolute animate-pulse" />
        </div>
        <p className="mt-4 text-sm text-slate-400 tracking-wider font-medium animate-pulse">
          AUTHENTICATING SYNEXORA OS...
        </p>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Redirect to /login and preserve destination in location state
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};
