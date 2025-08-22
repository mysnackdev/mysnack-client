"use client";

import React from "react";
import { QrCode } from "lucide-react";

type Props = { onScan: () => void };

export default function ScanBanner({ onScan }: Props) {
  return (
    <div
      className="rounded-2xl p-6 md:p-8 text-white"
      style={{
        background:
          "linear-gradient(135deg, #ff7a59 0%, #ff5f6d 50%, #d946ef 100%)",
      }}
    >
      <div className="flex flex-col items-center text-center gap-3">
        <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
          <QrCode className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-xl font-semibold">Escaneie sua Mesa</h3>
          <p className="text-white/80 text-sm">
            Para finalizar seu pedido e receber na mesa
          </p>
        </div>
        <button
          onClick={onScan}
          className="mt-2 bg-white text-pink-600 px-4 py-2 rounded-xl font-semibold hover:opacity-90 transition"
        >
          Escanear QR Code
        </button>
      </div>
    </div>
  );
}
