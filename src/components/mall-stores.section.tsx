"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import { useStores } from "@/hooks";
import type { FoodStore } from "@/hooks/useStores";

function safeText(v: string | undefined): string {
  return (v ?? "").trim();
}

/** Lê com segurança uma prop string opcional sem usar `any` */
function getStringProp(obj: unknown, key: string): string | undefined {
  if (obj && typeof obj === "object") {
    const v = (obj as Record<string, unknown>)[key];
    return typeof v === "string" ? v : undefined;
  }
  return undefined;
}

export default function MallStoresSection() {
  const { stores, loading, error } = useStores();

  // Filtra lojas que parecem estar em "shopping"
  const shopping = useMemo<FoodStore[]>(() => {
    const rx = /shopping/i;
    return (stores ?? []).filter((s) => {
      const loc = safeText(getStringProp(s, "localizacao"));
      const nome = safeText(s.nome);
      const categoria = safeText(s.categoria);
      // considera localizacao, nome e categoria para aumentar recall
      return rx.test(loc) || rx.test(nome) || rx.test(categoria);
    });
  }, [stores]);

  if (loading) return <div className="card">Carregando lojas…</div>;
  if (error) return <div className="card text-red-600">Erro: {error}</div>;
  if (!shopping.length) return null;

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between px-1">
        <h2 className="text-lg font-semibold">Lojas em Shopping</h2>
        <Link href="/categorias" className="text-sm text-muted-foreground hover:underline">
          Ver todas
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {shopping.map((s) => {
          const endereco = getStringProp(s, "endereco");
          const localizacao = getStringProp(s, "localizacao");

          return (
            <Link
              key={s.id}
              href={`/categorias?store=${encodeURIComponent(s.nome)}`}
              className="overflow-hidden rounded-xl border bg-white shadow-sm transition hover:shadow-md"
            >
              <div className="aspect-[16/9] w-full overflow-hidden bg-gray-100">
                {/* Placeholder de imagem */}
                <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
                  {s.categoria ?? "Loja"}
                </div>
              </div>

              <div className="p-3">
                <p className="line-clamp-1 text-xs text-muted-foreground">
                  {localizacao ?? "—"}
                </p>
                <h3 className="line-clamp-1 text-base font-semibold">{s.nome}</h3>
                {endereco && (
                  <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                    {endereco}
                  </p>
                )}
                {s.telefone && (
                  <p className="text-xs text-muted-foreground">{s.telefone}</p>
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
