"use client";

import React, { useState } from "react";
import { CheckSquare, Plus, Filter, Calendar, AlertCircle, CheckCircle2 } from "lucide-react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";

export default function TasksPage() {
  const [tasks, setTasks] = useState([
    { id: 1, title: "Submit Distributed Systems Project Draft", course: "CS301", dueDate: "Friday, 23:59", priority: "HIGH", done: false },
    { id: 2, title: "Complete BCNF Decomposition Practice Set", course: "CS220", dueDate: "Tomorrow, 18:00", priority: "HIGH", done: false },
    { id: 3, title: "Review Bellman-Ford Shortest Path Proof", course: "CS240", dueDate: "Monday, 12:00", priority: "MEDIUM", done: true },
    { id: 4, title: "Draft AI Ethics Weekly Diary Reflection", course: "GEN101", dueDate: "Sunday, 20:00", priority: "LOW", done: false },
  ]);

  const toggleTask = (id: number) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, done: !t.done } : t));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="lime">Context-Aware Planner</Badge>
            <span className="text-xs text-gray-500 font-mono">Synced with Calendar</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#06383A] tracking-tight">
            Tasks & Deadlines
          </h1>
        </div>

        <Button variant="dark" size="sm" icon={<Plus className="w-4 h-4 text-[#B7F34A]" />}>
          Create Task
        </Button>
      </div>

      <div className="space-y-3">
        {tasks.map((task) => (
          <Card key={task.id} variant="light" className="p-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <button
                onClick={() => toggleTask(task.id)}
                className={`w-6 h-6 rounded-lg border flex items-center justify-center transition-colors ${
                  task.done ? "bg-emerald-500 border-emerald-500 text-white" : "border-gray-300 hover:border-[#06383A]"
                }`}
              >
                {task.done && <CheckCircle2 className="w-4 h-4" />}
              </button>
              <div>
                <div className={`text-sm font-bold ${task.done ? "line-through text-gray-400" : "text-[#06383A]"}`}>
                  {task.title}
                </div>
                <div className="text-xs text-gray-500 flex items-center gap-2 mt-0.5">
                  <span className="font-mono font-bold text-[#06383A]/70">{task.course}</span>
                  <span>•</span>
                  <span>Due: {task.dueDate}</span>
                </div>
              </div>
            </div>

            <Badge variant={task.priority === "HIGH" ? "amber" : "gray"}>
              {task.priority}
            </Badge>
          </Card>
        ))}
      </div>
    </div>
  );
}
