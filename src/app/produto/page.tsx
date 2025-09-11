"use client";
import React, { useCallback, useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { ProductService, type Product } from "@/services/product.service";

const BottomNav = dynamic(() => import("@/components/bottom-nav"), { ssr: false });

function parseHash(): { storeId: string; productId: string } | null {
  if (typeof window === "undefined") return null;
  const h = window.location.hash?.replace(/^#/, "") || "";
  if (!h) return null;
  const [storeId, productId] = h.split("/").map(decodeURIComponent);
  if (!storeId || !productId) return null;
  return { storeId, productId };
}

function formatBRL(n: number) {
  try {
    return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(n);
  } catch {
    return `R$ ${Number(n || 0).toFixed(2)}`;
  }
}

export default function ProdutoPage() {
  const [pair, setPair] = useState<{ storeId: string; productId: string } | null>(null);
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(false);
  const [qty, setQty] = useState(1);

  // Mantém o hash -> pair
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    const read = () => setPair(parseHash());
    read();
    if (typeof window !== "undefined") {
      window.addEventListener("hashchange", read);
      return () => window.removeEventListener("hashchange", read);
    }
  }, []);

  // Busca o produto quando pair mudar
  useEffect(() => {
    let alive = true;
    (async () => {
      if (!pair) {
        setProduct(null);
        return;
      }
      setLoading(true);
      const p = await ProductService.getById(pair.storeId, pair.productId);
      if (alive) setProduct(p);
      setLoading(false);
    })();
    return () => {
      alive = false;
    };
  }, [pair]);

  const addToCart = useCallback(() => {
    if (!product) return;
    try {
      const raw = localStorage.getItem("mysnack_cart");
      const arr = raw ? JSON.parse(raw) : [];
      const items = Array.isArray(arr) ? arr.filter(Boolean) : [];
      const existing = items.find(
        (x: { id?: string | number }) => String(x.id) === String(product.id)
      );
      const nextQty = Math.max(1, Number(qty || 1));
      if (existing) {
        existing.qty = Number(existing.qty || 1) + nextQty;
      } else {
        items.push({ id: product.id, name: product.name, price: product.price, qty: nextQty });
      }
      localStorage.setItem("mysnack_cart", JSON.stringify(items));
      // meta para checkout (loja)
      localStorage.setItem(
        "mysnack_cart_meta",
        JSON.stringify({ storeId: product.storeId, storeName: product.storeName })
      );
      // avisa e abre carrinho
      window.dispatchEvent(new Event("cart-updated"));
      window.dispatchEvent(new Event("open-cart"));
    } catch (e) {
      console.error("addToCart error", e);
    }
  }, [product, qty]);

  return (
    <main className="pb-24">
      <div className="px-4 py-6">
        {loading && <div className="text-sm text-zinc-500">Carregando produto…</div>}
        {!loading && pair && !product && (
          <div className="text-sm text-red-600">Produto não encontrado.</div>
        )}
        {product && (
          <div className="max-w-2xl mx-auto">
            <div className="rounded-2xl border border-zinc-200 bg-white shadow-sm overflow-hidden">
              {product.imageUrl && (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img src={product.imageUrl} alt={product.name} className="w-full h-60 object-cover" />
              )}
              <div className="p-5">
                <h2 className="text-2xl font-semibold">{product.name}</h2>
                {product.description && (
                  <p className="mt-2 text-zinc-600 leading-relaxed">{product.description}</p>
                )}
                <div className="mt-4 text-2xl font-bold">{formatBRL(product.price)}</div>

                {/* Quantidade + Adicionar */}
                <div className="mt-6 flex items-center gap-3">
                  <div className="inline-flex items-center rounded-lg border px-2">
                    <button
                      className="px-3 py-2 text-lg"
                      onClick={() => setQty((q) => Math.max(1, q - 1))}
                      aria-label="Diminuir quantidade"
                    >
                      −
                    </button>
                    <input
                      className="w-12 text-center py-2 outline-none"
                      type="number"
                      min={1}
                      value={qty}
                      onChange={(e) =>
                        setQty(Math.max(1, parseInt(e.target.value || "1", 10)))
                      }
                    />
                    <button
                      className="px-3 py-2 text-lg"
                      onClick={() => setQty((q) => q + 1)}
                      aria-label="Aumentar quantidade"
                    >
                      +
                    </button>
                  </div>
                  <button
                    onClick={addToCart}
                    className="flex-1 rounded-xl bg-pink-600 px-4 py-3 font-semibold text-white shadow hover:brightness-95 active:translate-y-px"
                  >
                    Adicionar ao carrinho
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <BottomNav />
    </main>
  );
}
