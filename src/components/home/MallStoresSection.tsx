"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { CatalogService, type StoreSummary } from "@/services/catalog.service";
import { getTenantDelivery, coversPoint } from "@/services/tenant.service";
import { Heart } from "lucide-react";

function classNames(...cn: Array<string | false | null | undefined>) {
  return cn.filter(Boolean).join(" ");
}

function safeSrc(u?: string | null) {
  if (typeof u !== "string") return null;
  const s = u.trim();
  return s.length ? s : null;
}

export default function MallStoresSection() {
  const [stores, setStores] = useState<StoreSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [geo, setGeo] = useState<{lat:number; lng:number} | null>(null);
  const [nearby, setNearby] = useState<string[]>([]);
  const [, setGeoErr] = useState<string | null>(null);


  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        // Usa getStoresStatus() se existir; senão, cai para getOnlineStores()
        const anySvc = CatalogService as unknown as { getStoresStatus?: () => Promise<StoreSummary[]> };
        const list = anySvc.getStoresStatus ? await anySvc.getStoresStatus() : await CatalogService.getOnlineStores();
        if (mounted) setStores(Array.isArray(list) ? list : []);
      } catch {
        if (mounted) setStores([]);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    let alive = true;
    (async () => {
      if (!geo) { setNearby([]); return; }
      const ids: string[] = [];
      for (const s of stores) {
        try {
          const del = await getTenantDelivery(s.id);
          const hit = coversPoint(del, geo);
          if (hit.ok) ids.push(s.id);
        } catch {}
      }
      if (alive) setNearby(ids);
    })();
    return () => { alive = false; };
  }, [geo, stores]);

  if (loading && !stores.length) {
    return (
      <section className="mt-6">
        <h2 className="px-4 text-lg font-semibold">Lojas no Shopping</h2>
        <div className="px-4 mt-2">
          {!geo ? (
            <div className="rounded-xl border p-3 flex items-center justify-between bg-white">
              <p className="text-sm text-zinc-600">Ative sua localização para ver lojas que te atendem</p>
              <button
                className="rounded-full bg-pink-600 text-white text-sm px-4 py-1.5"
                onClick={() => {
                  setGeoErr(null);
                  navigator.geolocation.getCurrentPosition(
                    (pos) => setGeo({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
                    (err) => setGeoErr(err.message || "Não foi possível obter sua localização"),
                    { enableHighAccuracy: true, timeout: 8000 }
                  );
                }}
              >
                Ativar
              </button>
            </div>
          ) : (
            <div className="rounded-xl border p-3 bg-white">
              <div className="text-sm font-medium mb-1">Perto de você</div>
              <ul className="divide-y">
                {stores
                .filter((s) => nearby.includes(s.id))
                .sort((a,b)=> (b.online?1:0)-(a.online?1:0))
                .map((s) => (
                  <li key={s.id} className="py-2">
                    <Link href={`/loja/${s.id}`} className="flex items-center gap-3">
                      <span className="inline-block h-2 w-2 rounded-full bg-green-500" />
                      <span className="truncate">{s.displayName || s.name}</span>
                    </Link>
                  </li>
                ))}
                {stores.filter((s) => nearby.includes(s.id)).length === 0 && (
                  <li className="text-sm text-zinc-500 py-1">Nenhuma loja cobre sua região no momento.</li>
                )}
              </ul>
            </div>
          )}
        </div>

        <div className="mt-2 overflow-hidden rounded-2xl border border-zinc-200 bg-white">
          {[0,1,2].map((i) => (
            <div key={i} className={classNames("flex items-center gap-3 p-3", i === 0 ? "" : "border-t border-zinc-100")}>
              <div className="h-12 w-12 shrink-0 rounded-full bg-zinc-100 animate-pulse" />
              <div className="flex-1">
                <div className="h-4 w-40 bg-zinc-100 rounded animate-pulse mb-2" />
                <div className="h-3 w-24 bg-zinc-100 rounded animate-pulse" />
              </div>
              <div className="h-9 w-9 rounded-full bg-zinc-50" />
            </div>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="mt-6">
      <h2 className="px-4 text-lg font-semibold">Lojas no Shopping</h2>
        <div className="px-4 mt-2">
          {!geo ? (
            <div className="rounded-xl border p-3 flex items-center justify-between bg-white">
              <p className="text-sm text-zinc-600">Ative sua localização para ver lojas que te atendem</p>
              <button
                className="rounded-full bg-pink-600 text-white text-sm px-4 py-1.5"
                onClick={() => {
                  setGeoErr(null);
                  navigator.geolocation.getCurrentPosition(
                    (pos) => setGeo({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
                    (err) => setGeoErr(err.message || "Não foi possível obter sua localização"),
                    { enableHighAccuracy: true, timeout: 8000 }
                  );
                }}
              >
                Ativar
              </button>
            </div>
          ) : (
            <div className="rounded-xl border p-3 bg-white">
              <div className="text-sm font-medium mb-1">Perto de você</div>
              <ul className="divide-y">
                {stores
                .filter((s) => nearby.includes(s.id))
                .sort((a,b)=> (b.online?1:0)-(a.online?1:0))
                .map((s) => (
                  <li key={s.id} className="py-2">
                    <Link href={`/loja/${s.id}`} className="flex items-center gap-3">
                      <span className="inline-block h-2 w-2 rounded-full bg-green-500" />
                      <span className="truncate">{s.displayName || s.name}</span>
                    </Link>
                  </li>
                ))}
                {stores.filter((s) => nearby.includes(s.id)).length === 0 && (
                  <li className="text-sm text-zinc-500 py-1">Nenhuma loja cobre sua região no momento.</li>
                )}
              </ul>
            </div>
          )}
        </div>

      <div className="mt-2 overflow-hidden rounded-2xl border border-zinc-200 bg-white">
        {stores.map((s, idx) => (
          <Link
            key={s.id}
            href={`/loja/${s.id}`}
            className={classNames("flex items-center gap-3 p-3", idx === 0 ? "" : "border-t border-zinc-100")}
          >
            <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full bg-zinc-100">
              {safeSrc(s.imageUrl) ? (
                <Image
                  src={safeSrc(s.imageUrl)!}
                  alt={s.displayName || s.name}
                  fill
                  className="object-cover"
                  unoptimized
                />
              ) : (
                <div className="w-full h-full grid place-items-center text-xs text-zinc-500">logo</div>
              )}
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <div className="truncate font-medium">{s.displayName || s.name}</div>
                {s.online && <span className="rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-medium text-green-700">online</span>}
              </div>
              {s.categoria && <div className="truncate text-sm text-zinc-500">{s.categoria}</div>}
            </div>

            <button
              aria-label="favorite"
              className="ml-2 grid h-9 w-9 place-items-center rounded-full text-zinc-500 hover:bg-black/5"
              onClick={(e) => { e.preventDefault(); }}
            >
              <Heart size={18} />
            </button>
          </Link>
        ))}
      </div>
    </section>
  );
}
