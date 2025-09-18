
"use client";
import React from "react";

export type OrderAgainItem = {
  id: string;
  storeName: string;
  title: string;
  price?: number | null;
};

export default function OrderAgainList({ items, onAdd }: { items: OrderAgainItem[]; onAdd: (item: OrderAgainItem) => void; }) {
  if (!items || items.length === 0) return null;
  const item = items[0];
  return (
    <section className="px-4 mt-6">
      <h3 className="text-lg font-semibold mb-3">Peça de novo</h3>
      <div className="rounded-2xl border border-zinc-200 p-4 flex items-center justify-between">
        <div className="pr-3">
          <div className="text-sm text-zinc-500">{item.storeName}</div>
          <div className="font-medium">{item.title}</div>
        </div>
        <button
          onClick={() => onAdd(item)}
          className="rounded-xl px-4 py-2 font-semibold bg-pink-500 text-white"
        >
          Adicionar à sacola
        </button>
      </div>
    </section>
  );
}
