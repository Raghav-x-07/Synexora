"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { apiRequest } from "@/lib/apiClient";

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: string;
  major?: string;
  academicYear?: string;
  gpa?: number;
  masteryScore?: number;
  studyStreakDays?: number;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (fullName: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchCurrentUser = async () => {
    try {
      const userData = await apiRequest<User>("/auth/me");
      setUser(userData);
    } catch (err) {
      // If token is invalid or expired, clear it
      localStorage.removeItem("synexora_token");
      setToken(null);
      setUser(null);
    }
  };

  useEffect(() => {
    const storedToken = localStorage.getItem("synexora_token");
    if (storedToken) {
      setToken(storedToken);
      fetchCurrentUser().finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const data = await apiRequest<{ token: string; user: User }>("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      localStorage.setItem("synexora_token", data.token);
      setToken(data.token);
      setUser(data.user);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (fullName: string, email: string, password: string) => {
    setIsLoading(true);
    try {
      const data = await apiRequest<{ token: string; user: User }>("/auth/register", {
        method: "POST",
        body: JSON.stringify({ fullName, email, password }),
      });
      localStorage.setItem("synexora_token", data.token);
      setToken(data.token);
      setUser(data.user);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("synexora_token");
    setToken(null);
    setUser(null);
  };

  const refreshUser = async () => {
    if (token) {
      await fetchCurrentUser();
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

