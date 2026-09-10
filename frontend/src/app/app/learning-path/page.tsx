"use client";

import React from "react";
import { MapPin, CheckCircle2, Circle, ArrowRight, Sparkles } from "lucide-react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";

export default function LearningPathPage() {
  const steps = [
    { title: "Functional Dependencies & Armstrong Axioms", status: "Completed", desc: "Soundness and completeness of Armstrong Axioms verified." },
    { title: "BCNF Decomposition vs 3NF Synthesis", status: "Completed", desc: "Learned lossless join and dependency preservation trade-offs." },
    { title: "Cost-Based Query Execution Plans & Heuristics", status: "Active", desc: "Currently practicing relational algebra operator pushing." },
    { title: "Transaction Concurrency & Strict 2PL Protocol", status: "Upcoming", desc: "Scheduled for next week before midterm exam." },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="lime">Dynamic Adaptive Engine</Badge>
            <span className="text-xs text-gray-500 font-mono">Tailored to Target: 85%+</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#06383A] tracking-tight">
            Adaptive Learning Trajectory
          </h1>
        </div>
      </div>

      <Card variant="light" className="p-6 sm:p-8 space-y-6">
        <div className="border-b border-gray-100 pb-4">
          <h2 className="text-lg font-bold text-[#06383A]">Database Systems & Architecture Roadmap</h2>
          <p className="text-xs text-gray-500">Personalized learning path automatically adapted based on your 72/100 score on midterms.</p>
        </div>

        <div className="relative border-l-2 border-[#B7F34A] ml-4 pl-6 space-y-8">
          {steps.map((step, idx) => (
            <div key={idx} className="relative space-y-1">
              <div
                className={`absolute -left-[31px] top-1 w-4 h-4 rounded-full border-2 border-white ${
                  step.status === "Completed"
                    ? "bg-emerald-500"
                    : step.status === "Active"
                    ? "bg-[#B7F34A] animate-pulse"
                    : "bg-gray-300"
                }`}
              />
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-[#06383A]">{step.title}</span>
                <Badge variant={step.status === "Completed" ? "emerald" : step.status === "Active" ? "lime" : "gray"}>
                  {step.status}
                </Badge>
              </div>
              <p className="text-xs text-gray-600">{step.desc}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
