"use client";
import { useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { useStores, type FoodStore } from "@/hooks/useStores";
import { useMall } from "@/context/MallContext";

export default function MallStoresList() {
  const { stores, loading } = useStores();
  const { mallId } = useMall();
  // compat: algumas fontes usam `nome` em vez de `name`
  const getName = (s: FoodStore | any) => (s?.name ?? s?.nome ?? "");
  const getImage = (s: FoodStore | any) => (s?.imageUrl ?? s?.logoUrl ?? s?.photoUrl ?? s?.image ?? s?.logo ?? "/placeholder-store.jpg");


  // Ordena: online primeiro, depois por nome
  const sorted = useMemo(() => {
    return [...stores].sort((a: FoodStore, b: FoodStore) => {
      const on = Number(!!b.online) - Number(!!a.online);
      if (on !== 0) return on;
      return getName(a).localeCompare(getName(b), "pt-BR", { sensitivity: "base" });
    });
  }, [stores]);

  if (loading) {
    return (
      <section className="p-4" aria-busy>
        <p className="text-sm text-zinc-500">Carregando lojas…</p>
      </section>
    );
  }

  return (
    <section className="p-4">
      <h2 className="text-lg font-semibold mb-3">Lojas {mallId ? `— ${mallId}` : ""}</h2>

      {sorted.length === 0 ? (
        <p className="text-sm text-zinc-500">Nenhuma loja encontrada.</p>
      ) : (
        <ul className="space-y-3">
          {sorted.map((s) => (
            <li key={s.id} className="flex items-center gap-3">
              <div className="relative w-12 h-12 rounded-full overflow-hidden ring-2 ring-zinc-200 flex-shrink-0">
                <Image
                  src={getImage(s)}
                  alt={getName(s)}
                  fill
                  sizes="48px"
                  className="object-cover"
                />
              </div>

              <div className="flex-1 min-w-0">
                <div className="font-medium truncate">{getName(s)}</div>
                <div className="text-xs text-zinc-500">
                  {(s as any).categoria || "Lanches"} • {s.online ? "Aberto" : "Fechado"}
                </div>
              </div>

              <Link
                href={`/loja/${encodeURIComponent(s.id)}`}
                className="rounded-full bg-pink-600 text-white text-sm px-4 py-1.5"
              >
                Ver
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
