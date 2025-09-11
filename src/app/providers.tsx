"use client";
import React from "react";
import { AuthProvider } from "@/hooks/useAuth";
import { MallProvider } from "@/context/MallContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { NotificationsProvider } from "@/context/NotificationsContext";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <AuthProvider>
        <MallProvider><NotificationsProvider>{children}</NotificationsProvider></MallProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
