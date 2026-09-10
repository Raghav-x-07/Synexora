"use client";

import React, { useState } from "react";
import { FileText, Upload, Search, BookOpen, CheckCircle2, ArrowRight } from "lucide-react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";

export default function RAGPage() {
  const documents = [
    { title: "CS301_Distributed_Systems_Full_Notes.pdf", chunks: 420, size: "4.8 MB", date: "2 days ago", status: "Indexed" },
    { title: "DBMS_Normalization_Formulas_2026.pdf", chunks: 180, size: "2.1 MB", date: "Yesterday", status: "Indexed" },
    { title: "Graph_Theory_Algorithm_Proofs.pdf", chunks: 310, size: "3.4 MB", date: "Last week", status: "Indexed" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="lime" pulse>Dense Vector RAG Engine</Badge>
            <span className="text-xs text-gray-500 font-mono">ChromaDB Partitioned</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#06383A] tracking-tight">
            Document Knowledge Base
          </h1>
        </div>

        <Button variant="dark" size="sm" icon={<Upload className="w-4 h-4 text-[#B7F34A]" />}>
          Upload Course Material
        </Button>
      </div>

      {/* Upload Drag & Drop Zone */}
      <div className="p-8 border-2 border-dashed border-[#06383A]/20 rounded-[28px] bg-white text-center space-y-3 hover:border-[#8FD63A] transition-colors cursor-pointer">
        <div className="w-12 h-12 rounded-2xl bg-[#F2F5EE] flex items-center justify-center mx-auto text-[#06383A]">
          <Upload className="w-6 h-6" />
        </div>
        <div className="text-sm font-bold text-[#06383A]">
          Drop lecture slides, syllabus PDFs, or textbook chapters here
        </div>
        <p className="text-xs text-gray-500">
          Supports PDF, DOCX, TXT, and Markdown (up to 15MB per file)
        </p>
      </div>

      {/* Indexed Documents Table */}
      <Card variant="light" className="p-6 space-y-4">
        <h3 className="font-bold text-base text-[#06383A] flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-[#8FD63A]" />
          Indexed Course Documents ({documents.length})
        </h3>

        <div className="divide-y divide-gray-100">
          {documents.map((doc, idx) => (
            <div key={idx} className="py-3 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-[#06383A]/70 shrink-0" />
                <div>
                  <div className="text-xs sm:text-sm font-bold text-[#06383A]">{doc.title}</div>
                  <div className="text-[11px] text-gray-400 font-mono">{doc.chunks} Chunks • {doc.size} • {doc.date}</div>
                </div>
              </div>
              <Badge variant="emerald">{doc.status}</Badge>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
