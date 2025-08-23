"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

export default function PromoGradientCard() {
  return (
    <section className="mt-6">
      <div className="relative overflow-hidden rounded-3xl border bg-gradient-to-r from-orange-500 to-pink-500 p-6 text-white shadow-md">
        <div className="absolute left-2 top-1/2 -translate-y-1/2">
          <button
            aria-label="Anterior"
            className="rounded-full bg-white/20 p-2 backdrop-blur hover:bg-white/30"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
        </div>
        <div className="absolute right-2 top-1/2 -translate-y-1/2">
          <button
            aria-label="Próximo"
            className="rounded-full bg-white/20 p-2 backdrop-blur hover:bg-white/30"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>

        <div className="flex flex-col gap-1">
          <span className="inline-flex w-fit rounded-full bg-white/20 px-3 py-1 text-xs font-medium">
            Somente Hoje
          </span>
          <div className="text-4xl font-extrabold leading-tight">40% Off</div>
          <div className="text-sm opacity-90">em Giuseppe Grill</div>
        </div>

        {/* bolinhas de paginação */}
        <div className="mt-4 flex items-center justify-center gap-2">
          <span className="h-2 w-2 rounded-full bg-white/80" />
          <span className="h-2 w-2 rounded-full bg-white/50" />
          <span className="h-2 w-2 rounded-full bg-white/50" />
        </div>
      </div>
    </section>
  );
}
