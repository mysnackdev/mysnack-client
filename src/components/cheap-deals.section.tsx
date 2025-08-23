"use client";

import Link from "next/link";
import React, { useMemo } from "react";
import { useStores } from "@/hooks";
import type { FoodStore, ComboItem as FoodStoreCombo } from "@/hooks/useStores";

type DealItem = { store: FoodStore; combo: FoodStoreCombo };
type LocalCartItem = { id: string; name: string; qty: number; price: number };

export default function CheapDeals() {
  function addToCart(it: DealItem) {
    try {
      const raw = localStorage.getItem("mysnack_cart");
      const arr: LocalCartItem[] = raw ? JSON.parse(raw) : [];
      const id = `${it.store?.nome || "loja"}::${it.combo?.nome || "combo"}`;
      const price = Number(it.combo?.preco ?? 0);
      const index = arr.findIndex((e) => e.id === id);

      if (index >= 0) {
        arr[index].qty = (arr[index].qty || 0) + 1;
      } else {
        arr.push({
          id,
          name: `${it.store?.nome} — ${it.combo?.nome}`,
          qty: 1,
          price,
        });
      }
      localStorage.setItem("mysnack_cart", JSON.stringify(arr));
      window.dispatchEvent(new Event("open-cart"));
    } catch {
      // ignora erros de parse/localStorage
    }
  }

  const { stores, loading } = useStores();

  const baratos = useMemo(() => {
    const items: DealItem[] = [];
    (stores ?? []).forEach((store) => {
      (store.pacotes ?? []).forEach((combo) => items.push({ store, combo }));
    });
    return items.sort((a, b) => a.combo.preco - b.combo.preco).slice(0, 6);
  }, [stores]);

  if (loading) return <div className="card">Carregando ofertas…</div>;

  return (
    <section aria-labelledby="cheap-title" className="space-y-3">
      <h2 id="cheap-title" className="text-2xl font-bold">Ofertas acessíveis</h2>

      {/* Mobile: carrossel horizontal */}
      <div className="md:hidden overflow-x-auto scrollbar-none -mx-4 px-4 snap-x snap-mandatory scroll-px-4">
        <div className="flex gap-3 w-max">
          {baratos.map((it, idx) => (
            <div key={idx} className="card min-w-[240px] snap-start">
              <p className="text-xs muted">
                {it.store.categoria ?? "—"} • {it.store.localizacao ?? "—"}
              </p>
              <h3 className="text-lg font-semibold">{it.store.nome}</h3>
              <p className="mt-2">
                <span className="font-medium">{it.combo.nome}</span>
              </p>
              <div className="mt-3 flex items-center justify-between">
                <span className="font-bold">
                  R$ {it.combo.preco.toFixed(2)}
                </span>
                <Link
                  href={`/categorias?store=${encodeURIComponent(it.store.nome)}`}
                  className="btn-ghost text-sm"
                >
                  Detalhes
                </Link>
              </div>
              <div className="flex items-center gap-2 mt-3">
                <button
                  onClick={() => addToCart(it)}
                  className="px-3 py-1.5 rounded-full bg-black text-white text-sm"
                >
                  Pedir
                </button>
                <Link
                  href={`/categorias?store=${encodeURIComponent(it.store.nome)}`}
                  className="btn-ghost text-sm"
                >
                  Detalhes
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Desktop: grid */}
      <div className="hidden md:grid md:grid-cols-3 gap-3">
        {baratos.map((it, idx) => (
          <div key={idx} className="card">
            <p className="text-xs muted">
              {it.store.categoria ?? "—"} • {it.store.localizacao ?? "—"}
            </p>
            <h3 className="text-lg font-semibold">{it.store.nome}</h3>
            <p className="mt-2">
              <span className="font-medium">{it.combo.nome}</span>
            </p>
            <div className="mt-3 flex items-center justify-between">
              <button
                onClick={() => addToCart(it)}
                className="px-3 py-1.5 rounded-full bg-black text-white text-sm"
              >
                Pedir
              </button>
              <span className="font-bold">R$ {it.combo.preco.toFixed(2)}</span>
              <Link
                href={`/categorias?store=${encodeURIComponent(it.store.nome)}`}
                className="btn-ghost text-sm"
              >
                Detalhes
              </Link>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
