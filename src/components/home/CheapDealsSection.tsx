"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { DealsService, type DealItem } from "@/services/deals.service";
import { useMall } from "@/context/MallContext";

function formatBRL(v: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);
}

/** Utilitário seguro para ler string aninhada sem usar `any` */
function getString(obj: unknown, path: string[]): string | undefined {
  let cur: unknown = obj;
  for (const k of path) {
    if (typeof cur !== "object" || cur === null) return undefined;
    cur = (cur as Record<string, unknown>)[k];
  }
  return typeof cur === "string" ? cur : undefined;
}

/** Tenta inferir o storeId em estruturas diferentes (compatível com payloads antigos) */
function inferStoreId(it: unknown): string | undefined {
  return (
    getString(it, ["storeId"]) ??
    getString(it, ["tenantId"]) ??
    getString(it, ["mall", "id"]) ??
    getString(it, ["tenant", "id"]) ??
    undefined
  );
}

export default function CheapDealsSection() {
  const [items, setItems] = useState<DealItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { mallId } = useMall();

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        type DealsSvc = { getCheapest?: (limit: number, mall?: string) => Promise<DealItem[]> };
        const svc = DealsService as unknown as DealsSvc;

        // mallId pode ser string | null -> normaliza para undefined
        const mallParam: string | undefined = mallId ?? undefined;

        const res: DealItem[] =
          typeof svc.getCheapest === "function" ? await svc.getCheapest(12, mallParam) : [];

        const list = Array.isArray(res) ? res : [];

        const filtered = mallId
          ? list.filter((it) => {
              const candidate = inferStoreId(it);
              return typeof candidate === "string" && candidate === mallId;
            })
          : list;

        if (alive) setItems(filtered);
      } catch (e: unknown) {
        console.error("CheapDeals error", e);
        const msg = e instanceof Error ? e.message : "Erro ao carregar ofertas";
        setError(msg);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [mallId]);

  return (
    <section className="px-4 mt-5">
      <h2 className="text-lg font-semibold mb-3">Baratinhos no MySnack</h2>
      {loading ? (
        <div className="text-sm text-zinc-500">Carregando baratinhos…</div>
      ) : error ? (
        <div className="text-sm text-red-600">{error}</div>
      ) : !items.length ? (
        <div className="text-sm text-zinc-500">Sem ofertas no momento.</div>
      ) : (
        <div className="flex gap-5 overflow-x-auto pb-2 no-scrollbar">
          {items.map((it) => {
            const storeId = inferStoreId(it) ?? "";
            const imageUrl = getString(it as unknown, ["imageUrl"]) ?? "/placeholder-food.jpg";
            const storeName = getString(it as unknown, ["storeName"]) ?? "Loja";

            return (
              <Link
                key={`${storeId}-${it.id}`}
                href={`/produto#${encodeURIComponent(storeId)}/${encodeURIComponent(it.id)}`}
                className="min-w-[180px] max-w-[180px]"
              >
                <div className="w-[120px] h-[120px] mx-auto rounded-full ring-4 ring-orange-300 overflow-hidden">
                  <div className="relative w-full h-full">
                    <Image
                      src={imageUrl}
                      alt={it.name}
                      fill
                      sizes="120px"
                      className="object-cover"
                    />
                  </div>
                </div>
                <div className="mt-2 text-center">
                  <div className="font-semibold">{storeName}</div>
                  <div className="text-xs text-zinc-600 line-clamp-2 h-8">{it.name}</div>
                  <div className="text-green-600 font-semibold mt-1">{formatBRL(it.price)}</div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </section>
  );
}
