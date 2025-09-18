"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { StoreService } from "@/services/store.service";

type Product = { id: string; name: string; description?: string; price: number; imageUrl?: string; storeId: string; storeName?: string; };
type Catalog = { items?: Product[] } | Product[];
function formatBRL(n: number) { return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(n); }
function isProductArray(x: unknown): x is Product[] { return Array.isArray(x); }

export default function ProdutoClient({ id, storeId }: { id: string; storeId: string }) {
  const [p, setP] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  function addToCart() {
    try {
      if (!p) return;
      const raw = localStorage.getItem("mysnack_cart");
      const arr: Array<{ id: string; name: string; qty: number; price: number }> = raw ? JSON.parse(raw) : [];
      const id = `${p.storeId || "loja"}::${p.id || p.name}`;
      const found = arr.find((x) => x.id === id);
      if (found) found.qty += 1; else arr.push({ id, name: p.name, qty: 1, price: Number(p.price || 0) });
      localStorage.setItem("mysnack_cart", JSON.stringify(arr));
      window.dispatchEvent(new Event("cart-updated"));
      window.dispatchEvent(new Event("open-cart"));
    } catch (e) { console.error("addToCart failed", e); }
  }

  const svc = useMemo(() => (StoreService as unknown) as {
    getItem?: (storeId: string, itemId: string) => Promise<Product>;
    getCatalog?: (storeId: string) => Promise<Catalog>;
    getStores?: (opts?: { mallId?: string | null }) => Promise<{ food_stores?: { id?: string }[] } | { id?: string }[]>;
  }, []);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        if (!id) throw new Error("ID do produto ausente.");
        setLoading(true); setErr(null);
        let found: Product | undefined;
        if (!found && storeId && svc.getItem) {
          found = await svc.getItem(storeId, id);
        }
        if (!found && storeId && svc.getCatalog) {
          const cat = await svc.getCatalog(storeId);
          const items = isProductArray(cat) ? cat : (cat.items ?? []);
          found = items.find((it) => it.id === id);
        }
        if (!found && svc.getStores && svc.getCatalog) {
          const raw = await svc.getStores();
          const stores = Array.isArray(raw) ? raw : (Array.isArray((raw as { food_stores?: unknown[] }).food_stores) ? (raw as { food_stores: unknown[] }).food_stores : []);
          const ids: string[] = stores.map((s: unknown) => (typeof s === "object" && s && "id" in s) ? String((s as { id?: unknown }).id ?? "") : "").filter(Boolean);
          const max = Math.min(ids.length, 25);
          for (let i = 0; i < max; i++) {
            const sid = ids[i];
            const cat = await svc.getCatalog(sid);
            const items = isProductArray(cat) ? cat : (cat.items ?? []);
            const match = items.find((it) => it.id === id);
            if (match) { found = match; break; }
          }
        }
        if (!found) throw new Error("Produto não encontrado.");
        if (alive) setP(found);
      } catch (e) {
        if (alive) setErr((e as Error).message);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [id, storeId, svc]);

  if (!id) return <main className="p-6 max-w-3xl mx-auto"><div className="text-sm text-zinc-600">Informe o produto válido.</div></main>;
  if (loading) return <main className="p-6">Carregando produto…</main>;
  if (err) return <main className="p-6 text-red-600">{err}</main>;
  if (!p) return null;

  return (
    <main className="p-4 max-w-3xl mx-auto">
      <div className="relative w-full h-[260px] rounded-2xl overflow-hidden shadow">
        <Image src={p.imageUrl || "/placeholder-food.jpg"} alt={p.name} fill sizes="(max-width: 768px) 100vw, 700px" className="object-cover" />
      </div>
      <h1 className="mt-4 text-2xl font-semibold">{p.name}</h1>
      {p.storeName && <p className="text-sm text-zinc-500">{p.storeName}</p>}
      <div className="mt-3 text-emerald-600 text-xl font-bold">{formatBRL(p.price)}</div>
      {p.description && <p className="mt-3 text-zinc-700">{p.description}</p>}
      <div className="mt-6 grid grid-cols-2 gap-3">
        <button onClick={addToCart} className="w-full bg-pink-600 text-white py-3 rounded-2xl shadow">Adicionar à sacola</button>
        <Link href="/" className="w-full bg-white border text-zinc-700 py-3 rounded-2xl text-center">Voltar</Link>
      </div>
    </main>
  );
}
