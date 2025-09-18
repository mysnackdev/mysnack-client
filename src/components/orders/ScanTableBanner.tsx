
"use client";
import React from "react";

export default function ScanTableBanner({ onClick }: { onClick: () => void }) {
  return (
    <section className="px-4">
      <div className="rounded-3xl bg-gradient-to-br from-orange-500 to-pink-500 text-white p-6 md:p-8 shadow-md">
        <div className="mx-auto flex flex-col items-center text-center gap-2 max-w-xl">
          <div className="text-4xl">◼︎</div>
          <h3 className="text-xl md:text-2xl font-semibold">Escaneie sua Mesa</h3>
          <p className="opacity-95 text-sm md:text-base">Para finalizar seu pedido e receber na mesa</p>
          <button
            onClick={onClick}
            className="mt-3 rounded-xl bg-white/90 text-black font-semibold px-5 py-2.5"
          >
            Escanear QR Code
          </button>
        </div>
      </div>
    </section>
  );
}
