"use client";
import React from "react";

export function Toast({ message }: { message: string }) {
  if (!message) return null;
  return (
    <div className="fixed bottom-20 left-1/2 -translate-x-1/2 bg-black text-white px-4 py-2 rounded-lg shadow z-50 text-sm">
      {message}
    </div>
  );
}
