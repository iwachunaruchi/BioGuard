import React, { createContext, useContext, useState, useEffect } from 'react';
import { AuthContextType, User } from '../types';
import { StorageService } from '../utils/storage';
import { ApiService } from '../services/api';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuthState();
  }, []);

  const checkAuthState = async () => {
    try {
      const token = await StorageService.getUserToken();
      if (token) {
        const me = await ApiService.me(token);
        setUser({
          id: me.id,
          email: me.email,
          name: me.name,
          role: me.role,
          createdAt: typeof me.createdAt === 'string' ? me.createdAt : new Date(me.createdAt).toISOString(),
        });
      }
    } catch (error) {
      console.error('Error checking auth state:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const { token } = await ApiService.login(email, password);
      await StorageService.saveUserToken(token);
      const me = await ApiService.me(token);
      setUser({
        id: me.id,
        email: me.email,
        name: me.name,
        role: me.role,
        createdAt: typeof me.createdAt === 'string' ? me.createdAt : new Date(me.createdAt).toISOString(),
      });
      return true;
    } catch (error) {
      console.error('Error during login:', error);
      return false;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await StorageService.removeUserToken();
      setUser(null);
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};
