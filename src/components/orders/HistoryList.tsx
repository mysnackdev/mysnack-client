
"use client";
import React from "react";

export type HistoryCard = {
  id: string;
  dateLabel: string;
  storeName: string;
  statusLabel: string;
  itemsSummary?: string;
  price?: number | null;
  rating?: number | null;
};

export default function HistoryList({ items }: { items: HistoryCard[] }) {
  if (!items || items.length === 0) return null;
  return (
    <section className="px-4">
      {items.map((it) => (
        <div key={it.id} className="mb-4">
          <div className="text-sm text-zinc-500 mb-2">{it.dateLabel}</div>
          <div className="rounded-2xl border border-zinc-200 bg-white">
            <div className="p-4">
              <div className="font-medium">{it.storeName}</div>
              <div className="mt-1 text-sm text-emerald-600">{it.statusLabel}</div>
              {it.itemsSummary && <div className="mt-2 text-sm text-zinc-700">{it.itemsSummary}</div>}
            </div>
            <div className="px-4 pb-4 flex items-center justify-between gap-2">
              <button className="rounded-xl border border-pink-400 text-pink-600 px-4 py-2">Ajuda</button>
              <button className="rounded-xl bg-pink-500 text-white px-4 py-2">Adicionar à sacola</button>
            </div>
          </div>
        </div>
      ))}
    </section>
  );
}
