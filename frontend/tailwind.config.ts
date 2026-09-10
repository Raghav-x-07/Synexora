import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/data/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        dark: {
          DEFAULT: "#073F40",
          deep: "#06383A",
          surface: "#094748",
          darker: "#042829",
          card: "rgba(7, 63, 64, 0.7)",
        },
        lime: {
          DEFAULT: "#B7F34A",
          hover: "#A6E838",
          light: "#CEF77D",
          dim: "#8FD63A",
          glow: "rgba(183, 243, 74, 0.15)",
        },
        brand: {
          green: "#8FD63A",
          offwhite: "#F7F8F3",
          lightgray: "#EBEFEA",
          muted: "#8A9690",
          border: "rgba(255, 255, 255, 0.12)",
          borderDark: "rgba(6, 56, 58, 0.12)",
        },
      },
      borderRadius: {
        "4xl": "2rem",
        "5xl": "2.5rem",
      },
      fontFamily: {
        sans: [
          "var(--font-inter)",
          "system-ui",
          "-apple-system",
          "BlinkMacSystemFont",
          "'Segoe UI'",
          "Roboto",
          "sans-serif",
        ],
      },
      letterSpacing: {
        tighter: "-0.04em",
        tight: "-0.02em",
      },
      boxShadow: {
        pill: "0 10px 30px -10px rgba(6, 56, 58, 0.12), 0 4px 12px -4px rgba(0, 0, 0, 0.06)",
        card: "0 20px 40px -15px rgba(6, 56, 58, 0.08)",
        glow: "0 0 60px 10px rgba(183, 243, 74, 0.25)",
      },
    },
  },
  plugins: [],
};

export default config;
