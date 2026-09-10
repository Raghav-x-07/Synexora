"use client";

import React from "react";
import { Settings, Shield, Bell, Key, Database, Moon } from "lucide-react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="lime">Preferences & Security</Badge>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#06383A] tracking-tight">
            Workspace Settings
          </h1>
        </div>
      </div>

      <div className="space-y-4">
        <Card variant="light" className="p-6 space-y-4">
          <h3 className="font-bold text-base text-[#06383A] flex items-center gap-2">
            <Shield className="w-4 h-4 text-[#8FD63A]" />
            Controlled Memory & Privacy Controls
          </h3>
          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between p-3 rounded-xl bg-[#F2F5EE] border border-[#06383A]/10">
              <div>
                <span className="font-bold text-[#06383A] block">Candidate Memory Confirmation</span>
                <span className="text-gray-500">Require explicit student approval before saving any detected fact.</span>
              </div>
              <Badge variant="emerald">Always Enabled (Strict)</Badge>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-[#F2F5EE] border border-[#06383A]/10">
              <div>
                <span className="font-bold text-[#06383A] block">Vector Multitenancy Partitioning</span>
                <span className="text-gray-500">Isolate study document chunks strictly by authenticated user ID.</span>
              </div>
              <Badge variant="emerald">Active</Badge>
            </div>
          </div>
        </Card>

        <Card variant="light" className="p-6 space-y-4">
          <h3 className="font-bold text-base text-[#06383A] flex items-center gap-2">
            <Bell className="w-4 h-4 text-[#8FD63A]" />
            Contextual Notification Settings
          </h3>
          <p className="text-xs text-gray-500">Receive proactive reminders before deadlines and when diagnostic test practice is recommended.</p>
        </Card>
      </div>
    </div>
  );
}
