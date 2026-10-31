import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  login: (email: string, fullName?: string) => Promise<void>;
  logout: () => void;
  switchDemoUser: (personaEmail: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem('wayfare_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return null;
      }
    }
    // Default initial mock user for instant dev access
    return {
      id: 'u-solo-alex-001',
      email: 'alex@wayfare.ai',
      full_name: 'Alex Rivera (Solo Explorer)',
      avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    };
  });
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    // If token exists, verify with backend me endpoint
    const token = localStorage.getItem('wayfare_token');
    if (!token && user) {
      // Set default mock token
      localStorage.setItem('wayfare_token', `mock-token-${user.email}`);
      localStorage.setItem('wayfare_user', JSON.stringify(user));
    }
  }, [user]);

  const login = async (email: string, fullName?: string) => {
    setLoading(true);
    try {
      const res = await api.login(email, fullName);
      localStorage.setItem('wayfare_token', res.access_token);
      localStorage.setItem('wayfare_user', JSON.stringify(res.user));
      setUser(res.user);
    } finally {
      setLoading(false);
    }
  };

  const switchDemoUser = async (personaEmail: string) => {
    await login(personaEmail);
  };

  const logout = () => {
    localStorage.removeItem('wayfare_token');
    localStorage.removeItem('wayfare_user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, switchDemoUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
