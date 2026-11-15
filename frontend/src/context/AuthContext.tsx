import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { api } from '../api/client';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, role?: string) => Promise<void>;
  logout: () => void;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const token = localStorage.getItem('buysmart_token');
    if (token) {
      api.getCurrentUser()
        .then(u => setUser(u))
        .catch(() => {
          localStorage.removeItem('buysmart_token');
          localStorage.removeItem('buysmart_local_user');
          setUser(null);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email: string, password: string) => {
    const res = await api.login({ email, password });
    localStorage.setItem('buysmart_token', res.access_token);
    setUser(res.user);
  };

  const register = async (name: string, email: string, password: string, role?: string) => {
    const res = await api.register({ name, email, password, role });
    localStorage.setItem('buysmart_token', res.access_token);
    setUser(res.user);
  };

  const logout = () => {
    localStorage.removeItem('buysmart_token');
    localStorage.removeItem('buysmart_local_user');
    setUser(null);
  };

  const isAdmin = user?.role === 'admin';

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
