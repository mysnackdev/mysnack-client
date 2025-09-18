
"use client";
import { Star, Clock3, MapPin } from "lucide-react";

export default function HeroQrBanner() {
  return (
    <section className="px-4 pt-3">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-orange-500 via-pink-500 to-rose-500 text-white">
        <div className="aspect-[16/9] md:aspect-[21/9] w-full p-5 flex flex-col justify-end">
          <h2 className="text-2xl md:text-3xl font-extrabold drop-shadow-[0_1px_1px_rgba(0,0,0,0.35)]">
            Peça pelo QR Code
          </h2>
          <p className="mt-1 text-sm md:text-base opacity-95">
            Cardápio digital, pedidos rápidos e entrega na mesa
          </p>
          <div className="mt-3 flex items-center gap-3 text-[13px] opacity-95">
            <span className="inline-flex items-center gap-1"><Star size={16}/> 4,8</span>
            <span className="inline-flex items-center gap-1"><Clock3 size={16}/> 25–35 min</span>
            <span className="inline-flex items-center gap-1"><MapPin size={16}/> Praça de Alimentação</span>
          </div>
        </div>
      </div>
    </section>
  );
}
