"use client";

export default function HighlightsDots() {
  const dots = [
    "bg-rose-400",
    "bg-amber-400",
    "bg-emerald-400",
    "bg-sky-400",
  ];
  return (
    <section className="mt-6">
      <h3 className="px-1 text-lg font-semibold">Destaques no MySnack</h3>
      <div className="mt-3 grid grid-cols-4 gap-4">
        {dots.map((c, i) => (
          <div
            key={i}
            className="flex flex-col items-center gap-2 rounded-2xl bg-white p-4 shadow-sm"
          >
            <span className={`h-10 w-10 rounded-full ${c}`} />
            <span className="h-2 w-8 rounded bg-gray-200" />
          </div>
        ))}
      </div>
    </section>
  );
}
