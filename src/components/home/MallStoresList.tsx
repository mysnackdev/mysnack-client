"use client";
import { useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { useStores, type FoodStore } from "@/hooks/useStores";
import { useMall } from "@/context/MallContext";

type FoodStoreWithImages = FoodStore & {
  imageUrl?: string;
  logoUrl?: string;
  photoUrl?: string;
  image?: string;
  logo?: string;
};

function pickStoreImage(s: FoodStoreWithImages): string {
  const u =
    s.imageUrl ??
    s.logoUrl ??
    s.photoUrl ??
    s.image ??
    s.logo;
  return typeof u === "string" && u.trim().length > 0 ? u : "/placeholder-store.jpg";
}

export default function MallStoresList() {
  const { stores, loading } = useStores();
  const { mallId } = useMall();
  // compat: algumas fontes usam `nome` em vez de `name`
  const getName = (s: FoodStore) => (s?.nome ?? "");
  const getImage = (s: FoodStoreWithImages) => pickStoreImage(s);

  // Ordena: online primeiro, depois por nome
  const _sorted = useMemo(() => {
    return [...stores].sort((a: FoodStore, b: FoodStore) => {
      const on = Number(!!(b as FoodStore).online) - Number(!!(a as FoodStore).online);
      if (on !== 0) return on;
      return getName(a).localeCompare(getName(b), "pt-BR");
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

      {_sorted.length === 0 ? (
        <p className="text-sm text-zinc-500">Nenhuma loja encontrada.</p>
      ) : (
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {_sorted.map((s) => (
            <li key={s.id} className="flex items-center gap-3 rounded-xl border p-3">
              <Image
                src={getImage(s as FoodStoreWithImages)}
                alt={getName(s)}
                width={56}
                height={56}
                className="w-14 h-14 rounded-xl object-cover bg-zinc-100"
                unoptimized
              />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className={"inline-block w-2 h-2 rounded-full " + (s.online ? "bg-green-500" : "bg-zinc-300")} />
                  <p className="font-medium">{getName(s)}</p>
                </div>
                {!!s.categoria && <p className="text-xs text-zinc-500 mt-0.5">{s.categoria}</p>}
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
