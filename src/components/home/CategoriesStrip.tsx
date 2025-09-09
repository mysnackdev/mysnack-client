"use client";

const CATS = ["Lanches", "Japonesa", "Pizza", "Doces", "Saudável", "Bebidas"];

export default function CategoriesStrip() {
  return (
    <section className="px-4 mt-4">
      <div className="flex gap-3 overflow-x-auto pb-1 no-scrollbar">
        {CATS.map((c) => (
          <button
            key={c}
            className="px-4 py-2 text-sm rounded-full bg-zinc-100 hover:bg-zinc-200 text-zinc-800 whitespace-nowrap"
          >
            {c}
          </button>
        ))}
      </div>
    </section>
  );
}
