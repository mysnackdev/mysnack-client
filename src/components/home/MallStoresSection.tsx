"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import { StoreService } from "@/services/store.service";

type StoreCard = { id: string; name: string; online?: boolean; imageUrl?: string };

export default function MallStoresSection() {
  const [stores, setStores] = useState<StoreCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await StoreService.getStores();
        const list = (res.food_stores || []).map(s => ({
          id: s.id, name: s.name, online: s.online ?? s.isOpenNow, imageUrl: s.imageUrl
        }));
        if (alive) setStores(list);
      } catch (e: unknown) {
        console.error("MallStores error", e);
        setError(e instanceof Error ? e.message : "Erro ao carregar lojas");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, []);

  if (loading) return <div className="px-4 py-3 text-sm text-zinc-500">Carregando lojas…</div>;
  if (error) return <div className="px-4 py-3 text-sm text-red-600">{error}</div>;

  return (
    <section className="px-4">
      <h2 className="text-xl font-semibold mb-3">Lojas no Shopping</h2>
      {!stores.length ? (
        <div className="text-sm text-zinc-500">Nenhuma loja encontrada.</div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {stores.map((s) => (
            <div key={s.id} className="rounded-2xl border border-zinc-200 p-3 shadow-sm">
              <div className="relative w-full aspect-[16/9] rounded-xl overflow-hidden mb-2">
                <Image src={s.imageUrl || "/placeholder-store.jpg"} alt={s.name} fill sizes="(max-width:768px)45vw,25vw" className="object-cover" />
              </div>
              <div className="flex items-center justify-between">
                <div className="font-medium truncate">{s.name}</div>
                <span className={`inline-flex items-center gap-1 text-xs ${s.online ? "text-green-600" : "text-zinc-500"}`}>
                  <span className={`w-2 h-2 rounded-full ${s.online ? "bg-green-500" : "bg-zinc-400"}`}></span>
                  {s.online ? "online" : "offline"}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
