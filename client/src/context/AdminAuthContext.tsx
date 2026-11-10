import React, { createContext, useContext, useState, useEffect } from 'react';
import { AdminUser, AdminRole } from '../types/admin';
import { adminLogin, adminLogout, getAdminProfile } from '../services/adminApi';

interface AdminAuthContextType {
  user: AdminUser | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  hasRole: (allowedRoles: AdminRole[]) => boolean;
  refreshProfile: () => Promise<void>;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export const AdminAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AdminUser | null>(() => {
    const saved = localStorage.getItem('voltedge_admin_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return null;
      }
    }
    return null;
  });

  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('voltedge_admin_token') || null;
  });

  const [isLoading, setIsLoading] = useState<boolean>(true);

  const refreshProfile = async () => {
    try {
      if (token) {
        const profile = await getAdminProfile();
        setUser(profile);
        localStorage.setItem('voltedge_admin_user', JSON.stringify(profile));
      }
    } catch (err) {
      console.error('Failed to restore session:', err);
      setUser(null);
      setToken(null);
      localStorage.removeItem('voltedge_admin_user');
      localStorage.removeItem('voltedge_admin_token');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      refreshProfile();
    } else {
      setIsLoading(false);
    }
  }, [token]);

  const login = async (email: string, password: string) => {
    const res = await adminLogin({ email, password });
    if (res.token && res.user) {
      setToken(res.token);
      setUser(res.user);
      localStorage.setItem('voltedge_admin_token', res.token);
      localStorage.setItem('voltedge_admin_user', JSON.stringify(res.user));
    }
  };

  const logout = async () => {
    try {
      await adminLogout();
    } catch (e) {
      console.warn('Logout API warning:', e);
    } finally {
      setUser(null);
      setToken(null);
      localStorage.removeItem('voltedge_admin_user');
      localStorage.removeItem('voltedge_admin_token');
    }
  };

  const hasRole = (allowedRoles: AdminRole[]): boolean => {
    if (!user) return false;
    if (user.role === 'SUPER_ADMIN') return true;
    return allowedRoles.includes(user.role);
  };

  return (
    <AdminAuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        logout,
        hasRole,
        refreshProfile,
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
};

