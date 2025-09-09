"use client";

export default function ReferBanner() {
  return (
    <section className="px-4 mt-5">
      <div className="rounded-3xl bg-gradient-to-br from-rose-500 via-orange-500 to-orange-400 text-white py-8 text-center shadow-md">
        <div className="text-2xl">🎁</div>
        <h3 className="text-2xl font-semibold">Ganhe descontos!</h3>
        <p className="opacity-90">Compartilhe e indique amigos</p>
        <div className="mt-4 grid grid-cols-2 gap-3 max-w-[520px] mx-auto">
          <button className="rounded-2xl bg-white/20 px-4 py-3">Instagram</button>
          <button className="rounded-2xl bg-white/20 px-4 py-3">Indicar</button>
        </div>
      </div>
    </section>
  );
}
