"use client";

import React from "react";
import Link from "next/link";
import BottomNav from "@/components/BottomNav";
import { useStores } from "@/hooks/useStores";

// Remove acentos sem usar \p{...} (compatível com targets mais antigos)
function normalize(text: string): string {
  return (text || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // remove combining marks
    .trim();
}

export default function BuscaPage() {
  const { stores, loading, error } = useStores();
  const [q, setQ] = React.useState<string>("");

  const results = React.useMemo(() => {
    const term = normalize(q);
    if (!term) return stores;
    return (stores ?? []).filter((s) => {
      const inStore =
        normalize(s.nome).includes(term) ||
        normalize(s.categoria ?? "").includes(term) ||
        normalize(s.localizacao ?? "").includes(term);
      const inCombos = (s.pacotes ?? []).some((c) => normalize(c.nome).includes(term));
      return inStore || inCombos;
    });
  }, [q, stores]);

  return (
    <main className="max-w-5xl mx-auto px-4 pb-24">
      <header className="py-6">
        <h1 className="text-xl font-semibold">Busca</h1>
      </header>

      <div className="py-2">
        <label htmlFor="q" className="sr-only">Buscar</label>
        <input
          id="q"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Buscar lojas ou combos"
          className="w-full rounded-md border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-black/20"
          autoFocus
        />
      </div>

      {loading && <p className="text-sm text-muted-foreground">Carregando…</p>}
      {error && <p className="text-sm text-red-600">Erro: {error}</p>}

      <ul className="space-y-3">
        {(results ?? []).map((s) => (
          <li key={s.id} className="rounded-xl border bg-white p-4 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-semibold">{s.nome}</p>
                <p className="text-xs text-muted-foreground">
                  {s.categoria ?? "—"} {s.localizacao ? `• ${s.localizacao}` : ""}
                </p>
              </div>
              <Link
                href={`/categorias?store=${encodeURIComponent(s.nome)}`}
                className="text-sm text-muted-foreground hover:underline"
              >
                Ver
              </Link>
            </div>
            {(s.pacotes ?? []).length > 0 && (
              <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
                {(s.pacotes ?? []).slice(0, 4).map((c) => (
                  <div key={c.id} className="rounded-lg border p-3">
                    <p className="text-sm font-medium line-clamp-1">{c.nome}</p>
                    <p className="text-xs text-muted-foreground">R$ {c.preco.toFixed(2)}</p>
                  </div>
                ))}
              </div>
            )}
          </li>
        ))}
      </ul>

      <BottomNav />
    </main>
  );
}
