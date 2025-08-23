"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import type { FoodStore } from "@/hooks/useStores";

/** Combos/pacotes de ofertas de uma loja */
export interface ComboItem {
  id: string;
  nome: string;
  preco: number;
  itens?: Array<{ nome: string; qtd: number }>;
  imagemUrl?: string;
}

/** Deal: par (loja, combo) */
export interface DealItem {
  store: FoodStore;
  combo: ComboItem;
}

/** Alguns backends podem enviar 'pacotes' ou 'packages' */
type MaybeCombos = {
  pacotes?: unknown;
  packages?: unknown;
};

/** Type guard para um item ser ComboItem */
function isComboItem(x: unknown): x is ComboItem {
  if (!x || typeof x !== "object") return false;
  const obj = x as Record<string, unknown>;
  // Campos básicos obrigatórios com validações mínimas
  if (typeof obj["id"] !== "string") return false;
  if (typeof obj["nome"] !== "string") return false;
  if (typeof obj["preco"] !== "number") return false;
  // Campos opcionais validados superficialmente
  if (obj["itens"] !== undefined && !Array.isArray(obj["itens"])) return false;
  if (obj["imagemUrl"] !== undefined && typeof obj["imagemUrl"] !== "string") return false;
  return true;
}

/** Extrai de forma segura os combos/pacotes de uma store, independente do nome do campo */
function extractCombos(store: FoodStore): ComboItem[] {
  const s = store as FoodStore & MaybeCombos;
  const raw = s.pacotes ?? s.packages;
  if (!Array.isArray(raw)) return [];
  return raw.filter(isComboItem);
}

/** Preço formatado BR */
function formatBRL(n: number): string {
  try {
    return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  } catch {
    return `R$ ${Number(n || 0).toFixed(2)}`;
  }
}

export interface CheapDealsHorizontalProps {
  stores: FoodStore[] | undefined;
  title?: string;
  limit?: number; // se quiser limitar a quantidade renderizada
}

/**
 * Seção horizontal de “ofertas baratas” (combos mais baratos entre as lojas).
 * Aceita stores sem o campo tipado 'pacotes', pois extrai combos de 'pacotes' OU 'packages'.
 */
export default function CheapDealsHorizontalSection({
  stores,
  title = "Ofertas baratas",
  limit = 10,
}: CheapDealsHorizontalProps) {
  const baratos: DealItem[] = useMemo(() => {
    const items: DealItem[] = [];
    (stores ?? []).forEach((s) => {
      const combos = extractCombos(s);
      combos.forEach((c) => items.push({ store: s, combo: c }));
    });
    // Ordena por preço crescente e limita a N
    return items.sort((a, b) => a.combo.preco - b.combo.preco).slice(0, limit);
  }, [stores, limit]);

  if (!baratos.length) {
    return null;
  }

  return (
    <section className="mt-6">
      <div className="mb-2 flex items-center justify-between px-1">
        <h2 className="text-lg font-semibold">{title}</h2>
        <Link href="/busca" className="text-sm text-muted-foreground hover:underline">
          Ver mais
        </Link>
      </div>

      {/* Lista horizontal */}
      <div className="flex snap-x snap-mandatory gap-3 overflow-x-auto pb-2">
        {baratos.map(({ store, combo }) => (
          <Link
            key={`${store.id}-${combo.id}`}
            href={`/loja/${store.id}?combo=${encodeURIComponent(combo.id)}`}
            className="snap-start w-[240px] shrink-0 rounded-xl border bg-white shadow-sm hover:shadow-md transition"
          >
            <div className="aspect-[5/3] w-full overflow-hidden rounded-t-xl bg-gray-100">
              {combo.imagemUrl ? (
                <Image
                  src={combo.imagemUrl}
                  alt={combo.nome}
                  width={600}
                  height={360}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
                  sem imagem
                </div>
              )}
            </div>

            <div className="p-3">
              <p className="line-clamp-1 text-sm font-semibold">{combo.nome}</p>
              <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
                {store.nome} {store.categoria ? `• ${store.categoria}` : ""}
              </p>
              <p className="mt-2 text-base font-bold">{formatBRL(combo.preco)}</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
