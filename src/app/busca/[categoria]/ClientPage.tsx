"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useStores, type FoodStore } from "@/hooks/useStores";

type Props = { categoria: string };

const BottomNav = dynamic(() => import("@/components/bottom-nav"), { ssr: false });

function normalize(text: string): string {
  return (text || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
}

export default function StoresByCategoryClient({ categoria }: Props) {
  const { stores = [], loading } = useStores();
  const [free, setFree] = useState(false);
  const [order, setOrder] = useState<"az" | "za">("az");

  const normalizedCat = useMemo(() => normalize(categoria), [categoria]);

  const filtered: FoodStore[] = useMemo(() => {
    const arr = Array.isArray(stores) ? stores : [];
    return arr.filter((s) => normalize(s.categoria ?? "") === normalizedCat);
  }, [stores, normalizedCat]);

  const ordered: FoodStore[] = useMemo(() => {
    const list = [...filtered];
    list.sort((a, b) => {
      const byOnline = Number(Boolean(b.online)) - Number(Boolean(a.online));
      if (byOnline !== 0) return byOnline;
      const an = (a.nome ?? "").toString();
      const bn = (b.nome ?? "").toString();
      const cmp = an.localeCompare(bn, "pt-BR");
      return order === "az" ? cmp : -cmp;
    });
    return list;
  }, [filtered, order]);

  const finalList = ordered.filter(() => true); // placeholder in caso de usar o filtro "Entrega grátis"

  return (
    <main className="pb-24">
      <div className="mx-auto max-w-3xl px-4 pt-4">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-lg font-semibold">{decodeURIComponent(String(categoria || ""))}</h1>
          <Link href="/busca" className="text-sm text-pink-600">Voltar</Link>
        </div>

        {/* Filtros */}
        <div className="flex items-center gap-2 overflow-auto pb-2">
          <button
            onClick={() => setOrder(order === "az" ? "za" : "az")}
            className="rounded-full border px-3 py-1.5 text-sm"
          >
            Ordenar
          </button>
          <button
            onClick={() => setFree(!free)}
            className={"rounded-full border px-3 py-1.5 text-sm " + (free ? "border-pink-300 text-pink-600" : "")}
          >
            Entrega grátis
          </button>
          <button className="rounded-full border px-3 py-1.5 text-sm">Tipo</button>
        </div>

        {/* Lista */}
        <ul className="mt-3 space-y-3" aria-busy={loading}>
          {loading && <li className="text-sm text-zinc-500">Carregando…</li>}
          {!loading && finalList.map((s) => (
            <li key={s.id} className="flex items-center gap-3 rounded-xl border p-3">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className={"inline-block w-2 h-2 rounded-full " + (s.online ? "bg-green-500" : "bg-zinc-300")} />
                  <p className="font-medium">{s.nome}</p>
                </div>
                {!!s.categoria && <p className="text-xs text-zinc-500 mt-0.5">{s.categoria}</p>}
              </div>
              <Link
                href={`/loja/${encodeURIComponent(s.id)}`}
                className="rounded-full bg-pink-600 text-white text-sm px-4 py-1.5"
              >
                Ver
              </Link>
            </li>
          ))}
          {!loading && finalList.length === 0 && (
            <li className="text-sm text-zinc-500">Não encontramos lojas nessa categoria.</li>
          )}
        </ul>
      </div>

      <BottomNav active="busca" />
    </main>
  );
}
