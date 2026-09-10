import React from "react";
import AppLayout from "@/components/app/AppLayout";

export const metadata = {
  title: "Dashboard Cockpit — Synexora",
  description: "Synexora Student Operating System Cockpit",
};

export default function StudentAppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppLayout>{children}</AppLayout>;
}
