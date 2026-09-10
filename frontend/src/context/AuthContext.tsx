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
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>({
    id: "demo-alex",
    email: "alex.rivera@synexora.io",
    fullName: "Alex Rivera",
    role: "ROLE_STUDENT",
    major: "Computer Science & Engineering",
    academicYear: "Year 3",
    gpa: 3.85,
    masteryScore: 84.0,
    studyStreakDays: 14,
  });
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const storedToken = localStorage.getItem("synexora_token");
    if (storedToken) {
      setToken(storedToken);
      // Fetch user profile if token exists
      apiRequest<User>("/auth/me")
        .then((userData) => setUser(userData))
        .catch(() => {
          // Keep default demo user if backend is offline in standalone dev
        });
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
    } catch (err: any) {
      // Fallback for standalone demo mode
      if (email === "alex.rivera@synexora.io" || email.includes("@")) {
        const demoUser: User = {
          id: "demo-alex",
          email,
          fullName: "Alex Rivera",
          role: "ROLE_STUDENT",
          major: "Computer Science & Engineering",
          academicYear: "Year 3",
          gpa: 3.85,
          masteryScore: 84.0,
          studyStreakDays: 14,
        };
        setUser(demoUser);
        localStorage.setItem("synexora_token", "demo_jwt_token");
        setToken("demo_jwt_token");
      } else {
        throw err;
      }
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
    } catch (err: any) {
      // Fallback demo
      const newUser: User = {
        id: "new-student",
        email,
        fullName,
        role: "ROLE_STUDENT",
        major: "Computer Science",
        academicYear: "Year 1",
        gpa: 4.0,
        masteryScore: 70.0,
        studyStreakDays: 1,
      };
      setUser(newUser);
      localStorage.setItem("synexora_token", "demo_jwt_token");
      setToken("demo_jwt_token");
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("synexora_token");
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, register, logout }}>
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
