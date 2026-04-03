import React, { createContext, useContext, useEffect, useState } from 'react';
import api from './api';

const AuthContext = createContext(null);
const normalizeRole = (role) => String(role || '').trim().toUpperCase().replace(/^ROLE_/, '');

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem('nanasa_auth');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        const normalizedUser = { ...parsed, role: normalizeRole(parsed?.role) };
        localStorage.setItem('nanasa_auth', JSON.stringify(normalizedUser));
        setUser(normalizedUser);
      } catch {
        localStorage.removeItem('nanasa_auth');
        setUser(null);
      }
    }
  }, []);

  const login = async (username, password) => {
    const res = await api.post('/auth/login', { username, password });
    const data = res.data;
    const authUser = {
      username: data.username,
      role: normalizeRole(data.role),
      token: data.token,
      teacherId: data.teacherId || null
    };
    localStorage.setItem('nanasa_auth', JSON.stringify(authUser));
    setUser(authUser);
  };

  const logout = () => {
    localStorage.removeItem('nanasa_auth');
    setUser(null);
  };

  const value = { user, login, logout };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}

