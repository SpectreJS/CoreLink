import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAdminAuth } from '../contexts/AdminAuthContext.jsx';
import { canAccessAdminPath } from './permissions.js';

export default function AdminProtectedRoute() {
  const { isAuthenticated, status, user } = useAdminAuth();
  const location = useLocation();

  if (status === 'loading') {
    return <div aria-live="polite" className="admin-login-screen">Vérification de la session…</div>;
  }
  if (!isAuthenticated) return <Navigate replace state={{ from: location }} to="/admin/login" />;
  if (!canAccessAdminPath(user?.role, location.pathname)) return <Navigate replace to="/admin/dashboard" />;
  return <Outlet />;
}
