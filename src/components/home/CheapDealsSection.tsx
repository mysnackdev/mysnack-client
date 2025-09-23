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
    if (!cur || typeof cur !== "object") return undefined;
    cur = (cur as Record<string, unknown>)[k];
  }
  return typeof cur === "string" ? cur : undefined;
}

/** Extrai imageUrl do Deal */
function getImageUrl(it: DealItem): string | undefined {
  return (
    (it as any).imageUrl ||
    getString(it as any, ["images", "0"]) ||
    getString(it as any, ["image", "url"]) ||
    undefined
  );
}

/** Deduz o storeId mais provável (ajuste conforme seu schema) */
function inferStoreId(it: DealItem): string | undefined {
  return (
    (it as any).storeId ||
    getString(it as any, ["store", "id"]) ||
    getString(it as any, ["loja", "id"]) ||
    undefined
  );
}

function safeSrc(u?: string | null) {
  if (!u) return null;
  const s = String(u).trim();
  return s.length ? s : null;
}

export default function CheapDealsSection() {
  const { mallId } = useMall();
  const [items, setItems] = useState<DealItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    setError(null);

    (async () => {
      try {
        type DealsSvc = { getCheapest?: (limit: number, mall?: string) => Promise<DealItem[]> };
        const svc = DealsService as unknown as DealsSvc;
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
      ) : items.length === 0 ? (
        <div className="text-sm text-zinc-500">Nada por aqui agora. Tente mais tarde.</div>
      ) : (
        <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
          {items.map((it) => {
            const storeId = inferStoreId(it) || "";
            const imageUrl = getImageUrl(it);
            const price = (it as any).price ?? (it as any).preco ?? 0;
            const name = (it as any).name ?? (it as any).titulo ?? "Item";

            return (
              <Link
                key={`${storeId}-${(it as any).id ?? name}`}
                href={`/produto#${encodeURIComponent(storeId)}/${encodeURIComponent((it as any).id ?? name)}`}
                className="min-w-[180px] max-w-[180px]"
              >
                <div className="w-[120px] h-[120px] mx-auto rounded-full ring-4 ring-orange-300 overflow-hidden">
                  <div className="relative w-full h-full">
                    {safeSrc(imageUrl) ? (
                      <Image
                        src={safeSrc(imageUrl)!}
                        alt={name}
                        fill
                        sizes="120px"
                        className="object-cover"
                        unoptimized
                      />
                    ) : (
                      <div className="w-full h-full grid place-items-center text-xs text-zinc-500">
                        sem imagem
                      </div>
                    )}
                  </div>
                </div>
                <div className="mt-2 text-center">
                  <div className="text-sm line-clamp-2">{name}</div>
                  <div className="font-semibold">{formatBRL(Number(price) || 0)}</div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </section>
  );
}
