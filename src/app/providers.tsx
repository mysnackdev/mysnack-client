"use client";
import React from "react";
import { AuthProvider } from "@/hooks/useAuth";
import { MallProvider } from "@/context/MallContext";
import { ThemeProvider } from "@/context/ThemeContext";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <AuthProvider>
        <MallProvider>{children}</MallProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
