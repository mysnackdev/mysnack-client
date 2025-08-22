"use client";
import React, { useMemo } from "react";
import { useStores } from "@/hooks";
import { StoreCard } from "./store-card.component";

export default function MallStores() {
  const { stores, loading } = useStores();

  const shopping = useMemo(() => {
    const rx = /shopping/i;
    return stores.filter(s => rx.test(s.localizacao));
  }, [stores]);

  if (loading) return <div className="card">Carregando lojas…</div>;

  return (
    <section aria-labelledby="shopping-title" className="space-y-3">
      <h2 id="shopping-title" className="text-2xl font-bold">Lojas no Shopping</h2>
      {shopping.length ? (
        <div className="space-y-3">
          {shopping.map((s, i) => <StoreCard key={i} store={s} />)}
        </div>
      ) : (
        <div className="card">Nenhuma loja encontrada no Shopping</div>
      )}
    </section>
  );
}