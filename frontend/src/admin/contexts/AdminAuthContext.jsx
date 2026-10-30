import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { getCurrentAdmin, loginAdmin, logoutAdmin } from '../services/authService.js';

const AdminAuthContext = createContext(null);
const DEMO_SESSION_KEY = 'corelink-admin-demo-user';

export function AdminAuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [status, setStatus] = useState('loading');

  useEffect(() => {
    let active = true;
    const storedDemoUser = import.meta.env.DEV
      ? window.sessionStorage.getItem(DEMO_SESSION_KEY)
      : null;

    if (storedDemoUser) {
      try {
        setUser(JSON.parse(storedDemoUser));
        setStatus('authenticated');
        return () => { active = false; };
      } catch {
        window.sessionStorage.removeItem(DEMO_SESSION_KEY);
      }
    }

    getCurrentAdmin()
      .then((currentUser) => {
        if (!active) return;
        setUser(currentUser);
        setStatus(currentUser ? 'authenticated' : 'anonymous');
      })
      .catch(() => {
        if (!active) return;
        setUser(null);
        setStatus('anonymous');
      });

    return () => { active = false; };
  }, []);

  const login = useCallback(async (credentials) => {
    const result = await loginAdmin(credentials);
    setUser(result.user);
    setStatus('authenticated');
    if (result.demo) {
      window.sessionStorage.setItem(DEMO_SESSION_KEY, JSON.stringify(result.user));
    }
  }, []);

  const logout = useCallback(async () => {
    await logoutAdmin();
    window.sessionStorage.removeItem(DEMO_SESSION_KEY);
    setUser(null);
    setStatus('anonymous');
  }, []);

  const value = useMemo(() => ({
    user,
    status,
    isAuthenticated: status === 'authenticated',
    login,
    logout,
  }), [user, status, login, logout]);

  return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>;
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext);
  if (!context) throw new Error('useAdminAuth doit être utilisé dans AdminAuthProvider.');
  return context;
}
