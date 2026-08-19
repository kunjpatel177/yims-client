import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authAPI } from '../services/apiServices';

const AuthContext = createContext(null);

const TOKEN_KEY = 'yims_token';
const ADMIN_KEY = 'yims_admin';

const getToken = () => localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(TOKEN_KEY);

const getStoredAdmin = () => {
  const stored = localStorage.getItem(ADMIN_KEY) || sessionStorage.getItem(ADMIN_KEY);
  if (!stored) return null;
  try {
    return JSON.parse(stored);
  } catch {
    return null;
  }
};

const persistAuth = (token, adminData) => {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(ADMIN_KEY, JSON.stringify(adminData));
  sessionStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(ADMIN_KEY);
};

const clearAuth = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(ADMIN_KEY);
  sessionStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(ADMIN_KEY);
};

export function AuthProvider({ children }) {
  const [admin, setAdmin] = useState(() => getStoredAdmin());
  const [loading, setLoading] = useState(true);

  const checkAuth = useCallback(async () => {
    const token = getToken();
    if (!token) {
      setAdmin(null);
      setLoading(false);
      return;
    }

    const stored = getStoredAdmin();
    if (stored) setAdmin(stored);

    try {
      const { data } = await authAPI.getMe();
      setAdmin(data.data);
      localStorage.setItem(ADMIN_KEY, JSON.stringify(data.data));
    } catch (err) {
      if (err.response?.status === 401) {
        clearAuth();
        setAdmin(null);
      } else if (stored) {
        setAdmin(stored);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const sessionToken = sessionStorage.getItem(TOKEN_KEY);
    const sessionAdmin = sessionStorage.getItem(ADMIN_KEY);
    if (sessionToken && sessionAdmin) {
      localStorage.setItem(TOKEN_KEY, sessionToken);
      localStorage.setItem(ADMIN_KEY, sessionAdmin);
      sessionStorage.removeItem(TOKEN_KEY);
      sessionStorage.removeItem(ADMIN_KEY);
    }
    checkAuth();
  }, [checkAuth]);

  const login = async (credentials) => {
    const { data } = await authAPI.login({
      ...credentials,
      rememberMe: credentials.rememberMe !== false,
    });
    const { token, admin: adminData } = data.data;
    persistAuth(token, adminData);
    setAdmin(adminData);
    return data;
  };

  const logout = async () => {
    try {
      await authAPI.logout();
    } catch {
      // ignore
    }
    clearAuth();
    setAdmin(null);
  };

  const isAuthenticated = Boolean(admin) || Boolean(getToken());

  return (
    <AuthContext.Provider value={{ admin, loading, login, logout, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
