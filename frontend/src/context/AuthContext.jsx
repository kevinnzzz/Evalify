import { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/api';

const AuthContext = createContext(null);

// API Gateway URL - matches services/api.js
const API_BASE = import.meta.env.VITE_API_GATEWAY || 
  (typeof window !== 'undefined' && window.location.hostname === 'localhost' 
    ? 'http://localhost:3000' 
    : 'https://evalify-backend.vercel.app');

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(null);

  useEffect(() => {
    // Check localStorage for saved user session & token
    const savedUser = localStorage.getItem('evalify_user');
    const savedToken = localStorage.getItem('evalify_token');
    if (savedUser && savedToken) {
      setUser(JSON.parse(savedUser));
      setToken(savedToken);
    }
    setLoading(false);
  }, []);

  const login = async (credentials) => {
    try {
      const response = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Login gagal');
      }

      const data = await response.json();
      const userObj = {
        id: data.user.id,
        fullName: data.user.fullName,
        username: data.user.username,
        email: data.user.email,
        avatar_url: data.user.avatar_url,
        role: 'Job Seeker',
      };

      setUser(userObj);
      setToken(data.token);
      localStorage.setItem('evalify_user', JSON.stringify(userObj));
      localStorage.setItem('evalify_token', data.token);

      return userObj;
    } catch (err) {
      throw err;
    }
  };

  const register = async (userData) => {
    try {
      const response = await fetch(`${API_BASE}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Registrasi gagal');
      }

      const data = await response.json();
      const userObj = {
        id: data.user.id,
        fullName: data.user.fullName,
        username: data.user.username,
        email: data.user.email,
        avatar_url: data.user.avatar_url,
        role: 'Job Seeker',
      };

      setUser(userObj);
      setToken(data.token);
      localStorage.setItem('evalify_user', JSON.stringify(userObj));
      localStorage.setItem('evalify_token', data.token);

      return userObj;
    } catch (err) {
      throw err;
    }
  };

  const logout = async () => {
    try {
      const savedToken = localStorage.getItem('evalify_token');
      if (savedToken) {
        await fetch(`${API_BASE}/api/auth/logout`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${savedToken}`,
          },
        });
      }
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setUser(null);
      setToken(null);
      localStorage.removeItem('evalify_user');
      localStorage.removeItem('evalify_token');
    }
  };

  const updateUser = (updates) => {
    const updated = { ...user, ...updates };
    setUser(updated);
    localStorage.setItem('evalify_user', JSON.stringify(updated));
  };

  return <AuthContext.Provider value={{ user, loading, token, login, register, logout, updateUser }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
