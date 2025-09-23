"use client";
import Image from "next/image";
import { useMall } from "@/context/MallContext";

function safeSrc(u?: string | null) { return (typeof u === "string" && u.trim() !== "") ? u : null; }

export default function Hero() {
  const { profile } = useMall();
  const title = profile?.displayName || profile?.name || "Peça pelo QR Code";
  const subtitle = "Cardápio digital, pedidos rápidos e entrega na mesa";
  const rating = (profile?.rating ?? 4.8).toFixed(1);
  const time = `${Math.max(5, Math.round((profile?.avgMins ?? 30) * 0.8))}–${Math.round((profile?.avgMins ?? 30) * 1.2)} min`;
  const place = profile?.praça || "Praça de Alimentação";

  return (
    <section className="px-4 pt-2">
      <div className="relative w-full rounded-3xl overflow-hidden shadow">
        <Image
          src="/hero.jpg"
          alt={title}
          width={1200}
          height={600}
          priority
          className="w-full h-[180px] sm:h-[220px] object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/45 to-transparent" />
        <div className="absolute left-4 bottom-4 text-white">
          <h1 className="text-xl font-semibold">{title}</h1>
          <p className="text-[13px] opacity-90">{subtitle}</p>
          <div className="mt-1 flex items-center gap-3 text-xs opacity-90">
            <span>⭐ {rating}</span>
            <span>⏱ {time}</span>
            <span>🍽 {place}</span>
          </div>
        </div>
      </div>
    </section>
  );
}
