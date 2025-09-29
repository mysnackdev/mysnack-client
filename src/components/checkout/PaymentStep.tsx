
// src/components/checkout/PaymentStep.tsx
"use client";

import React, { useEffect, useState } from "react";
import { getAuth } from "firebase/auth";
import { readUserSavedCards } from "@/services/user-cards.service";
import type { UserCard } from "@/types/payments";

type Props = {
  value?: { method?: "pix" | "card"; cardId?: string };
  onChange?: (next: { method: "pix" | "card"; cardId?: string }) => void;
  onNext?: () => void;
  onBack?: () => void;
};


export default function PaymentStep({ value, onChange, onNext, onBack }: Props) {
  const [method, setMethod] = useState<"pix" | "card">(value?.method ?? "pix");
  const [cards, setCards] = useState<UserCard[]>([]);
  const [selectedCard, setSelectedCard] = useState<string | undefined>(value?.cardId);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load cards directly from RTDB client/payments/cards/{uid}/{cardId}
  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const uid = getAuth().currentUser?.uid;
        if (!uid) {
          setCards([]);
        } else {
          const list = await readUserSavedCards(uid);
          if (mounted) setCards(list);
        }
      } catch (e: unknown) {
        if (mounted) setError(e instanceof Error ? e.message : "Erro ao carregar cartões.");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    onChange?.({ method, cardId: method === "card" ? selectedCard : undefined });
  }, [method, selectedCard, onChange]);

  const hasCards = cards.length > 0;

  return (
    <div className="max-w-2xl mx-auto">
      <h3 className="text-lg font-semibold mb-3">Formas de pagamento</h3>

      <div className="border rounded-xl p-3 space-y-3">
        {/* selector */}
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setMethod("pix")}
            className={`rounded-lg border px-4 py-2 text-sm ${method === "pix" ? "border-indigo-400 ring-2 ring-indigo-200" : "border-neutral-300"}`}
          >
            Pix
          </button>
          <button
            type="button"
            onClick={() => setMethod("card")}
            className={`rounded-lg border px-4 py-2 text-sm ${method === "card" ? "border-indigo-400 ring-2 ring-indigo-200" : "border-neutral-300"}`}
          >
            Cartão de crédito
          </button>
        </div>

        {/* cards (no mock text anywhere) */}
        {method === "card" && (
          <div className="mt-1">
            <div className="text-sm font-medium mb-2">Seus cartões</div>

            {loading && <div className="text-sm text-neutral-500">Carregando cartões…</div>}
            {error && <div className="text-sm text-red-600">{error}</div>}
            {!loading && !error && !hasCards && (
              <div className="text-sm text-neutral-500">Nenhum cartão salvo no seu cadastro.</div>
            )}

            {hasCards && (
              <ul className="space-y-2">
                {cards.map((c) => (
                  <li key={c.id}>
                    <label className="flex items-center gap-3 rounded-lg border border-neutral-300 px-3 py-2 cursor-pointer hover:border-neutral-400">
                      <input
                        type="radio"
                        name="card"
                        className="mt-0.5"
                        checked={selectedCard === c.id}
                        onChange={() => setSelectedCard(c.id)}
                      />
                      <div className="flex-1">
                        <div className="text-sm font-medium">
                          {c.brand ?? "Cartão"} •••• {c.last4}
                        </div>
                        <div className="text-xs text-neutral-500">
                          {c.holder ? `${c.holder} · ` : ""}Venc. {c.expMonth?.toString().padStart(2,"0")}/{c.expYear}
                        </div>
                      </div>
                    </label>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onBack} className="flex-1 rounded-lg bg-neutral-800 text-white py-2">Voltar</button>
          <button
            type="button"
            onClick={onNext}
            disabled={method === "card" && hasCards && !selectedCard}
            className="flex-1 rounded-lg bg-indigo-400 text-white py-2 disabled:opacity-50"
          >
            Revisar pedido
          </button>
        </div>
      </div>
    </div>
  );
}