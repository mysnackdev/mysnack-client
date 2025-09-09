"use client";
import Image from "next/image";

export type HistoryCard = {
  id: string;
  dateLabel: string;
  storeName: string;
  status: string;
  numberLabel: string;
  title: string;
};

const Stars = () => (
  <div className="flex gap-1">
    {Array.from({ length: 5 }).map((_, i) => (
      <span key={i}>☆</span>
    ))}
  </div>
);

export default function HistoryList({ items }: { items: HistoryCard[] }) {
  if (!items.length) return null;
  // group by dateLabel
  const groups = items.reduce<Record<string, HistoryCard[]>>((acc, it) => {
    acc[it.dateLabel] = acc[it.dateLabel] || [];
    acc[it.dateLabel].push(it);
    return acc;
  }, {});

  return (
    <section className="px-4 mt-6 pb-10">
      <h3 className="text-xl font-semibold mb-3">Histórico</h3>
      {Object.entries(groups).map(([date, list]) => (
        <div key={date} className="mt-2">
          <div className="text-sm text-zinc-500">{date}</div>
          <div className="mt-3 space-y-3">
            {list.map((it) => (
              <div key={it.id} className="rounded-2xl border border-zinc-200 bg-white shadow-sm p-4">
                <div className="flex items-start gap-3">
                  <div className="relative w-10 h-10 rounded-full overflow-hidden ring-2 ring-zinc-200 flex-shrink-0">
                    <Image src="/placeholder-store.jpg" alt={it.storeName} fill sizes="40px" className="object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold">{it.storeName}</div>
                    <div className="text-sm text-zinc-600 flex items-center gap-2">
                      <span className="text-green-600">●</span>
                      {it.status} • Nº {it.numberLabel}
                    </div>
                    <div className="mt-2 text-sm text-zinc-700">{it.title}</div>
                    <div className="mt-4">
                      <div className="text-sm mb-1">Avaliação</div>
                      <Stars />
                    </div>
                    <div className="mt-4 flex items-center gap-3">
                      <button className="flex-1 py-3 rounded-2xl border border-pink-200 text-pink-600">Ajuda</button>
                      <button className="flex-[2] py-3 rounded-2xl bg-pink-500 text-white">Adicionar à sacola</button>
                    </div>
                  </div>
                  <div className="text-zinc-400">›</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </section>
  );
}
