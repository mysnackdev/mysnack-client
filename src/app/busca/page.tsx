"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useStores } from "@/hooks/useStores";
import { getTenantDelivery, coversPoint } from "@/services/tenant.service";

const BottomNav = dynamic(() => import("@/components/bottom-nav"), { ssr: false });

function normalize(text: string): string {
  return (text || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
}

export default function BuscaPage() {
  const { stores = [], loading } = useStores();
  const [geo, setGeo] = useState<{lat:number; lng:number} | null>(null);
  const [nearby, setNearby] = useState<string[]>([]);
  const [geoErr, setGeoErr] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  const uniqueCategories = useMemo(() => {
    const set = new Set<string>();
    for (const s of stores) {
      const c = (s.categoria || "").trim();
      if (c) set.add(c);
    }
    return Array.from(set).sort((a, b) => a.localeCompare(b, "pt-BR"));
  }, [stores]);

  const filteredStores = useMemo(() => {
    if (!query) return [];
    const q = normalize(query);
    return stores.filter((s) =>
      normalize(s.nome).includes(q) ||
      normalize(s.categoria || "").includes(q)
    ).slice(0, 6);
  }, [query, stores]);

  React.useEffect(() => {
    let alive = true;
    (async () => {
      if (!geo) { setNearby([]); return; }
      const hits: string[] = [];
      for (const s of stores) {
        try {
          const del = await getTenantDelivery(s.id);
          const cover = coversPoint(del, geo);
          if (cover.ok) hits.push(s.id);
        } catch {}
      }
      if (alive) setNearby(hits);
    })();
    return () => { alive = false; };
  }, [geo, stores]);

  return (
    <main className="pb-24">
      {/* Top search */}
      <div className="sticky top-0 z-10 bg-white/70 backdrop-blur supports-[backdrop-filter]:bg-white/50">
        <div className="mx-auto max-w-3xl px-4 py-3">
          <label className="flex items-center gap-3 rounded-full border px-4 py-2 bg-white">
            <span className="text-zinc-400">🔍</span>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="O que vai pedir hoje?"
              className="w-full bg-transparent outline-none placeholder:text-zinc-400"
            />
          </label>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-4 pt-3 space-y-6">
        {query ? (
          <section>
            <h2 className="text-base font-semibold mb-3">Resultados</h2>
            <ul className="space-y-2">
              {filteredStores.map((s) => (
                <li key={s.id} className="rounded-xl border p-3 flex items-center justify-between">
                  <div>
                    <p className="font-medium">{s.nome}</p>
                    <p className="text-xs text-zinc-500">{s.categoria || "—"}</p>
                  </div>
                  <Link href={`/loja/${encodeURIComponent(s.id)}`} className="rounded-full bg-pink-600 text-white text-sm px-4 py-1.5">
                    Ver loja
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ) : (
          <>
            {/* Categories */}
            <section>
              <h2 className="text-base font-semibold mb-3">Categorias</h2>
              {loading && <div className="text-sm text-zinc-500">Carregando…</div>}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {uniqueCategories.map((cat) => (
                  <Link
                    href={`/busca/${encodeURIComponent(normalize(cat))}`}
                    key={cat}
                    className="rounded-xl p-4 text-white"
                    style={{ background: "linear-gradient(135deg, #ff7aa2, #ff4d79)" }}
                  >
                    <div className="text-sm opacity-90">explorar</div>
                    <div className="text-lg font-semibold leading-tight">{cat}</div>
                  </Link>
                ))}
              </div>
            </section>

            {/* Lojas perto de mim (usando delivery/areas do tenant) */}
            <section>
              <h2 className="text-base font-semibold mb-3">Perto de você</h2>
              {!geo && (
                <div className="rounded-xl border p-3 flex items-center justify-between">
                  <p className="text-sm text-zinc-600">Ative sua localização para ver lojas que te atendem</p>
                  <button
                    className="rounded-full bg-pink-600 text-white text-sm px-4 py-1.5"
                    onClick={() => {
                      setGeoErr(null);
                      if (!("geolocation" in navigator)) { setGeoErr("Seu dispositivo não suporta GPS"); return; }
                      navigator.geolocation.getCurrentPosition(
                        (pos) => setGeo({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
                        (err) => setGeoErr(err.message || "Não foi possível obter sua localização"),
                        { enableHighAccuracy: true, timeout: 12000, maximumAge: 300000 }
                      );
                    }}
                  >
                    Ativar localização
                  </button>
                </div>
              )}
              {geoErr && <p className="mt-2 text-xs text-red-600">{geoErr}</p>}
              {geo && (
                <ul className="space-y-2 mt-2">
                  {stores.filter((s) => nearby.includes(s.id)).map((s) => (
                    <li key={s.id} className="rounded-xl border p-3 flex items-center justify-between">
                      <div>
                        <p className="font-medium">{s.nome}</p>
                        <p className="text-xs text-zinc-500">{s.categoria || "—"} • {s.online ? "Aberto" : "Fechado"}</p>
                      </div>
                      <Link href={`/loja/${encodeURIComponent(s.id)}`} className="rounded-full bg-pink-600 text-white text-sm px-4 py-1.5">
                        Ver loja
                      </Link>
                    </li>
                  ))}
                  {stores.filter((s) => nearby.includes(s.id)).length === 0 && (
                    <li className="text-sm text-zinc-500">Nenhuma loja cobre sua região no momento.</li>
                  )}
                </ul>
              )}
            </section>
          </>
        )}
      </div>

      <BottomNav active="busca" />
    </main>
  );
}
