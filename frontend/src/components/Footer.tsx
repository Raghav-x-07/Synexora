"use client";

import React from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

export default function Footer() {
  const columns = [
    {
      title: "Platform",
      links: [
        { label: "AI Socratic Tutor", href: "#story" },
        { label: "Controlled Memory", href: "#memory" },
        { label: "RAG Knowledge Base", href: "#features" },
        { label: "Adaptive Scheduling", href: "#capabilities" },
        { label: "Diagnostic Practice", href: "#capabilities" },
      ],
    },
    {
      title: "Solutions",
      links: [
        { label: "For University Students", href: "#" },
        { label: "For Engineering Cohorts", href: "#" },
        { label: "For Study Groups", href: "#" },
        { label: "For Researchers", href: "#" },
      ],
    },
    {
      title: "Architecture",
      links: [
        { label: "Multi-Agent Hub", href: "#" },
        { label: "Vector Multitenancy", href: "#" },
        { label: "Controlled Memory Protocol", href: "#memory" },
        { label: "Spring Boot Core API", href: "#" },
      ],
    },
    {
      title: "Resources",
      links: [
        { label: "Documentation", href: "#" },
        { label: "API Reference", href: "#" },
        { label: "Product Roadmap", href: "#" },
        { label: "System Status", href: "#" },
      ],
    },
  ];

  return (
    <footer className="bg-[#042829] text-white pt-16 md:pt-24 pb-12 px-4 md:px-6 border-t border-white/10">
      <div className="max-w-[1360px] mx-auto space-y-16">
        
        {/* Main Footer Row */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
          
          {/* Brand Col */}
          <div className="md:col-span-4 space-y-4">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-[#B7F34A] flex items-center justify-center">
                <span className="w-3.5 h-3.5 rounded-sm bg-[#06383A] rotate-45" />
              </div>
              <span className="font-extrabold tracking-tight text-xl text-white">
                SYNEXORA
              </span>
            </Link>

            <p className="text-sm text-slate-300 max-w-sm leading-relaxed">
              Your Intelligent Student Operating System. Combining Socratic learning, controlled memory, contextual scheduling, and adaptive intelligence.
            </p>

            <div className="pt-2">
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-[#B7F34A]">
                <span className="w-2 h-2 rounded-full bg-[#B7F34A] animate-pulse" />
                All Intelligence Agents Operational
              </span>
            </div>
          </div>

          {/* Links Columns */}
          <div className="md:col-span-8 grid grid-cols-2 sm:grid-cols-4 gap-8">
            {columns.map((col) => (
              <div key={col.title} className="space-y-3">
                <h4 className="text-xs font-mono font-bold tracking-wider uppercase text-[#B7F34A]">
                  {col.title}
                </h4>
                <ul className="space-y-2 text-xs sm:text-sm">
                  {col.links.map((link) => (
                    <li key={link.label}>
                      <a
                        href={link.href}
                        className="text-slate-300 hover:text-white transition-colors"
                      >
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

        </div>

        {/* Bottom Legal Bar */}
        <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <p>© 2026 Synexora. Teach. Remember. Plan. Adapt. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <a href="#" className="hover:text-white transition-colors">
              Privacy Policy
            </a>
            <a href="#" className="hover:text-white transition-colors">
              Terms of Service
            </a>
            <a href="#" className="hover:text-white transition-colors">
              Security Policy
            </a>
          </div>
        </div>

      </div>
    </footer>
  );
}
