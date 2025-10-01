
// src/components/checkout/PaymentStep.tsx
"use client";

import React, { useEffect, useState } from "react";
import { getAuth } from "firebase/auth";
import { readUserSavedCards } from "@/services/user-cards.service";
import type { UserCard } from "@/types/payments";

type Props = {
  accepted?: { pix?: boolean; credit_card?: boolean; };

  value?: { method?: "pix" | "card"; cardId?: string };
  onChange?: (next: { method: "pix" | "card"; cardId?: string }) => void;
  onNext?: () => void;
  onBack?: () => void;
};


export default function PaymentStep({ value, onChange, onNext, onBack, accepted }: Props) {
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
            disabled={accepted && accepted.pix === false}
            className={`rounded-lg border px-4 py-2 text-sm ${method === "pix" ? "border-indigo-400 ring-2 ring-indigo-200" : "border-neutral-300"} ${accepted && accepted.pix === false ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            Pix
          </button>
          <button
            type="button"
            onClick={() => setMethod("card")}
            disabled={accepted && accepted.credit_card === false}
            className={`rounded-lg border px-4 py-2 text-sm ${method === "card" ? "border-indigo-400 ring-2 ring-indigo-200" : "border-neutral-300"} ${accepted && accepted.credit_card === false ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            Cartão de crédito
          </button>
        </div>
      </div>
    </div>
  );
}