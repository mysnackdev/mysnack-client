"use client";

import Image from "next/image";
import { Star, Timer, Utensils } from "lucide-react";

export default function HeroQR() {
  return (
    <section className="mt-4">
      <div className="relative overflow-hidden rounded-3xl shadow-xl">
        {/* BG image (coloque um arquivo em /public/hero.jpg se quiser igual ao print) */}
        <div className="relative h-56 w-full sm:h-64">
          <Image
            src="/hero.jpg"
            alt="Burger destaque"
            fill
            priority
            className="object-cover"
            onError={(e) => {
              // fallback visual se não existir hero.jpg
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-black/10" />
        </div>

        {/* content */}
        <div className="absolute inset-0 flex flex-col justify-between p-5 text-white">
          <div className="space-y-1">
            <h2 className="text-2xl font-bold drop-shadow">Peça pelo QR Code</h2>
            <p className="max-w-md text-sm opacity-90">
              Cardápio digital, pedidos rápidos e entrega na mesa
            </p>
          </div>
          <div className="flex items-center gap-4 text-sm font-medium drop-shadow">
            <span className="inline-flex items-center gap-1">
              <Star className="h-4 w-4" /> 4.8
            </span>
            <span className="inline-flex items-center gap-1">
              <Timer className="h-4 w-4" /> 5–7 min
            </span>
            <span className="inline-flex items-center gap-1">
              <Utensils className="h-4 w-4" /> Praça de Alimentação
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
