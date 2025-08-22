// src/components/store-card.component.tsx
"use client";
import React from "react";

export type Store = {
  id?: string;
  nome?: string;
  categoria?: string;
  site?: string;
  endereco?: string;
  telefone?: string;
  // ...outros campos
};

type Props = { store?: Store | null };

export function StoreCard({ store }: Props) {
  if (!store) {
    // fallback seguro: nada a renderizar ou um skeleton
    return null;
  }

  const nome = store.nome ?? "Loja";
  const categoria = store.categoria ?? "Outros";
  const site = store.site ?? ""; // pode ser vazio
  const endereco = store.endereco ?? "";
  const telefone = store.telefone ?? "";

  return (
    <div className="rounded-xl border p-4 bg-card text-card-foreground shadow-sm">
      <h3 className="font-semibold">{nome}</h3>
      <p className="text-sm text-muted-foreground">{categoria}</p>

      {!!endereco && <p className="text-sm mt-2">{endereco}</p>}
      {!!telefone && <p className="text-sm">{telefone}</p>}

      {/* Só renderiza link se tiver URL */}
      {!!site && (
        <a
          href={site}
          className="text-sm text-blue-600 underline mt-2 inline-block"
          target="_blank"
          rel="noreferrer noopener"
        >
          Visitar site
        </a>
      )}
    </div>
  );
}
