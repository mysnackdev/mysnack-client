"use client";

import React, { useMemo, useState } from "react";
import { useStores, FoodStore } from "@/hooks/useStores";

export default function CategoriasPage() {
  const { stores, loading, error } = useStores();
  const [sel, setSel] = useState<string>("Todas");

  const categorias = useMemo(() => {
    const set = new Set<string>();
    stores.forEach((s) => {
      if (s.categoria && s.categoria.trim().length > 0) set.add(s.categoria);
    });
    return ["Todas", ...Array.from(set).sort((a, b) => a.localeCompare(b))];
  }, [stores]);

  const filtradas: FoodStore[] = useMemo(() => {
    if (sel === "Todas") return stores;
    return stores.filter((s) => (s.categoria ?? "").toLowerCase() === sel.toLowerCase());
  }, [stores, sel]);

  return (
    <main className="max-w-5xl mx-auto px-4 pb-24">
      <header className="py-6 flex items-center justify-between">
        <h1 className="text-xl font-semibold">Categorias</h1>
      </header>

      <section className="mb-4">
        <div className="flex flex-wrap gap-2">
          {categorias.map((c) => (
            <button
              key={c}
              className={`px-3 py-1 rounded-full border ${
                sel === c ? "bg-black text-white" : "bg-white"
              }`}
              onClick={() => setSel(c)}
            >
              {c}
            </button>
          ))}
        </div>
      </section>

      <section aria-busy={loading}>
        {loading && <p className="text-sm text-muted-foreground">Carregando…</p>}
        {error && !loading && <p className="text-sm text-red-600">Erro: {error}</p>}
        {!loading && !error && filtradas.length === 0 && (
          <p className="text-sm text-muted-foreground">Nenhuma loja encontrada.</p>
        )}

        <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {filtradas.map((s) => (
            <li key={s.id} className="rounded-xl border bg-white p-4 shadow-sm">
              <p className="font-semibold">{s.nome}</p>
              <p className="text-sm text-muted-foreground">{s.categoria ?? "—"}</p>
              {s.endereco && <p className="text-xs text-muted-foreground mt-1">{s.endereco}</p>}
              {s.telefone && <p className="text-xs text-muted-foreground">{s.telefone}</p>}
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
