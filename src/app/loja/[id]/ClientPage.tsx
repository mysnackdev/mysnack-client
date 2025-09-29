"use client";

import React, { useEffect, useMemo, useState } from "react";
import type { CartItem } from "@/@types/cart";
import dynamic from "next/dynamic";
import { useParams } from "next/navigation";
import { CatalogService, type StoreCatalog, type MenuItem } from "@/services/catalog.service";
import * as CartManager from "@/components/CartManager";

const BottomNav = dynamic(() => import("@/components/bottom-nav"), { ssr: false });

export default function StorePage() {
  const { id } = useParams<{ id: string }>();
  const [catalog, setCatalog] = useState<StoreCatalog | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const data = await CatalogService.getStoreCatalog(String(id));
        if (alive) setCatalog(data);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [id]);

  const storeName = catalog?.store.displayName || catalog?.store.name || "Loja";
  const items = useMemo(() => catalog?.items ?? [], [catalog]);

  function addItem(it: MenuItem) {
    CartManager.addItems([{
      id: `${id}::${it.id}`,
      name: it.name,
      qty: 1,
      price: Number(it.price || 0),
    }] as CartItem[]);
  }

  return (
    <main className="pb-24">
      <div className="mx-auto max-w-3xl px-4 pt-4">
        <header className="mb-4">
          <div className="h-28 rounded-xl bg-gradient-to-r from-zinc-200 to-zinc-100" />
          <h1 className="mt-3 text-xl font-semibold">{storeName}</h1>
          {catalog?.store.categoria && (
            <p className="text-sm text-zinc-500">{catalog.store.categoria}</p>
          )}
        </header>

        <section>
          <h2 className="text-base font-semibold mb-2">Cardápio</h2>
          {loading && <div className="text-sm text-zinc-500">Carregando cardápio…</div>}
          <ul className="space-y-3">
            {items.map((it) => (
              <li key={it.id} className="rounded-xl border p-3 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-medium truncate">{it.name}</p>
                  {it.description && <p className="text-xs text-zinc-500 line-clamp-2">{it.description}</p>}
                  <p className="mt-1 text-sm font-semibold">R$ {Number(it.price || 0).toFixed(2)}</p>
                </div>
                <button onClick={() => addItem(it)} className="rounded-full bg-pink-600 text-white text-sm px-4 py-1.5 shrink-0">
                  Adicionar
                </button>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <BottomNav active="busca" />
    </main>
  );
}
