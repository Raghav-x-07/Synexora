"use client";

import React from "react";
import { BarChart3, TrendingUp, Award, Layers, Clock, CheckCircle2 } from "lucide-react";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import MetricTile from "@/components/ui/MetricTile";

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="lime">Academic Intelligence Analytics</Badge>
            <span className="text-xs text-gray-500 font-mono">Cohort Percentile: 94th</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#06383A] tracking-tight">
            Performance & Mastery Insights
          </h1>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <MetricTile label="Overall Mastery" value="84%" change="+4.2%" sublabel="Across all active subjects" theme="lime" />
        <MetricTile label="Total Practice Problems" value="142" change="+28 this week" sublabel="89% accuracy rate" theme="light" />
        <MetricTile label="Total Study Time" value="114 hrs" change="Top 10%" sublabel="Current semester total" theme="dark" />
      </div>

      {/* Subject Breakdown Cards */}
      <Card variant="light" className="p-6 space-y-5">
        <h3 className="font-bold text-base text-[#06383A] flex items-center gap-2">
          <Layers className="w-4 h-4 text-[#8FD63A]" />
          Subject Mastery Index
        </h3>

        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-xs font-bold text-[#06383A] mb-1.5">
              <span>CS301 Distributed Systems</span>
              <span>92%</span>
            </div>
            <div className="w-full h-2.5 rounded-full bg-gray-100 overflow-hidden">
              <div className="h-full bg-[#B7F34A] rounded-full" style={{ width: "92%" }} />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs font-bold text-[#06383A] mb-1.5">
              <span>CS240 Graph Theory & Algorithms</span>
              <span>88%</span>
            </div>
            <div className="w-full h-2.5 rounded-full bg-gray-100 overflow-hidden">
              <div className="h-full bg-[#8FD63A] rounded-full" style={{ width: "88%" }} />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs font-bold text-[#06383A] mb-1.5">
              <span>CS220 Database Management Systems</span>
              <span>72% (Target: 85%+)</span>
            </div>
            <div className="w-full h-2.5 rounded-full bg-gray-100 overflow-hidden">
              <div className="h-full bg-amber-500 rounded-full" style={{ width: "72%" }} />
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
