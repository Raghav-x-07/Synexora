"use client";

import React from "react";
import { FileCheck2, Award, ArrowRight, Clock, Plus } from "lucide-react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";

export default function AssessmentsPage() {
  const assessments = [
    { title: "Distributed Systems Raft & Paxos Evaluation", score: "92%", questions: 15, date: "Sep 07, 2026", status: "Completed" },
    { title: "DBMS Relational Algebra & SQL Mock Assessment", score: "72%", questions: 20, date: "Sep 03, 2026", status: "Completed" },
    { title: "Graph Theory Shortest Path Diagnostic Exam", score: "Pending", questions: 12, date: "Scheduled for Monday", status: "Upcoming" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="lime">Mastery Diagnostic</Badge>
            <span className="text-xs text-gray-500 font-mono">Continuous Evaluation</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#06383A] tracking-tight">
            Academic Assessments
          </h1>
        </div>

        <Button variant="dark" size="sm" icon={<Plus className="w-4 h-4 text-[#B7F34A]" />}>
          Generate Custom Assessment
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {assessments.map((a, i) => (
          <Card key={i} variant="light" className="p-6 flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between mb-3">
                <Badge variant={a.status === "Completed" ? "emerald" : "gray"}>{a.status}</Badge>
                <span className="text-xs text-gray-400 font-mono">{a.date}</span>
              </div>
              <h3 className="font-bold text-sm text-[#06383A] mb-2">{a.title}</h3>
              <span className="text-xs text-gray-500">{a.questions} Questions</span>
            </div>

            <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase text-gray-400 block font-mono">Score</span>
                <span className="text-xl font-black font-mono text-[#06383A]">{a.score}</span>
              </div>
              <Button variant="outline" size="sm">
                Review Breakdown
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
