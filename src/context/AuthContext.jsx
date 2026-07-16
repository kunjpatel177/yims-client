import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authAPI } from '../services/apiServices';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  const getStoredAdmin = () => {
    const stored = localStorage.getItem('yims_admin') || sessionStorage.getItem('yims_admin');
    return stored ? JSON.parse(stored) : null;
  };

  const checkAuth = useCallback(async () => {
    const token = localStorage.getItem('yims_token') || sessionStorage.getItem('yims_token');
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      const { data } = await authAPI.getMe();
      setAdmin(data.data);
    } catch {
      localStorage.removeItem('yims_token');
      localStorage.removeItem('yims_admin');
      sessionStorage.removeItem('yims_token');
      sessionStorage.removeItem('yims_admin');
      setAdmin(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const stored = getStoredAdmin();
    if (stored) setAdmin(stored);
    checkAuth();
  }, [checkAuth]);

  const login = async (credentials) => {
    const { data } = await authAPI.login(credentials);
    const { token, admin: adminData } = data.data;
    const storage = credentials.rememberMe ? localStorage : sessionStorage;
    storage.setItem('yims_token', token);
    storage.setItem('yims_admin', JSON.stringify(adminData));
    setAdmin(adminData);
    return data;
  };

  const logout = async () => {
    try {
      await authAPI.logout();
    } catch {
      // ignore
    }
    localStorage.removeItem('yims_token');
    localStorage.removeItem('yims_admin');
    sessionStorage.removeItem('yims_token');
    sessionStorage.removeItem('yims_admin');
    setAdmin(null);
  };

  return (
    <AuthContext.Provider value={{ admin, loading, login, logout, isAuthenticated: !!admin }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
