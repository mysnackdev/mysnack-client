"use client";
import { useState } from "react";
import { QrCode } from "lucide-react";
import QrScannerDialog from "@/components/common/QrScannerDialog";
import { useMall } from "@/context/MallContext";

export default function ScanTableBanner() {
  const [open, setOpen] = useState(false);
  const { setMallById } = useMall();

  return (
    <section className="px-4 mt-4">
      <div className="rounded-3xl bg-gradient-to-br from-rose-500 via-orange-500 to-orange-400 text-white py-10 text-center shadow-md">
        <div className="flex justify-center">
          <div className="w-16 h-16 rounded-full bg-white/25 flex items-center justify-center">
            <QrCode className="w-8 h-8" />
          </div>
        </div>
        <h2 className="text-2xl font-semibold mt-3">Escaneie sua Mesa</h2>
        <p className="opacity-90">Para finalizar seu pedido e receber na mesa</p>
        <button
          className="mt-5 inline-flex items-center gap-2 bg-white text-rose-600 px-6 py-3 rounded-2xl font-medium shadow"
          onClick={() => setOpen(true)}
        >
          <QrCode className="w-5 h-5" /> Escanear QR Code
        </button>
      </div>
      <QrScannerDialog
        open={open}
        onClose={() => setOpen(false)}
        onResult={(res) => { if (res.mallId) setMallById(res.mallId); }}
      />
    </section>
  );
}
