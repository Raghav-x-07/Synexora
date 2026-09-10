"use client";

import React from "react";

export default function TrustSection() {
  const brands = [
    { name: "STANFORD", icon: "◬", sub: "RESEARCH" },
    { name: "MIT LABS", icon: "◈", sub: "AI LAB" },
    { name: "CAMBRIDGE", icon: "✦", sub: "COMPUTING" },
    { name: "BERKELEY", icon: "▲", sub: "ENGINEERING" },
    { name: "OXFORD", icon: "❖", sub: "SYSTEMS" },
    { name: "ETH ZURICH", icon: "⬡", sub: "DATA" },
  ];

  return (
    <section className="py-12 md:py-16 px-4 md:px-6">
      <div className="max-w-[1360px] mx-auto">
        <div className="text-center mb-8">
          <p className="text-xs md:text-sm font-semibold tracking-widest uppercase text-[#06383A]/60">
            Trusted by top engineering cohorts, researchers & ambitious students
          </p>
        </div>

        {/* Minimalist Grid with Subtle Borders */}
        <div className="border border-[#06383A]/10 rounded-2xl bg-white/50 backdrop-blur-sm overflow-hidden">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 divide-x divide-y md:divide-y-0 divide-[#06383A]/10">
            {brands.map((brand, idx) => (
              <div
                key={brand.name}
                className="py-6 px-4 flex flex-col items-center justify-center gap-1.5 hover:bg-[#06383A]/[0.02] transition-colors group cursor-default"
              >
                <span className="text-xl text-[#06383A]/40 group-hover:text-[#8FD63A] transition-colors">
                  {brand.icon}
                </span>
                <span className="font-extrabold tracking-wider text-xs md:text-[13px] text-[#06383A]/80 group-hover:text-[#06383A] transition-colors">
                  {brand.name}
                </span>
                <span className="text-[9px] font-mono tracking-widest text-[#06383A]/40 uppercase">
                  {brand.sub}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
