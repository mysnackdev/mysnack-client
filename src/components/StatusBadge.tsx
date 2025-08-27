"use client";
import React from "react";
import { ORDER_STATUS_FLOW } from "@/constants/order-status";

export default function StatusBadge({ status }: { status: string }) {
  const idx = ORDER_STATUS_FLOW.indexOf(status as any);
  const colors = [
    "bg-zinc-200 text-zinc-800",
    "bg-blue-200 text-blue-800",
    "bg-amber-200 text-amber-900",
    "bg-violet-200 text-violet-900",
    "bg-cyan-200 text-cyan-900",
    "bg-green-200 text-green-800",
  ];
  const klass = colors[Math.max(0, Math.min(colors.length - 1, idx))] || "bg-zinc-200 text-zinc-800";
  return <span className={`inline-block rounded-full px-2 py-0.5 text-xs ${klass}`}>{status}</span>;
}
