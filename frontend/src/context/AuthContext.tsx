import React, { createContext, useContext, useState, useEffect } from 'react';
import API from '../lib/api';

export interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  major?: string;
  university?: string;
  gpa?: number;
  streak?: number;
  semester?: number;
  preferences?: {
    learningStyle?: string;
    dailyStudyGoalMinutes?: number;
    notificationsEnabled?: boolean;
  };
  createdAt?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  register: (name: string, email: string, password: string, major?: string, university?: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  updateProfile: (data: Partial<User>) => Promise<{ success: boolean; message?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('synexora_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Initialize auth state by verifying existing token
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('synexora_token');
      if (storedToken) {
        try {
          const res = await API.get('/auth/me');
          if (res.data.success && res.data.user) {
            setUser(res.data.user);
          } else {
            logout();
          }
        } catch {
          logout();
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const res = await API.post('/auth/login', { email, password });
      if (res.data.success) {
        const { token: receivedToken, user: receivedUser } = res.data;
        localStorage.setItem('synexora_token', receivedToken);
        localStorage.setItem('synexora_user', JSON.stringify(receivedUser));
        setToken(receivedToken);
        setUser(receivedUser);
        return { success: true, message: res.data.message };
      }
      return { success: false, message: res.data.message || 'Login failed' };
    } catch (err: any) {
      const message =
        err.response?.data?.message || 'Invalid credentials or server unavailable';
      return { success: false, message };
    }
  };

  const register = async (
    name: string,
    email: string,
    password: string,
    major?: string,
    university?: string
  ) => {
    try {
      const res = await API.post('/auth/register', {
        name,
        email,
        password,
        major,
        university,
      });
      if (res.data.success) {
        const { token: receivedToken, user: receivedUser } = res.data;
        localStorage.setItem('synexora_token', receivedToken);
        localStorage.setItem('synexora_user', JSON.stringify(receivedUser));
        setToken(receivedToken);
        setUser(receivedUser);
        return { success: true, message: res.data.message };
      }
      return { success: false, message: res.data.message || 'Registration failed' };
    } catch (err: any) {
      const message =
        err.response?.data?.message || 'Registration error. Please check your inputs.';
      return { success: false, message };
    }
  };

  const logout = () => {
    localStorage.removeItem('synexora_token');
    localStorage.removeItem('synexora_user');
    setToken(null);
    setUser(null);
  };

  const updateProfile = async (data: Partial<User>) => {
    try {
      const res = await API.put('/auth/profile', data);
      if (res.data.success && res.data.user) {
        setUser(res.data.user);
        return { success: true, message: 'Profile updated successfully' };
      }
      return { success: false, message: res.data.message || 'Update failed' };
    } catch (err: any) {
      return {
        success: false,
        message: err.response?.data?.message || 'Failed to update profile',
      };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated: !!token && !!user,
        login,
        register,
        logout,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
