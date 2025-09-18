
"use client";

type Cat = { key: string; name: string };

const CATS: Cat[] = [
  { key: "lanches", name: "Lanches" },
  { key: "japonesa", name: "Japonesa" },
  { key: "pizza", name: "Pizza" },
  { key: "doces", name: "Doces" },
  { key: "salgados", name: "Salgados" },
  { key: "saudavel", name: "Saudável" },
];

export default function CategoriesChips() {
  return (
    <section className="px-4 mt-3">
      <div className="no-scrollbar flex gap-3 overflow-x-auto pb-2">
        {CATS.map((c) => (
          <button
            key={c.key}
            className="flex w-[108px] shrink-0 flex-col items-center rounded-2xl bg-white p-3 shadow-sm ring-1 ring-zinc-100"
          >
            <div className="h-12 w-full rounded-xl bg-gradient-to-br from-orange-100 via-rose-100 to-yellow-100" />
            <div className="mt-2 text-sm">{c.name}</div>
          </button>
        ))}
      </div>
    </section>
  );
}
