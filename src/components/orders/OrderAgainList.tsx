"use client";
import Image from "next/image";

export type OrderAgainItem = {
  id: string;
  storeName: string;
  title: string;
};

export default function OrderAgainList({ items }: { items: OrderAgainItem[] }) {
  if (!items.length) return null;
  return (
    <section className="px-4 mt-6">
      <h3 className="text-xl font-semibold mb-3">Peça de novo</h3>
      <div className="rounded-2xl border border-zinc-200 bg-white shadow-sm">
        {items.slice(0, 1).map((it) => (
          <div key={it.id} className="p-4">
            <div className="flex items-center gap-3">
              <div className="relative w-10 h-10 rounded-full overflow-hidden ring-2 ring-zinc-200">
                <Image src="/placeholder-store.jpg" alt={it.storeName} fill sizes="40px" className="object-cover" />
              </div>
              <div className="font-medium">{it.storeName}</div>
            </div>
            <div className="mt-2 text-sm text-zinc-600">{it.title}</div>
            <button className="mt-4 w-full bg-pink-500 text-white py-3 rounded-2xl shadow">Adicionar à sacola</button>
          </div>
        ))}
      </div>
    </section>
  );
}
