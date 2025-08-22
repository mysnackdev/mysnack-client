"use client";
import React from "react";
import { useStores } from "@/hooks";

type Store = {
  id?: string;
  nome?: string;
  // ...outros campos
};

function circleColor(i: number) {
  const palette = ["#F87171", "#FBBF24", "#34D399", "#60A5FA", "#A78BFA", "#F472B6"];
  return palette[i % palette.length];
}

export default function BrandHighlightsRow() {
  const { stores, loading /*, error*/ } = useStores() as {
    stores?: Store[] | null;
    loading: boolean;
  };

  if (loading) {
    return <div className="card">Carregando destaques…</div>;
  }

  // ✅ Fallback seguro
  const list: Store[] = Array.isArray(stores) ? stores : [];
  const top = list.slice(0, 5);

  if (top.length === 0) {
    return (
      <section className="space-y-3">
        <h2 className="text-xl font-bold">Destaques no MySnack</h2>
        <p className="text-sm text-muted-foreground">Nenhuma loja em destaque por enquanto.</p>
      </section>
    );
  }

  return (
    <section className="space-y-3">
      <h2 className="text-xl font-bold">Destaques no MySnack</h2>
      <div className="grid grid-cols-5 gap-6 py-2">
        {top.map((s, i) => {
          const firstLetter = (s?.nome ?? "").trim().charAt(0).toUpperCase() || "•";
          const shortName = (s?.nome ?? "—").split(/\s+/)[0];
          return (
            <div key={s?.id ?? `${shortName}-${i}`} className="flex flex-col items-center gap-2">
              <div
                className="rounded-full w-14 h-14 flex items-center justify-center shadow"
                style={{ background: circleColor(i), color: "#fff" }}
                aria-label={s?.nome ?? "Loja"}
                title={s?.nome ?? "Loja"}
              >
                <span className="font-bold">{firstLetter}</span>
              </div>
              <span className="text-xs text-center">{shortName}</span>
            </div>
          );
        })}
      </div>
    </section>
  );
}
