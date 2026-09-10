"use client";

import React from "react";
import { User, Mail, GraduationCap, Flame, Shield, Award } from "lucide-react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";

export default function ProfilePage() {
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
      </div>

      <Card variant="light" className="p-6 sm:p-8 space-y-6">
        <div className="flex items-center gap-4 border-b border-gray-100 pb-6">
          <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-[#B7F34A] to-emerald-400 flex items-center justify-center text-[#06383A] font-extrabold text-2xl">
            AR
          </div>
          <div>
            <h2 className="text-xl font-bold text-[#06383A]">Alex Rivera</h2>
            <p className="text-xs text-gray-500">Computer Science & Engineering • Year 3</p>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="gray">GPA: 3.85 / 4.0</Badge>
              <Badge variant="lime">🔥 14-Day Streak</Badge>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-[#F2F5EE] border border-[#06383A]/10 space-y-1">
            <span className="text-gray-400 font-mono uppercase block">Email Address</span>
            <span className="font-bold text-sm text-[#06383A]">alex.rivera@university.edu</span>
          </div>

          <div className="p-4 rounded-xl bg-[#F2F5EE] border border-[#06383A]/10 space-y-1">
            <span className="text-gray-400 font-mono uppercase block">Learning Style Preference</span>
            <span className="font-bold text-sm text-[#06383A]">Interactive Code Traces & Socratic Hints</span>
          </div>
        </div>
      </Card>
    </div>
  );
}
