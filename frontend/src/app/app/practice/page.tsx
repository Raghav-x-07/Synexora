"use client";

import React, { useState } from "react";
import { Sparkles, Target, CheckCircle2, ChevronRight, Award } from "lucide-react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";

export default function PracticePage() {
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const question = {
    course: "CS220 • DBMS Normalization",
    difficulty: "Medium",
    text: "Given relation R(A, B, C, D) with functional dependencies { A -> B, B -> C, C -> D, D -> A }. In which normal form is relation R?",
    options: [
      "1NF only",
      "2NF only",
      "3NF but not BCNF",
      "BCNF",
    ],
    correctIndex: 3,
    explanation: "Since every single attribute can derive all other attributes (A->B->C->D->A), every single attribute is a candidate key / superkey. Thus for every functional dependency X -> Y, X is a superkey, satisfying BCNF.",
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="lime" pulse>Adaptive Difficulty Engine</Badge>
            <span className="text-xs text-gray-500 font-mono">Streak: 6 Correct</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#06383A] tracking-tight">
            Adaptive Practice & Diagnostics
          </h1>
        </div>

        <Button variant="dark" size="sm" icon={<Sparkles className="w-4 h-4 text-[#B7F34A]" />}>
          Generate Next Problem
        </Button>
      </div>

      <Card variant="light" className="p-6 sm:p-8 space-y-6">
        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
          <span className="text-xs font-mono font-bold uppercase text-[#8FD63A]">{question.course}</span>
          <Badge variant="amber">Difficulty: {question.difficulty}</Badge>
        </div>

        <p className="text-base sm:text-lg font-bold text-[#06383A] leading-relaxed">
          {question.text}
        </p>

        <div className="space-y-3">
          {question.options.map((opt, i) => (
            <button
              key={i}
              onClick={() => !submitted && setSelectedOption(i)}
              className={`w-full p-4 rounded-2xl border text-left text-sm font-medium transition-all flex items-center justify-between ${
                selectedOption === i
                  ? "border-[#06383A] bg-[#06383A] text-white shadow-md"
                  : "border-gray-200 bg-white hover:bg-gray-50 text-[#06383A]"
              } ${
                submitted && i === question.correctIndex ? "!border-emerald-500 !bg-emerald-50 !text-emerald-900 font-bold" : ""
              }`}
            >
              <span>{String.fromCharCode(65 + i)}. {opt}</span>
              {submitted && i === question.correctIndex && <CheckCircle2 className="w-5 h-5 text-emerald-600" />}
            </button>
          ))}
        </div>

        {!submitted ? (
          <Button
            variant="primary"
            size="md"
            disabled={selectedOption === null}
            onClick={() => setSubmitted(true)}
          >
            Submit Answer for Diagnostic Analysis
          </Button>
        ) : (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-2 animate-in fade-in">
            <div className="font-bold text-sm text-emerald-900 flex items-center gap-1.5">
              <Award className="w-4 h-4 text-emerald-700" />
              Correct! Diagnostic Explanation:
            </div>
            <p className="text-xs text-emerald-800 leading-relaxed">{question.explanation}</p>
          </div>
        )}
      </Card>
    </div>
  );
}
