"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import Image from "next/image";

// Use os tipos do HOOK como fonte de verdade (evita conflito com @/@types)
import type { FoodStore, ComboItem as FoodStoreCombo } from "@/hooks/useStores";

// Itens destacados (ex.: 1º combo de cada loja)
type HighlightItem = { store: FoodStore; combo: FoodStoreCombo };

function formatBRL(n: number): string {
  try {
    return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  } catch {
    return `R$ ${Number(n || 0).toFixed(2)}`;
  }
}

export interface HighlightsSectionProps {
  stores: FoodStore[] | undefined;
  title?: string;
  limit?: number;
}

export default function HighlightsSection({
  stores,
  title = "Destaques",
  limit = 6,
}: HighlightsSectionProps) {
  const highlights = useMemo<HighlightItem[]>(() => {
    const items: HighlightItem[] = [];
    (stores ?? []).forEach((store) => {
      (store.pacotes ?? [])
        .slice(0, 1) // pega o primeiro combo de cada loja como “destaque”
        .forEach((combo) => items.push({ store, combo }));
    });
    return items.slice(0, limit);
  }, [stores, limit]);

  if (!highlights.length) return null;

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between px-1">
        <h2 className="text-lg font-semibold">{title}</h2>
        <Link href="/categorias" className="text-sm text-muted-foreground hover:underline">
          Ver tudo
        </Link>
      </div>

      {/* Grid responsivo */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {highlights.map(({ store, combo }) => (
          <Link
            key={`${store.id}-${combo.id}`}
            href={`/categorias?store=${encodeURIComponent(store.nome)}`}
            className="overflow-hidden rounded-xl border bg-white shadow-sm transition hover:shadow-md"
          >
            <div className="aspect-[16/9] w-full overflow-hidden bg-gray-100">
              {combo.imagemUrl ? (
                <Image
                  src={combo.imagemUrl}
                  alt={combo.nome}
                  width={800}
                  height={450}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
                  sem imagem
                </div>
              )}
            </div>

            <div className="p-3">
              <p className="line-clamp-1 text-sm text-muted-foreground">
                {store.categoria ?? "—"}
              </p>
              <h3 className="line-clamp-1 text-base font-semibold">{store.nome}</h3>

              <div className="mt-2">
                <p className="line-clamp-2 text-sm">
                  <span className="font-medium">{combo.nome}</span>
                </p>
                <p className="mt-1 text-base font-bold">{formatBRL(combo.preco)}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
