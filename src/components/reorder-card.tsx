"use client";

import React from "react";

type Props = {
  brand: string;
  itemTitle: string;
  onAddToBag: () => void;
};

export default function ReorderCard({ brand, itemTitle, onAddToBag }: Props) {
  return (
    <div className="rounded-2xl border bg-white shadow-sm">
      <div className="p-4 flex items-start gap-3">
        <div className="w-9 h-9 rounded-full bg-gray-200 shrink-0" />
        <div className="flex-1">
          <div className="text-[15px] font-semibold">{brand}</div>
          <div className="text-sm text-muted-foreground">{itemTitle}</div>
        </div>
      </div>
      <button
        onClick={onAddToBag}
        className="w-full rounded-b-2xl py-3 font-semibold hover:opacity-95 transition"
        style={{ background: "linear-gradient(90deg,#ff63a0,#ff2bb5)" }}
      >
        Adicionar à sacola
      </button>
    </div>
  );
}
