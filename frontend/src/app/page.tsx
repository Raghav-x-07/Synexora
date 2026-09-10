"use client";

import React from "react";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import TrustSection from "@/components/TrustSection";
import AIIntro from "@/components/AIIntro";
import FeatureStory from "@/components/FeatureStory";
import FeatureCardGrid from "@/components/FeatureCardGrid";
import MemorySection from "@/components/MemorySection";
import Capabilities from "@/components/Capabilities";
import HowItWorks from "@/components/HowItWorks";
import UseCases from "@/components/UseCases";
import Stats from "@/components/Stats";
import CTA from "@/components/CTA";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#F7F8F3] text-[#06383A] selection:bg-[#B7F34A] selection:text-[#06383A]">
      {/* Floating Pill Navbar */}
      <Navbar />

      {/* Main Continuous Landing Page Flow */}
      <main>
        {/* 1. Hero Section */}
        <Hero />

        {/* 2. Trust & Social Proof Logos */}
        <TrustSection />

        {/* 3. AI Intro Full-Width Lime Statement */}
        <AIIntro />

        {/* 4. Scroll-Driven Feature Storytelling */}
        <FeatureStory />

        {/* 5. Asymmetric Feature Card System */}
        <FeatureCardGrid />

        {/* 6. Controlled Memory Hero Showcase */}
        <MemorySection />

        {/* 7. Product / AI Capabilities Grid */}
        <Capabilities />

        {/* 8. How It Works 3-Step Lifecycle */}
        <HowItWorks />

        {/* 9. Tailored Use Cases */}
        <UseCases />

        {/* 10. Proof & Statistics */}
        <Stats />

        {/* 11. Final Dramatic CTA */}
        <CTA />
      </main>

      {/* 12. Minimalist Footer */}
      <Footer />
    </div>
  );
}
