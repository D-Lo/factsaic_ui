/**
 * Authentication Context
 *
 * Provides authentication state and methods throughout the app.
 */

import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { User } from '@/types/api';
import * as apiClient from '@/lib/api-client';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string, displayName: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const token = apiClient.getToken();
      const storedUser = apiClient.getStoredUser();

      if (token && storedUser) {
        try {
          const currentUser = await apiClient.getCurrentUser();
          setUser(currentUser);
          apiClient.setStoredUser(currentUser);
        } catch (error) {
          console.error('Token validation failed:', error);
          apiClient.clearToken();
          apiClient.clearStoredUser();
        }
      }

      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const tokenResponse = await apiClient.login(email, password);
      apiClient.setToken(tokenResponse.access_token);

      const userData = await apiClient.getCurrentUser();
      apiClient.setStoredUser(userData);
      setUser(userData);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (
    email: string,
    password: string,
    name: string,
    displayName: string
  ) => {
    setIsLoading(true);
    try {
      const { user: newUser, token } = await apiClient.register({
        email,
        password,
        name,
        display_name: displayName,
      });

      apiClient.setToken(token.access_token);
      apiClient.setStoredUser(newUser);
      setUser(newUser);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    apiClient.clearToken();
    apiClient.clearStoredUser();
    setUser(null);
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * Hook to use auth context
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
