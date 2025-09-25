// src/components/payments/SavedCards.tsx
"use client";

import React, { useEffect, useState } from "react";
import { getAuth } from "firebase/auth";
import { readUserSavedCards } from "@/services/user-cards.service";
import type { UserCard } from "@/types/payments";

/**
 * Lista somente leitura de cartões do RTDB.
 * Use este componente onde você deseja permitir a seleção de um cartão salvo.
 */
export default function SavedCards({
  selected,
  onSelect,
}: {
  selected?: string;
  onSelect?: (cardId: string) => void;
}) {
  const [cards, setCards] = useState<UserCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const uid = getAuth().currentUser?.uid;
        if (!uid) return;
        const list = await readUserSavedCards(uid);
        if (mounted) setCards(list);
      } catch (e: any) {
        if (mounted) setError(e?.message ?? "Erro ao carregar cartões.");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  if (loading) return <div className="text-sm text-neutral-500">Carregando cartões…</div>;
  if (error) return <div className="text-sm text-red-600">{error}</div>;
  if (cards.length === 0) return <div className="text-sm text-neutral-500">Nenhum cartão salvo.</div>;

  return (
    <ul className="space-y-2">
      {cards.map((c) => (
        <li key={c.id}>
          <label className="flex items-center gap-3 rounded-lg border border-neutral-300 px-3 py-2 cursor-pointer hover:border-neutral-400">
            <input
              type="radio"
              name="card"
              className="mt-0.5"
              checked={selected === c.id}
              onChange={() => onSelect?.(c.id)}
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
  );
}
