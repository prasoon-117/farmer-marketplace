import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('fm_token') || null);
  const [demoAccounts, setDemoAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load demo accounts for convenient switcher
  useEffect(() => {
    api.getDemoAccounts()
      .then((res) => {
        if (res.success) setDemoAccounts(res.data);
      })
      .catch((err) => console.error('Failed to load demo accounts:', err));
  }, []);

  // Fetch current user if token exists
  useEffect(() => {
    async function loadUser() {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const res = await api.me();
        if (res.success) {
          setUser(res.data.user);
        } else {
          logout();
        }
      } catch (err) {
        console.warn('Auth token invalid or expired:', err);
        logout();
      } finally {
        setLoading(false);
      }
    }
    loadUser();
  }, [token]);

  const login = async (email, password) => {
    setError(null);
    try {
      const res = await api.login({ email, password });
      if (res.success) {
        localStorage.setItem('fm_token', res.data.token);
        setToken(res.data.token);
        setUser(res.data.user);
        return res.data.user;
      }
    } catch (err) {
      setError(err.message || 'Login failed');
      throw err;
    }
  };

  const register = async (userData) => {
    setError(null);
    try {
      const res = await api.register(userData);
      if (res.success) {
        localStorage.setItem('fm_token', res.data.token);
        setToken(res.data.token);
        setUser(res.data.user);
        return res.data.user;
      }
    } catch (err) {
      setError(err.message || 'Registration failed');
      throw err;
    }
  };

  const demoLogin = async (roleOrEmail) => {
    setError(null);
    try {
      const payload = roleOrEmail.includes('@')
        ? { email: roleOrEmail }
        : { role: roleOrEmail };
      const res = await api.demoLogin(payload);
      if (res.success) {
        localStorage.setItem('fm_token', res.data.token);
        setToken(res.data.token);
        setUser(res.data.user);
        return res.data.user;
      }
    } catch (err) {
      setError(err.message || 'Demo login failed');
      throw err;
    }
  };

  const logout = () => {
    localStorage.removeItem('fm_token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        error,
        demoAccounts,
        login,
        register,
        demoLogin,
        logout,
        isAuthenticated: !!user,
        isFarmer: user?.role === 'farmer',
        isBuyer: user?.role === 'buyer',
        isAdmin: user?.role === 'admin',
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

