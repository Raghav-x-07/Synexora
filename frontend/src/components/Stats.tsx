"use client";

import React from "react";

export default function Stats() {
  const metrics = [
    {
      value: "10x",
      label: "Faster information synthesis",
      sub: "Instant syllabus & slide grounding",
    },
    {
      value: "24/7",
      label: "Autonomous AI guidance",
      sub: "Socratic problem deconstruction",
    },
    {
      value: "1",
      label: "Unified student operating system",
      sub: "Replaces 6 fragmented apps",
    },
    {
      value: "100%",
      label: "User-controlled memory",
      sub: "Explicit Save / Ignore privacy",
    },
  ];

  return (
    <section className="py-16 md:py-24 px-4 md:px-6">
      <div className="max-w-[1360px] mx-auto">
        <div className="bg-white rounded-[32px] md:rounded-[44px] p-8 sm:p-12 md:p-16 border border-[#06383A]/10 shadow-sm">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 divide-y lg:divide-y-0 lg:divide-x divide-[#06383A]/10">
            {metrics.map((metric, i) => (
              <div
                key={i}
                className={`pt-6 lg:pt-0 ${
                  i > 0 ? "lg:pl-8" : ""
                } space-y-2 flex flex-col justify-between`}
              >
                <div>
                  <span className="text-5xl sm:text-6xl font-black text-[#06383A] tracking-tighter block font-mono">
                    {metric.value}
                  </span>
                  <span className="text-base font-bold text-[#06383A] block mt-2">
                    {metric.label}
                  </span>
                </div>
                <span className="text-xs text-[#06383A]/60 font-medium">
                  {metric.sub}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
