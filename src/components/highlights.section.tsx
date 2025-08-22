"use client";
import React, { useMemo } from "react";
import Link from "next/link";
import { useStores } from "@/hooks";
import type { FoodStore, FoodStoreCombo } from "@/@types";

type DealItem = { store: FoodStore; combo: FoodStoreCombo };
type LocalCartItem = { id: string; name: string; qty: number; price: number };

export default function Highlights() {
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
      window.dispatchEvent(new Event("cart-updated"));
    } catch {
      // ignora erros de parse/localStorage
    }
  }

  const { stores, loading } = useStores();

  const destaques = useMemo(() => {
    const items: DealItem[] = [];
    (stores ?? []).forEach((store) => {
      (store.pacotes ?? []).slice(0, 1).forEach((combo) => {
        items.push({ store, combo });
      });
    });
    return items.slice(0, 6);
  }, [stores]);

  if (loading) return <div className="card">Carregando destaques…</div>;

  return (
    <section aria-labelledby="high-title" className="space-y-3">
      <h2 id="high-title" className="text-2xl font-bold">Destaques</h2>

      {/* Mobile: carrossel horizontal com snap */}
      <div className="md:hidden overflow-x-auto scrollbar-none -mx-4 px-4 snap-x snap-mandatory scroll-px-4">
        <div className="flex gap-3 w-max">
          {destaques.map((it, idx) => (
            <div key={idx} className="card min-w-[240px] snap-start">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="badge">Top</span>
                <span className="muted">{it.store.categoria}</span>
              </div>
              <h3 className="font-semibold">{it.store.nome}</h3>
              <p className="muted text-sm">{it.combo.nome}</p>
              <div className="flex items-center justify-between mt-2">
                <span className="font-bold">R$ {it.combo.preco.toFixed(2)}</span>
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
        {destaques.map((it, idx) => (
          <div key={idx} className="card relative overflow-hidden">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="badge">Top</span>
              <span className="muted">{it.store.categoria}</span>
            </div>
            <h3 className="font-semibold">{it.store.nome}</h3>
            <p className="muted text-sm">{it.combo.nome}</p>
            <div className="flex items-center justify-between mt-2">
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
