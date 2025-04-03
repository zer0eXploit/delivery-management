import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuthStore } from "../../stores/auth.store";

import { LoadingSpinner } from "../common";

interface AuthGuardProps {
  children: ReactNode;
  requireAuth?: boolean;
}

export function AuthGuard({ children, requireAuth = false }: AuthGuardProps) {
  const { isAuthenticated, isLoading } = useAuthStore();

  console.log({ isAuthenticated, requireAuth });

  if (isLoading) {
    return <LoadingSpinner size="large" />;
  }

  if (requireAuth && !isAuthenticated) {
    return <Navigate to="/auth/login" replace />;
  }

  return <>{children}</>;
}
