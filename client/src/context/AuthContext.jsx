import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('safelle_token');
    const savedUser = localStorage.getItem('safelle_user');
    if (token && savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch { /* ignore */ }
    }
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = localStorage.getItem('safelle_token');
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      const res = await api.get('/api/auth/me');
      setUser(res.data.user);
      localStorage.setItem('safelle_user', JSON.stringify(res.data.user));
    } catch {
      localStorage.removeItem('safelle_token');
      localStorage.removeItem('safelle_user');
      setUser(null);
    }
    setLoading(false);
  };

  const register = async (data) => {
    setError(null);
    try {
      const res = await api.post('/api/auth/register', data);
      localStorage.setItem('safelle_token', res.data.token);
      localStorage.setItem('safelle_user', JSON.stringify(res.data.user));
      setUser(res.data.user);
      return res.data;
    } catch (err) {
      const msg = err.response?.data?.error || err.response?.data?.errors?.[0] || 'Registration failed.';
      setError(msg);
      throw new Error(msg);
    }
  };

  const login = async (email, password) => {
    setError(null);
    try {
      const res = await api.post('/api/auth/login', { email, password });
      localStorage.setItem('safelle_token', res.data.token);
      localStorage.setItem('safelle_user', JSON.stringify(res.data.user));
      setUser(res.data.user);
      return res.data;
    } catch (err) {
      const msg = err.response?.data?.error || 'Login failed.';
      setError(msg);
      throw new Error(msg);
    }
  };

  const logout = useCallback(() => {
    localStorage.removeItem('safelle_token');
    localStorage.removeItem('safelle_user');
    setUser(null);
  }, []);

  const updateUser = useCallback((userData) => {
    setUser(userData);
    localStorage.setItem('safelle_user', JSON.stringify(userData));
  }, []);

  return (
    <AuthContext.Provider value={{
      user, loading, error, setError,
      register, login, logout, updateUser, checkAuth,
      isAuthenticated: !!user,
      isProfileComplete: user?.isProfileComplete || false
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
