"use client";
import Image from "next/image";

export default function PromoCarousel() {
  return (
    <section className="px-4 mt-4">
      <div className="relative w-full rounded-2xl overflow-hidden border border-zinc-200 shadow-sm">
        <Image
          src="/promo-bk.jpg"
          alt="Aproveite até 50% OFF"
          width={1200}
          height={600}
          className="w-full h-[140px] object-cover"
        />
        <div className="absolute left-4 top-4">
          <div className="bg-white/80 backdrop-blur px-3 py-1 rounded-full text-[10px] font-medium text-zinc-700">
            Somente no MySnack
          </div>
        </div>
      </div>
    </section>
  );
}
