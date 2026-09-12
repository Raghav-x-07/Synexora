"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight, Menu, X, Sparkles, Shield, Brain, Layers, GraduationCap } from "lucide-react";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "Platform", href: "#story" },
    { name: "Features", href: "#features" },
    { name: "Controlled Memory", href: "#memory" },
    { name: "Capabilities", href: "#capabilities" },
    { name: "How It Works", href: "#how-it-works" },
  ];

  return (
    <header className="fixed top-4 md:top-6 left-0 right-0 z-50 px-4 transition-all duration-300">
      <nav
        className={`max-w-[1120px] mx-auto bg-white/95 backdrop-blur-md rounded-full px-4 md:px-6 py-3 md:py-3.5 flex items-center justify-between border border-[#06383A]/10 shadow-[0_10px_30px_-10px_rgba(6,56,58,0.08),0_4px_12px_-4px_rgba(0,0,0,0.04)] transition-all duration-300 ${
          scrolled ? "shadow-[0_15px_35px_-10px_rgba(6,56,58,0.14)]" : ""
        }`}
      >
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-full bg-[#06383A] flex items-center justify-center transition-transform duration-300 group-hover:scale-105">
            <span className="w-3.5 h-3.5 rounded-sm bg-[#B7F34A] rotate-45 transition-transform duration-500 group-hover:rotate-90" />
          </div>
          <span className="font-extrabold tracking-tight text-lg text-[#06383A]">
            SYNEXORA
          </span>
        </Link>

        {/* Center Desktop Links */}
        <div className="hidden lg:flex items-center gap-7">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              className="text-[13.5px] font-medium text-[#06383A]/80 hover:text-[#06383A] transition-colors duration-200"
            >
              {link.name}
            </a>
          ))}
        </div>

        {/* Right CTA */}
        <div className="hidden md:flex items-center gap-3">
          <Link
            href="/login"
            className="text-[13px] font-medium text-[#06383A] hover:opacity-75 px-3 py-1.5 transition-opacity"
          >
            Log in
          </Link>
          <Link
            href="/app"
            className="btn-pill-dark px-4 py-2 text-[13px] font-semibold flex items-center gap-1.5 group"
          >
            <span>Get started</span>
            <ArrowRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-1" />
          </Link>
        </div>

        {/* Mobile Hamburger Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="lg:hidden p-2 text-[#06383A] hover:bg-[#06383A]/5 rounded-full transition-colors"
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </nav>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden max-w-[1120px] mx-auto mt-2 bg-white rounded-3xl p-6 border border-[#06383A]/10 shadow-2xl animate-in fade-in slide-in-from-top-4 duration-200">
          <div className="flex flex-col gap-4">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="text-base font-medium text-[#06383A] hover:text-[#8FD63A] py-1 border-b border-gray-100 transition-colors"
              >
                {link.name}
              </a>
            ))}
            <div className="pt-2 flex flex-col gap-2.5">
              <Link
                href="/app"
                onClick={() => setMobileMenuOpen(false)}
                className="btn-pill-primary w-full py-3 text-sm font-semibold text-[#06383A] text-center"
              >
                Get started →
              </Link>
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="btn-pill-outline w-full py-2.5 text-sm text-[#06383A] text-center"
              >
                Log in
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
