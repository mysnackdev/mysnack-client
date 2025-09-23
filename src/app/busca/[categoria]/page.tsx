"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import dynamic from "next/dynamic";
import { useStores } from "@/hooks/useStores";

const BottomNav = dynamic(() => import("@/components/bottom-nav"), { ssr: false });

function normalize(text: string): string {
  return (text || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
}

export default function StoresByCategoryPage() {
  const { categoria } = useParams<{ categoria: string }>();
  const [free, setFree] = useState(false);
  const [order, setOrder] = useState<"az" | "za">("az");
  const { stores = [], loading } = useStores();

  const filtered = useMemo(() => {
    const cat = decodeURIComponent(String(categoria || ""));
    const items = stores.filter((s) => normalize(s.categoria || "") === normalize(cat));
    items.sort((a, b) => order === "az" ? a.nome.localeCompare(b.nome, "pt-BR") : b.nome.localeCompare(a.nome, "pt-BR"));
    return items;
  }, [stores, categoria, order]);

  return (
    <main className="pb-24">
      <div className="mx-auto max-w-3xl px-4 pt-4">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-lg font-semibold">{decodeURIComponent(String(categoria || ""))}</h1>
          <Link href="/busca" className="text-sm text-pink-600">Voltar</Link>
        </div>

        {/* Filtros */}
        <div className="flex items-center gap-2 overflow-auto pb-2">
          <button onClick={() => setOrder(order === "az" ? "za" : "az")} className="rounded-full border px-3 py-1.5 text-sm">Ordenar</button>
          <button onClick={() => setFree(!free)} className={`rounded-full border px-3 py-1.5 text-sm ${free ? "bg-pink-50 border-pink-300 text-pink-600" : ""}`}>Entrega grátis</button>
          <button className="rounded-full border px-3 py-1.5 text-sm">Tipo</button>
        </div>

        <ul className="mt-3 space-y-3">
          {(loading ? [] : filtered).map((s) => (
            <li key={s.id} className="rounded-xl border p-3 flex items-center justify-between">
              <div className="min-w-0">
                <p className="font-medium truncate">{s.nome}</p>
                <p className="text-xs text-zinc-500">{s.categoria || "—"} • {s.online ? "Aberto" : "Fechado"}</p>
              </div>
              <Link href={`/loja/${encodeURIComponent(s.id)}`} className="rounded-full bg-pink-600 text-white text-sm px-4 py-1.5">Ver</Link>
            </li>
          ))}
          {(!loading && filtered.length === 0) && (
            <li className="text-sm text-zinc-500">Não encontramos lojas nessa categoria.</li>
          )}
        </ul>
      </div>

      <BottomNav active="busca" />
    </main>
  );
}
