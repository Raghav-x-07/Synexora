"use client";

import React, { useRef } from "react";
import { motion, useInView } from "framer-motion";

export default function AIIntro() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: false, amount: 0.3 });

  const statement = "Synexora is an AI teammate that understands, collaborates, and gets work done.";
  const words = statement.split(" ");

  return (
    <section className="py-24 md:py-36 px-4 md:px-6">
      <div className="max-w-[1360px] mx-auto">
        <div
          ref={ref}
          className="relative bg-[#B7F34A] rounded-[32px] md:rounded-[44px] px-6 sm:px-12 md:px-20 py-20 md:py-32 flex flex-col items-center justify-center text-center overflow-hidden shadow-sm"
        >
          {/* Subtle Ambient Radial Shimmer */}
          <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-white/20 rounded-full blur-[100px] pointer-events-none" />

          {/* Section Subtitle */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#06383A]/10 text-[#06383A] text-xs md:text-[13px] font-bold tracking-wider uppercase mb-8">
            <span>Core Intelligence Architecture</span>
          </div>

          {/* Animated Statement with Word Stagger */}
          <h2 className="text-3xl sm:text-5xl md:text-6xl lg:text-[70px] font-extrabold text-[#06383A] tracking-tight leading-[1.12] max-w-5xl">
            {words.map((word, index) => {
              const isAccent = word.toLowerCase().includes("understands") || word.toLowerCase().includes("collaborates") || word.toLowerCase().includes("done.");
              return (
                <motion.span
                  key={index}
                  initial={{ opacity: 0.3, y: 15 }}
                  animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0.3, y: 15 }}
                  transition={{ duration: 0.45, delay: index * 0.05 }}
                  className={`inline-block mr-[0.28em] last:mr-0 ${
                    isAccent ? "underline decoration-[#06383A]/30 underline-offset-8" : ""
                  }`}
                >
                  {word}
                </motion.span>
              );
            })}
          </h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="mt-8 text-base sm:text-xl text-[#06383A]/80 max-w-2xl font-medium leading-relaxed"
          >
            A unified intelligence layer designed from the ground up for academic excellence, deep context retention, and autonomous student productivity.
          </motion.p>
        </div>
      </div>
    </section>
  );
}
