"use client";
import React, { useMemo } from "react";
import Link from "next/link";
import { useStores } from "@/hooks";
import type { FoodStore, FoodStoreCombo } from "@/@types";

type DealItem = { store: FoodStore; combo: FoodStoreCombo };
type LocalCartItem = { id: string; name: string; qty: number; price: number };

export default function CheapDealsHorizontal() {
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
      // opcional: avisar outros componentes
      window.dispatchEvent(new Event("open-cart"));
      window.dispatchEvent(new Event("cart-updated"));
    } catch {
      // ignora erros de parse/localStorage
    }
  }

  const { stores, loading } = useStores();

  const baratos = useMemo(() => {
    const items: DealItem[] = [];
    (stores ?? []).forEach((s) => (s.pacotes ?? []).forEach((c) => items.push({ store: s, combo: c })));
    return items.sort((a, b) => a.combo.preco - b.combo.preco).slice(0, 10);
  }, [stores]);

  if (loading) return <div className="card">Carregando baratinhos…</div>;

  return (
    <section aria-labelledby="baratinhos-title" className="space-y-3">
      <h2 id="baratinhos-title" className="text-2xl font-bold">Baratinhos do dia</h2>

      <div className="overflow-x-auto scrollbar-none -mx-4 px-4">
        <div className="flex gap-3 w-max">
          {baratos.map((it, idx) => (
            <div key={idx} className="card min-w-[240px]">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="badge-red">Somente no MySnack</span>
                <span className="muted">{it.store.categoria}</span>
              </div>

              <h3 className="font-semibold">{it.store.nome}</h3>
              <p className="muted text-sm">{it.combo.nome}</p>

              <div className="flex items-center justify-between mt-2">
                <span className="font-bold">R$ {it.combo.preco.toFixed(2)}</span>
              </div>

              <div className="flex items-center gap-2 mt-2">
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
    </section>
  );
}
