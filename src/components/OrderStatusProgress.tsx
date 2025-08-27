"use client";

import React from "react";
import { ORDER_STATUS_FLOW, statusIndex } from "@/constants/order-status";

type Props = { status: string };

export default function OrderStatusProgress({ status }: Props) {
  const idx = Math.max(0, statusIndex(status));
  const total = ORDER_STATUS_FLOW.length;
  return (
    <div className="mt-2">
      <ol className="grid grid-cols-6 gap-2">
        {ORDER_STATUS_FLOW.map((s, i) => {
          const done = i <= idx;
          return (
            <li key={s} className="flex items-center gap-2">
              <span className={"h-2 w-2 rounded-full " + (done ? "bg-green-600" : "bg-zinc-300")} />
              <span className={"text-[11px] leading-none " + (done ? "text-green-700 font-medium" : "text-zinc-500")}>
                {s}
              </span>
            </li>
          );
        })}
      </ol>
      <div className="mt-2 h-1 w-full rounded bg-zinc-200">
        <div
          className="h-1 rounded bg-green-600 transition-all"
          style={{ width: `${((idx + 1) / total) * 100}%` }}
        />
      </div>
    </div>
  );
}
