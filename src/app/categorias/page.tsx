"use client";
import React, { useMemo, useState } from "react";
import { useStores } from "@/hooks";
import { StoreCard } from "@/components/store-card.component";
import type { FoodStore } from "@/@types";

function keyForStore(s: Partial<FoodStore>, i: number) {
  // usa 'id' se existir no objeto em runtime, sem depender do tipo
  const id =
    s && typeof s === "object" && "id" in s
      ? (s as { id?: string | number }).id
      : undefined;

  const nome = s?.nome?.toString().trim();
  const categoria = s?.categoria?.toString().trim() || "Outros";
  return id ?? (nome ? `${nome}-${categoria}` : `store-${i}`);
}

export default function CategoriasPage() {
  const { stores, loading, error, refetch } = useStores();
  const [sel, setSel] = useState<string>("Todas");

  const categorias = useMemo(() => {
    const set = new Set<string>();
    for (const s of stores) {
      const cat = (s?.categoria ?? "Outros").toString().trim();
      if (cat) set.add(cat);
    }
    return ["Todas", ...Array.from(set).sort((a, b) => a.localeCompare(b))];
  }, [stores]);

  const filtradas = useMemo(() => {
    if (sel === "Todas") return stores;
    return stores.filter((s) => (s?.categoria ?? "Outros").toString().trim() === sel);
  }, [stores, sel]);

  return (
    <main className="max-w-5xl mx-auto px-4">
      <header className="py-8">
        <h1 className="text-3xl font-bold">Categorias</h1>
        <p className="muted">Filtre as lojas por tipo de serviço.</p>
      </header>

      {/* Banner de erro e ação de tentar novamente */}
      {error && (
        <div className="mb-4 rounded-md border border-red-300 bg-red-50 p-3 text-red-800">
          {error}
          <button
            onClick={refetch}
            className="ml-3 inline-flex items-center rounded border px-2 py-1 text-sm hover:bg-red-100"
          >
            Tentar novamente
          </button>
        </div>
      )}

      <div className="flex flex-wrap gap-2 mb-6">
        {categorias.map((c) => (
          <button
            key={c}
            onClick={() => setSel(c)}
            aria-pressed={sel === c}
            className={
              "px-3 py-1 rounded-full border transition-colors " +
              (sel === c ? "bg-black text-white border-black" : "hover:bg-gray-100")
            }
          >
            {c}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-40">Carregando...</div>
      ) : filtradas.length ? (
        <div className="space-y-3">
          {filtradas
            .filter(Boolean)
            .map((s, i) => <StoreCard key={keyForStore(s, i)} store={s} />)}
        </div>
      ) : (
        <div className="flex justify-center items-center h-40">Nenhuma loja encontrada</div>
      )}
    </main>
  );
}
