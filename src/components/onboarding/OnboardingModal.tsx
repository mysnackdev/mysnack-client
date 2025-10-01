"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";

type OnboardingModalProps = {
  open: boolean;
  onClose: () => void;
};

/** 4 passos * ~7.5s = ~30s */
const STEPS = [
  {
    id: "qr",
    titulo: "Peça via QR Code",
    texto:
      "Aponte a câmera para o QR Code da sua mesa. O app reconhece a sua mesa automaticamente.",
    emoji: "📷",
  },
  {
    id: "cart",
    titulo: "Escolha e adicione ao carrinho",
    texto:
      "Navegue pelo cardápio, toque em “Adicionar ao carrinho” e personalize seus itens.",
    emoji: "🛒",
  },
  {
    id: "pay",
    titulo: "Pague do seu jeito",
    texto:
      "Finalize no checkout. A loja pode oferecer Pix, cartão na entrega/retirada ou pagamento no balcão.",
    emoji: "💳",
  },
  {
    id: "track",
    titulo: "Acompanhe em tempo real",
    texto:
      "Veja o status: realizado, confirmado, sendo preparado e pronto. Receba alertas de mudança.",
    emoji: "📦",
  },
] as const;

const DURATION_PER_STEP_MS = 7500; // ~7.5s
const TOTAL_MS = DURATION_PER_STEP_MS * STEPS.length;

export default function OnboardingModal({ open, onClose }: OnboardingModalProps) {
  const [idx, setIdx] = useState<number>(0);
  const timer = useRef<number | null>(null);

  useEffect(() => {
    if (!open) return;
    // Auto-avança
    timer.current = window.setInterval(() => {
      setIdx((i) => (i + 1) % STEPS.length);
    }, DURATION_PER_STEP_MS);
    // Auto-fecha depois de 30s
    const closeTimer = window.setTimeout(() => {
      onClose();
    }, TOTAL_MS);
    return () => {
      if (timer.current) window.clearInterval(timer.current);
      window.clearTimeout(closeTimer);
    };
  }, [open, onClose]);

  const progress = useMemo(() => ((idx + 1) / STEPS.length) * 100, [idx]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} aria-hidden />
      <div
        role="dialog"
        aria-modal="true"
        className="absolute inset-x-0 bottom-0 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-[720px] rounded-t-2xl md:rounded-2xl bg-white shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="p-4 md:p-6 flex items-center justify-between gap-2 border-b">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full border grid place-items-center">{STEPS[idx].emoji}</div>
            <h2 className="text-lg md:text-xl font-bold">Como usar</h2>
          </div>
          <button onClick={onClose} className="text-zinc-500 hover:text-zinc-800">Pular</button>
        </div>

        {/* Body */}
        <div className="p-6 md:p-10 text-center min-h-[220px] grid place-items-center">
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 w-full">
            <h3 className="text-xl md:text-2xl font-bold">{STEPS[idx].titulo}</h3>
            <p className="text-zinc-700 mt-2 max-w-[60ch] mx-auto">{STEPS[idx].texto}</p>
            <div className="mt-6 flex items-center justify-center gap-3">
              {STEPS.map((s, i) => (
                <div
                  key={s.id}
                  className={`h-2 w-2 rounded-full ${i === idx ? "bg-zinc-900" : "bg-zinc-300"}`}
                  aria-label={i === idx ? "passo atual" : "passo"}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 pb-6">
          <div className="h-2 bg-zinc-100 rounded-full overflow-hidden">
            <div className="h-full bg-zinc-900" style={{ width: `${progress}%` }} />
          </div>
          <div className="mt-4 flex items-center justify-between">
            <Link href="/orders" className="text-zinc-600 hover:text-zinc-900 underline">
              Ver meus pedidos
            </Link>
            <button
              onClick={onClose}
              className="rounded-lg bg-zinc-900 text-white px-4 py-2 hover:bg-black"
            >
              Entendi
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
