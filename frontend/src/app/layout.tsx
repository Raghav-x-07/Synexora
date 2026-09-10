import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Synexora — Your Intelligent Student Operating System",
  description:
    "Synexora combines personalized learning, AI tutoring, controlled memory, productivity management, scheduling, assessments, and adaptive learning into one unified student intelligence platform.",
  keywords: [
    "Synexora",
    "Student Operating System",
    "AI Tutor",
    "RAG Study Assistant",
    "Controlled Memory",
    "Adaptive Learning",
    "Student Intelligence",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-[#07090e] text-slate-100 antialiased selection:bg-indigo-500/30 selection:text-indigo-200">
        {children}
      </body>
    </html>
  );
}
