"use client";

import React, { useMemo } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import BottomNav from "@/components/bottom-nav";
import { useStores } from "@/hooks";

/** Tipos mínimos para o que a página usa */
type Pacote = { id?: string; nome: string; preco?: number };
type StoreLite = { nome: string; pacotes?: Pacote[] };

type FoundProduct = {
  storeName: string;
  name: string;
  price: number;
};

type CartItem = { id: string; name: string; qty: number; price: number };

function readCart(): CartItem[] {
  try {
    const raw = localStorage.getItem("mysnack_cart");
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? (parsed as CartItem[]) : [];
  } catch {
    return [];
  }
}

function writeCart(items: CartItem[]) {
  localStorage.setItem("mysnack_cart", JSON.stringify(items));
}

export default function ProdutoClientPage() {
  const sp = useSearchParams();
  const id = sp.get("id") || ""; // ✅ vem da query string

  // useStores() pode não ter tipos — convertemos para o shape mínimo que precisamos
  const { stores } = useStores();

  // ✅ memoiza a lista para não mudar a referência a cada render
  const storesList = useMemo<StoreLite[]>(
    () => (stores ?? []) as unknown as StoreLite[],
    [stores]
  );

  // ✅ extrai valores da query para dependências estáveis
  const qName = sp.get("item");
  const qStore = sp.get("store") ?? "";
  const qPrice = Number(sp.get("price") ?? 0);

  const found = useMemo<FoundProduct | null>(() => {
    if (!id) {
      // fallback via query (?item= & ?store= & ?price=)
      if (qName) {
        return { storeName: qStore, name: qName, price: qPrice };
      }
      return null;
    }

    // 1) tenta por id dentro de pacotes
    for (const s of storesList) {
      const pacotes = s.pacotes ?? [];
      for (const c of pacotes) {
        const cid = c.id || c.nome;
        if (cid === id) {
          return {
            storeName: s.nome,
            name: c.nome,
            price: Number(c.preco ?? 0),
          };
        }
      }
    }

    // 2) fallback via query params
    if (qName) {
      return { storeName: qStore, name: qName, price: qPrice };
    }

    return null;
  }, [storesList, id, qName, qStore, qPrice]);

  if (!found) {
    return (
      <main className="min-h-screen bg-[#fafafa] pb-24">
        <header className="sticky top-0 z-10 bg-white/80 backdrop-blur border-b">
          <div className="mx-auto max-w-5xl px-4 h-14 flex items-center gap-3">
            <Link href="/categorias" className="text-2xl leading-none">
              ←
            </Link>
            <h1 className="text-base font-semibold">Produto</h1>
          </div>
        </header>
        <div className="mx-auto max-w-5xl px-4 py-4">
          <div className="rounded-2xl bg-white border p-6 shadow-sm text-center">
            Produto não encontrado.
          </div>
        </div>
        <BottomNav />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#fafafa] pb-24">
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur border-b">
        <div className="mx-auto max-w-5xl px-4 h-14 flex items-center gap-3">
          <Link href="/categorias" className="text-2xl leading-none">
            ←
          </Link>
          <h1 className="text-base font-semibold">Detalhe do produto</h1>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-4 py-4 space-y-4">
        <div className="rounded-2xl bg-white border p-4 shadow-sm">
          <div className="text-sm text-black/60">{found.storeName}</div>
          <h2 className="text-xl font-semibold">{found.name}</h2>
          <div className="mt-2 text-lg font-bold">
            R$ {Number(found.price || 0).toFixed(2)}
          </div>
          <p className="mt-3 text-sm text-black/70">
            Descrição do produto em breve.
          </p>
        </div>
        <div className="flex gap-3">
          <Link
            href={`/categorias?store=${encodeURIComponent(found.storeName)}`}
            className="px-4 py-2 rounded-xl border"
          >
            Ver mais da loja
          </Link>
          <button
            className="px-4 py-2 rounded-xl bg-black text-white"
            onClick={() => {
              const arr = readCart();
              const idKey = `${found.storeName}::${found.name}`;
              const idx = arr.findIndex((x) => x.id === idKey);
              if (idx >= 0) {
                arr[idx].qty = (arr[idx].qty || 0) + 1;
              } else {
                arr.push({
                  id: idKey,
                  name: found.name,
                  qty: 1,
                  price: Number(found.price || 0),
                });
              }
              writeCart(arr);
              window.dispatchEvent(new Event("cart-updated"));
              window.dispatchEvent(new Event("open-cart"));
            }}
          >
            Adicionar ao carrinho
          </button>
        </div>
      </div>

      <BottomNav />
    </main>
  );
}
