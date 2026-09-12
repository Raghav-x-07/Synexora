"use client";

import React from "react";
import { useAuth } from "@/context/AuthContext";
import { User, Mail, GraduationCap, Flame, Shield, Award, LogOut } from "lucide-react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";

export default function ProfilePage() {
  const { user, logout } = useAuth();

  const getInitials = (name?: string) => {
    if (!name) return "ST";
    const parts = name.trim().split(" ");
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="lime">Verified Student Profile</Badge>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#06383A] tracking-tight">
            Student Profile
          </h1>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={logout}
          icon={<LogOut className="w-4 h-4 text-red-500" />}
          className="text-red-600 border-red-200 hover:bg-red-50"
        >
          Sign Out
        </Button>
      </div>

      <Card variant="light" className="p-6 sm:p-8 space-y-6">
        <div className="flex items-center gap-4 border-b border-gray-100 pb-6">
          <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-[#B7F34A] to-emerald-400 flex items-center justify-center text-[#06383A] font-extrabold text-2xl shrink-0">
            {getInitials(user?.fullName)}
          </div>
          <div>
            <h2 className="text-xl font-bold text-[#06383A]">{user?.fullName || "Student"}</h2>
            <p className="text-xs text-gray-500">
              {user?.major || "Academic Track"} • {user?.academicYear || "Enrolled"}
            </p>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="gray">GPA: {user?.gpa !== undefined ? user.gpa.toFixed(2) : "0.00"} / 4.0</Badge>
              <Badge variant="lime">🔥 {user?.studyStreakDays ?? 0}-Day Streak</Badge>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-[#F2F5EE] border border-[#06383A]/10 space-y-1">
            <span className="text-gray-400 font-mono uppercase block">Email Address</span>
            <span className="font-bold text-sm text-[#06383A]">{user?.email || "Not set"}</span>
          </div>

          <div className="p-4 rounded-xl bg-[#F2F5EE] border border-[#06383A]/10 space-y-1">
            <span className="text-gray-400 font-mono uppercase block">Account Role</span>
            <span className="font-bold text-sm text-[#06383A]">{user?.role || "ROLE_STUDENT"}</span>
          </div>
        </div>
      </Card>
    </div>
  );
}

