"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { CatalogService, type StoreSummary } from "@/services/catalog.service";
import { Heart } from "lucide-react";

function classNames(...cn: Array<string | false | null | undefined>) {
  return cn.filter(Boolean).join(" ");
}

export default function MallStoresSection() {
  const [stores, setStores] = useState<StoreSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        // Prefer richer status when available; fallback to online list
        const list = (await CatalogService.getStoresStatus?.()) ?? (await CatalogService.getOnlineStores());
        if (mounted) setStores(list || []);
      } catch {
        if (mounted) setStores([]);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  if (loading && !stores.length) {
    return (
      <section className="mt-6">
        <h2 className="px-4 text-lg font-semibold">Lojas no Shopping</h2>
        <div className="mt-2 rounded-2xl border border-zinc-200 bg-white">
          {[...Array(4)].map((_, i) => (
            <div key={i} className={classNames("flex items-center gap-3 p-3", i===0?"":"border-t border-zinc-100")}>
              <div className="h-12 w-12 animate-pulse rounded-full bg-zinc-100" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-40 animate-pulse rounded bg-zinc-100" />
                <div className="h-3 w-56 animate-pulse rounded bg-zinc-100" />
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
      <div className="mt-2 overflow-hidden rounded-2xl border border-zinc-200 bg-white">
        {stores.map((s, idx) => (
          <Link
            key={s.id}
            href={`/loja/${s.id}`}
            className={classNames("flex items-center gap-3 p-3", idx === 0 ? "" : "border-t border-zinc-100")}
          >
            <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full bg-zinc-100">
              <Image
                src={s.imageUrl || "/store-placeholder.png"}
                alt={s.displayName || s.name}
                fill
                className="object-cover"
              />
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
  <div className="truncate font-medium">{s.displayName || s.name}</div>
  <span className={`inline-flex items-center gap-1 text-xs ${s.online ? "text-emerald-600" : "text-zinc-500"}`}>
    <span className={`h-2 w-2 rounded-full ${s.online ? "bg-emerald-500" : "bg-zinc-400"}`}></span>
    {s.online ? "online" : "offline"}
  </span>
  {idx < 3 && <span className="ml-1 rounded bg-amber-100 px-1.5 py-0.5 text-[10px] text-amber-800">Patrocinado</span>}
</div>

              <div className="mt-0.5 text-[12px] text-zinc-500">
                <span>★ 4,7</span>
                <span className="mx-1">•</span>
                <span>{s.categoria || "Lanches"}</span>
                <span className="mx-1">•</span>
                <span>0,4 km</span>
              </div>

              <div className="mt-0.5 text-[12px] text-zinc-500">
                <span>25–35 min</span>
                <span className="mx-1">•</span>
                <span>Grátis</span>
              </div>
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