"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import type { FoodStore, ComboItem } from "@/hooks/useStores";

type MaybeCombos = { pacotes?: unknown; packages?: unknown };
interface DealItem { store: FoodStore; combo: ComboItem; }

function isComboItem(x: unknown): x is ComboItem {
  if (!x || typeof x !== "object") return false;
  const o = x as Record<string, unknown>;
  return typeof o.id === "string" && typeof o.nome === "string" && typeof o.preco === "number";
}
function extractCombos(store: FoodStore): ComboItem[] {
  const s = store as FoodStore & MaybeCombos;
  const raw = s.pacotes ?? s.packages;
  return Array.isArray(raw) ? raw.filter(isComboItem) : [];
}
function formatBRL(n: number) {
  try { return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }); }
  catch { return `R$ ${Number(n || 0).toFixed(2)}`; }
}

/** Pega uma imagem opcional da loja sem quebrar o tipo (campos variam por backend) */
function pickStoreImage(store: FoodStore): string | undefined {
  const s = store as unknown as {
    imagemUrl?: string; imageUrl?: string; logoUrl?: string; logo?: string; photoUrl?: string;
  };
  return s.imagemUrl ?? s.imageUrl ?? s.logoUrl ?? s.logo ?? s.photoUrl;
}

export interface CheapDealsHorizontalProps {
  stores: FoodStore[] | undefined;
  title?: string;
  limit?: number;
}

export default function CheapDealsHorizontalSection({
  stores,
  title,
  limit = 10,
}: CheapDealsHorizontalProps) {
  const baratos = useMemo(() => {
    const items: DealItem[] = [];
    (stores ?? []).forEach((s) => extractCombos(s).forEach((c) => items.push({ store: s, combo: c })));
    return items.sort((a, b) => a.combo.preco - b.combo.preco).slice(0, limit);
  }, [stores, limit]);

  if (!baratos.length) return null;

  return (
    <section className="mt-6">
      {title ? <h3 className="px-1 text-lg font-semibold">{title}</h3> : null}

      <div className="no-scrollbar -mx-4 mt-2 overflow-x-auto px-4">
        <ul className="flex snap-x snap-mandatory gap-4 pb-2">
          {baratos.map(({ store, combo }) => {
            const img = combo.imagemUrl ?? pickStoreImage(store) ?? "";
            const productId = encodeURIComponent(combo.id || combo.nome); // ✅ id para a rota dinâmica

            return (
              <li key={`${store.id}-${combo.id || combo.nome}`} className="snap-start w-[180px] sm:w-[190px] shrink-0">
                <Link
                  href={`/produto#${encodeURIComponent(store.id)}/${productId}`}
                  className="block rounded-md pt-[2px] focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/40"
                >
                  {/* conteúdo centralizado */}
                  <div className="mx-auto flex w-full max-w-[190px] flex-col items-center text-center">
                    <div className="relative mx-auto h-20 w-20 overflow-hidden rounded-full ring-2 ring-amber-500">
                      {img ? (
                        <Image src={img} alt={combo.nome} fill sizes="80px" className="object-cover" />
                      ) : (
                        <div className="grid h-full w-full place-items-center text-xs text-muted-foreground">
                          sem imagem
                        </div>
                      )}
                    </div>

                    <p className="mt-2 line-clamp-1 text-[15px] font-semibold leading-tight">
                      {store.nome}
                    </p>
                    <p className="mt-1 line-clamp-2 text-xs text-slate-600">
                      {combo.nome}
                    </p>
                    <p className="mt-1 text-sm font-bold text-emerald-600">
                      {formatBRL(combo.preco)}
                    </p>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>

      <style jsx>{`
        .no-scrollbar::-webkit-scrollbar { display: none; width: 0; height: 0; }
        .no-scrollbar { scrollbar-width: none; -ms-overflow-style: none; }
      `}</style>
    </section>
  );
}
