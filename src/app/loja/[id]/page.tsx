"use client";

import React, { useMemo } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import BottomNav from "@/components/BottomNav";
import HeaderBar from "@/components/HeaderBar";
import { useStores, type FoodStore, type ComboItem } from "@/hooks/useStores";

type CartItem = { id: string; name: string; qty: number; price: number };

function formatBRL(n: number): string {
  try {
    return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  } catch {
    return `R$ ${Number(n || 0).toFixed(2)}`;
  }
}

export default function StoreDetailPage({ params }: { params: { id: string } }) {
  const { stores, loading, error } = useStores();
  const qp = useSearchParams();
  const highlightedCombo = qp.get("combo") ?? undefined;

  const store: FoodStore | undefined = useMemo(
    () => stores.find((s) => String(s.id) === String(params.id)),
    [stores, params?.id]
  );

  function addToCart(combo: ComboItem, s: FoodStore) {
    try {
      const raw = localStorage.getItem("mysnack_cart");
      const arr: CartItem[] = raw ? JSON.parse(raw) : [];
      const id = `${s?.nome || "loja"}::${combo?.nome || "combo"}`;
      const existing = arr.find((x) => x.id === id);
      if (existing) {
        existing.qty = (existing.qty || 1) + 1;
      } else {
        arr.push({ id, name: `${s.nome} • ${combo.nome}`, qty: 1, price: combo.preco });
      }
      localStorage.setItem("mysnack_cart", JSON.stringify(arr));
      // abre o carrinho para feedback
      try { window.dispatchEvent(new Event("open-cart")); } catch {}
    } catch {
      alert("Não foi possível adicionar ao carrinho.");
    }
  }

  async function orderNow(combo: ComboItem, s: FoodStore) {
    try {
      const { getAuth } = await import("firebase/auth");
      const { OrderService } = await import("@/services/order.service");
      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) { console.warn('User not authenticated'); return; }
      const uid = user?.uid as string;
      await OrderService.createOrder({
        uid,
        nome: user?.displayName || `Cliente ${uid.slice(-5)}`,
        items: [{ id: combo.nome, name: combo.nome, qty: 1, price: combo.preco, subtotal: combo.preco }],
        subtotal: combo.preco,
        total: combo.preco,
        status: "pedido realizado",
      });
      if (typeof window !== "undefined") {
        window.location.href = "/orders";
      }
    } catch {
      alert("Não foi possível criar seu pedido agora.");
    }
  }

  return (
    <main className="pb-24">
      <HeaderBar title={store?.nome || "Loja"} />
      <div className="mx-auto max-w-5xl p-4">
        {loading && <p className="text-sm text-muted-foreground">Carregando…</p>}
        {error && !loading && <p className="text-sm text-red-600">Erro: {String(error)}</p>}

        {!loading && !store && (
          <div className="rounded-xl border bg-white p-4 shadow-sm">
            <p className="font-semibold">Loja não encontrada</p>
            <p className="text-sm text-muted-foreground">Verifique o link e tente novamente.</p>
            <Link href="/" className="mt-3 inline-block text-sm underline">Voltar</Link>
          </div>
        )}

        {store && (
          <section>
            <h1 className="text-2xl font-bold">{store.nome}</h1>
            {store.endereco && <p className="text-sm text-muted-foreground mt-1">{store.endereco}</p>}
            {store.telefone && <p className="text-sm text-muted-foreground">{store.telefone}</p>}

            <h2 className="mt-6 mb-2 text-lg font-semibold">Combos</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {(store.combos ?? []).map((combo) => (
                <div
                  key={combo.id}
                  className={"rounded-xl border bg-white shadow-sm overflow-hidden " + (highlightedCombo === combo.id ? "ring-2 ring-black" : "")}
                >
                  <div className="aspect-[5/3] w-full bg-gray-100">
                    {combo.imagemUrl ? (
                      <Image src={combo.imagemUrl} alt={combo.nome} width={800} height={480} className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">sem imagem</div>
                    )}
                  </div>

                  <div className="p-3">
                    <p className="text-base font-semibold">{combo.nome}</p>
                    <p className="text-sm text-muted-foreground">{formatBRL(combo.preco)}</p>

                    <div className="mt-3 flex gap-2">
                      <button
                        onClick={() => addToCart(combo, store)}
                        className="rounded-md bg-black px-4 py-2 text-sm font-semibold text-white"
                      >
                        Adicionar ao carrinho
                      </button>
                      <button
                        onClick={() => orderNow(combo, store)}
                        className="rounded-md border px-4 py-2 text-sm font-semibold"
                      >
                        Pedir agora
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
      <BottomNav active="inicio" />
    </main>
  );
}
