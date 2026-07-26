import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { APIClient } from '../api/client';
import type { User, Permission } from '../types';
import { USERS as INITIAL_USERS } from '../mock/enterpriseInitialData';

interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isBackendOffline: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  hasPermission: (permission: Permission) => boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isBackendOffline, setIsBackendOffline] = useState(false);

  const checkAuth = useCallback(async () => {
    try {
      const data = await APIClient.get<{ user: User }>('/auth/me');
      setUser(data.user);
      setIsBackendOffline(false);
    } catch (err: any) {
      // Check if saved local session exists
      const savedUser = localStorage.getItem('lims_user_session');
      if (savedUser) {
        try {
          setUser(JSON.parse(savedUser));
        } catch {
          setUser(null);
        }
      } else {
        setUser(null);
      }
      setIsBackendOffline(true);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    try {
      // Try backend API login
      const data = await APIClient.post<{ user: User }>('/auth/login', { email, password });
      setUser(data.user);
      localStorage.setItem('lims_user_session', JSON.stringify(data.user));
      setIsBackendOffline(false);
    } catch (err: any) {
      // If network/backend is offline ("Failed to fetch"), fall back to offline demo login
      const isNetworkError = err?.message?.includes('Failed to fetch') || err?.message?.includes('NetworkError');
      
      const demoUser = INITIAL_USERS.find((u) => u.email.toLowerCase() === email.toLowerCase());
      if (demoUser) {
        setUser(demoUser);
        localStorage.setItem('lims_user_session', JSON.stringify(demoUser));
        setIsBackendOffline(true);
        return;
      }

      if (isNetworkError) {
        throw new Error('Backend server is offline (http://localhost:5000). Please start the backend or use a demo role login.');
      }
      throw new Error(err.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await APIClient.post('/auth/logout');
    } catch {
      // Ignore network logout failures
    } finally {
      setUser(null);
      localStorage.removeItem('lims_user_session');
      window.location.href = '/login';
    }
  }, []);

  const hasPermission = useCallback((permission: Permission): boolean => {
    if (!user) return false;
    if (user.role === 'LabDirector' || user.role === 'Administrator') return true;
    return user.permissions?.includes(permission) ?? false;
  }, [user]);

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user,
      isLoading,
      isBackendOffline,
      login,
      logout,
      hasPermission,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
