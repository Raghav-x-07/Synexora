"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { ArrowRight, Lock, Mail, Sparkles, ShieldCheck } from "lucide-react";
import Button from "@/components/ui/Button";

export default function LoginPage() {
  const router = useRouter();
  const { login, isLoading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      await login(email, password);
      router.push("/app");
    } catch (err: any) {
      setError(err.message || "Failed to log in. Please check your credentials.");
    }
  };

  return (
    <div className="min-h-screen bg-[#042829] text-white flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-radial-gradient from-[#B7F34A]/20 via-[#8FD63A]/10 to-transparent blur-[120px] pointer-events-none rounded-full" />

      <div className="relative z-10 w-full max-w-md bg-[#06383A] border border-white/10 rounded-[32px] p-8 sm:p-10 shadow-2xl space-y-6">
        
        {/* Brand Logo */}
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#B7F34A] flex items-center justify-center">
              <span className="w-3.5 h-3.5 rounded-sm bg-[#06383A] rotate-45" />
            </div>
            <span className="font-extrabold tracking-tight text-xl text-white">SYNEXORA</span>
          </Link>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Welcome Back</h1>
          <p className="text-xs text-slate-300">Sign in to your Student Operating System</p>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-300">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-mono uppercase tracking-wider text-slate-300 block">
              University Email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                placeholder="student@university.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#B7F34A]"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-mono uppercase tracking-wider text-slate-300 block">
                Password
              </label>
              <a href="#" className="text-[11px] text-[#B7F34A] hover:underline">Forgot password?</a>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#B7F34A]"
              />
            </div>
          </div>

          <Button
            variant="primary"
            size="md"
            disabled={isLoading}
            className="w-full py-3 text-sm font-bold text-[#06383A] mt-2 shadow-lg"
            icon={<ArrowRight className="w-4 h-4" />}
          >
            {isLoading ? "Signing In..." : "Sign In to Synexora"}
          </Button>
        </form>

        <div className="pt-4 border-t border-white/10 text-center text-xs text-slate-300">
          <span>Don't have an account? </span>
          <Link href="/register" className="text-[#B7F34A] font-bold hover:underline">
            Register for Free
          </Link>
        </div>

      </div>
    </div>
  );
}
