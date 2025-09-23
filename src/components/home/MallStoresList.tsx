"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { StoreService } from "@/services/store.service";
import { useMall } from "@/context/MallContext";

type StoreCard = {
  id: string;
  name: string;
  online?: boolean;
  imageUrl?: string;
  categoria?: string;
};

/** utilitário: lê string aninhada com segurança */
function getString(obj: unknown, path: string[]): string | undefined {
  let cur: unknown = obj;
  for (const k of path) {
    if (typeof cur !== "object" || cur === null) return undefined;
    cur = (cur as Record<string, unknown>)[k];
  }
  return typeof cur === "string" ? cur : undefined;
}

/** utilitário: lê valor genérico aninhado */
function getValue(obj: unknown, path: string[]): unknown {
  let cur: unknown = obj;
  for (const k of path) {
    if (typeof cur !== "object" || cur === null) return undefined;
    cur = (cur as Record<string, unknown>)[k];
  }
  return cur;
}

/** utilitário: converte unknown para boolean de forma tolerante */
function toBool(v: unknown): boolean {
  if (typeof v === "boolean") return v;
  if (typeof v === "string") return v === "true" || v === "1";
  if (typeof v === "number") return v !== 0;
  return false;
}

/** tenta inferir o storeId a partir de diferentes formatos */
function inferStoreId(s: unknown): string {
  const id1 = getValue(s, ["id"]);
  const id2 = getValue(s, ["storeId"]);
  if (typeof id1 === "string" || typeof id1 === "number") return String(id1);
  if (typeof id2 === "string" || typeof id2 === "number") return String(id2);
  return "";
}

export default function MallStoresSection() {
  const [stores, setStores] = useState<StoreCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { mallId } = useMall();

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        type StoreApi = { getStores?: (opts?: { mallId?: string }) => Promise<unknown> };
        const svc = StoreService as unknown as StoreApi;

        // mallId pode ser string | null -> normaliza para undefined
        const mallParam: string | undefined = mallId ?? undefined;

        const raw =
          typeof svc.getStores === "function"
            ? await svc.getStores(mallParam ? { mallId: mallParam } : undefined)
            : [];

        // aceita duas formas de payload: { food_stores: [...] } ou [...]
        let arrUnknown: unknown[] = [];
        if (
          typeof raw === "object" &&
          raw !== null &&
          Array.isArray((raw as { food_stores?: unknown[] }).food_stores)
        ) {
          arrUnknown = (raw as { food_stores?: unknown[] }).food_stores as unknown[];
        } else if (Array.isArray(raw)) {
          arrUnknown = raw as unknown[];
        }

        // filtra por mall quando aplicável
        const filtered = mallParam
          ? arrUnknown.filter((s) => {
              const candidates = [
                getString(s, ["mallId"]),
                getString(s, ["tenantId"]),
                getString(s, ["mall", "id"]),
                getString(s, ["tenant", "id"]),
              ].filter((x): x is string => typeof x === "string");
              return candidates.includes(mallParam);
            })
          : arrUnknown;

        // mapeia para card simplificado
        const list: StoreCard[] = filtered.map((s) => {
          const id = inferStoreId(s);
          const name =
            getString(s, ["name"]) ??
            getString(s, ["displayName"]) ??
            "Loja";
          const online = toBool(getValue(s, ["online"]) ?? getValue(s, ["isOpenNow"]));
          const imageUrl = getString(s, ["imageUrl"]);
          const categoria = getString(s, ["category"]) ?? undefined;
          return { id, name, online, imageUrl, categoria };
        });

        if (alive) setStores(list);
      } catch (e: unknown) {
        console.error("MallStores error", e);
        const msg = e instanceof Error ? e.message : "Erro ao carregar lojas";
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
    <section className="px-4 mt-6 pb-10">
      <h2 className="text-lg font-semibold mb-3">Lojas no Shopping</h2>
      {loading ? (
        <div className="text-sm text-zinc-500">Carregando lojas…</div>
      ) : error ? (
        <div className="text-sm text-red-600">{error}</div>
      ) : !stores.length ? (
        <div className="text-sm text-zinc-500">Nenhuma loja encontrada.</div>
      ) : (
        <ul className="space-y-3">
          {sorted.map((s) => (
            <li key={s.id} className="flex items-center gap-3">
              <div className="relative w-12 h-12 rounded-full overflow-hidden ring-2 ring-zinc-200 flex-shrink-0">
                <Image
                  src={s.imageUrl || "/placeholder-store.jpg"}
                  alt={s.name}
                  fill
                  sizes="48px"
                  className="object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium truncate">{s.name}</div>
                <div className="text-xs text-zinc-500">
                  {s.categoria || "Lanches"} •{" "}
                  <span className={s.online ? "text-green-600" : "text-zinc-500"}>
                    {s.online ? "online" : "offline"}
                  </span>
                </div>
              </Link>
              <button className="text-zinc-400 hover:text-zinc-600" aria-label="favoritar">
                ♡
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
