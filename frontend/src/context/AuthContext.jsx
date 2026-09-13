import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('LL_REACT_SESSION');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      localStorage.setItem('LL_REACT_SESSION', JSON.stringify(user));
    } else {
      localStorage.removeItem('LL_REACT_SESSION');
      localStorage.removeItem('LL_TOKEN');
    }
  }, [user]);

  const login = async (role, identifier, password) => {
    setLoading(true);
    try {
      const res = await api.login(role, identifier, password);
      if (res.token) localStorage.setItem('LL_TOKEN', res.token);
      setUser(res.user);
      return res;
    } finally {
      setLoading(false);
    }
  };

  const register = async (role, formData) => {
    setLoading(true);
    try {
      const res = await api.register(role, formData);
      if (res.token) localStorage.setItem('LL_TOKEN', res.token);
      setUser(res.user);
      return res;
    } finally {
      setLoading(false);
    }
  };

  const demoLogin = async (role) => {
    setLoading(true);
    try {
      const res = await api.demoLogin(role);
      if (res.token) localStorage.setItem('LL_TOKEN', res.token);
      setUser(res.user);
      return res;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('LL_REACT_SESSION');
    localStorage.removeItem('LL_TOKEN');
    window.location.href = '/auth';
  };

  const getPortalPathForRole = (role) => {
    switch (role) {
      case 'customer': return '/customer';
      case 'labour':   return '/labour';
      case 'b2b':      return '/b2b';
      case 'admin':    return '/admin';
      default:         return '/auth';
    }
  };

  return (
    <AuthContext.Provider value={{ user, role: user?.role, loading, login, register, demoLogin, logout, getPortalPathForRole }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
