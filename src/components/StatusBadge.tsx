"use client";
import React from "react";
import { statusIndex } from "@/constants/order-status";

type Props = { status: string };

export default function StatusBadge({ status }: Props) {
  const idx = statusIndex(status); // sem any
  const colors = [
    "bg-zinc-200 text-zinc-800",   // pedido realizado
    "bg-blue-200 text-blue-800",   // pedido confirmado
    "bg-amber-200 text-amber-900", // sendo preparado
    "bg-violet-200 text-violet-900", // pronto
    "bg-cyan-200 text-cyan-900",   // indo até você
    "bg-green-200 text-green-800", // entregue
  ] as const;

  const safeIdx = Math.max(0, Math.min(colors.length - 1, idx));
  const klass = colors[safeIdx] ?? colors[0];

  return (
    <span className={`inline-block rounded-full px-2 py-0.5 text-xs ${klass}`}>
      {status}
    </span>
  );
}
