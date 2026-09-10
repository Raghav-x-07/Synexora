import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";

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
    <html lang="en">
      <body className="min-h-screen bg-[#F7F8F3] text-[#06383A] antialiased selection:bg-[#B7F34A] selection:text-[#06383A]">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
