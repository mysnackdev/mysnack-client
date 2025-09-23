"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronRight, ShoppingCart, BadgeCheck, ChefHat, Package, Bike, CheckCircle2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { subscribeUserOrders, type MirrorOrder } from "@/services/orders.mirror.service";
import { OrderService, type SnackOrder } from "@/services/order.service";
import { CatalogService } from "@/services/catalog.service";
import { getDatabase, ref, get, set } from "firebase/database";

const STATUS_STEPS = [
  "pedido realizado",
  "pedido confirmado",
  "pedido sendo preparado",
  "pedido pronto",
  "pedido indo até você",
  "pedido entregue",
] as const;

const STEP_ICONS = [ShoppingCart, BadgeCheck, ChefHat, Package, Bike, CheckCircle2] as const;

function brl(v?: number | null) {
  try {
    return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(Number(v || 0));
  } catch {
    return "R$ 0,00";
  }
}

function dateLabel(ts: number) {
  if (!ts) return "";
  const d = new Date(ts);
  const fmt = new Intl.DateTimeFormat("pt-BR", { weekday: "short", day: "2-digit", month: "long" });
  return fmt.format(d);
}

function normalize(s: string) {
  return String(s || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "");
}

function statusIndex(status: string, cancelled?: boolean) {
  if (cancelled) return 0;
  const s = normalize(status);
  const map: Record<string, number> = {
    "pedido realizado": 0, realizado: 0, criado: 0, criada: 0, novo: 0,
    "pedido confirmado": 1, confirmado: 1, "pagamento aprovado": 1,
    "pedido sendo preparado": 2, preparando: 2, "em preparo": 2, "em preparacao": 2,
    "pedido pronto": 3, pronto: 3, finalizado: 3, prontoentrega: 3,
    "pedido indo ate voce": 4, "a caminho": 4, "em entrega": 4, envio: 4,
    "pedido entregue": 5, entregue: 5, delivered: 5, recebido: 5,
  };
  if (s in map) return map[s];
  for (let i = STATUS_STEPS.length - 1; i >= 0; i--) {
    if (s.includes(normalize(STATUS_STEPS[i]))) return i;
  }
  return 0;
}

function isCanceled(status?: string, flag?: boolean) {
  if (flag) return true;
  const s = normalize(status || "");
  return s.includes("cancel");
}

function ItemsSummary({ items }: { items: Array<{ name?: string | null }> | undefined }) {
  const names = Array.isArray(items) ? items.map((i) => i?.name || "").filter(Boolean) : [];
  const text =
    names.length > 0
      ? [names[0], names[1]].filter(Boolean).join(" • ") + (names.length > 2 ? ` • +${names.length - 2}` : "")
      : "Pedido";
  return <div className="text-[15px] font-semibold truncate">{text}</div>;
}

function RatingStars({ orderId, uid }: { orderId: string; uid: string }) {
  const [value, setValue] = React.useState<number>(0);

  React.useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const db = getDatabase();
        const snap = await get(ref(db, `orders/${orderId}/ratings/${uid}`));
        const v: any = snap.exists() ? snap.val() : null;
        const n = typeof v === "number" ? v : (typeof v?.value === "number" ? v.value : 0);
        if (mounted) setValue(Math.max(0, Math.min(5, Number(n || 0))));
      } catch {}
    })();
    return () => { mounted = false; };
  }, [orderId, uid]);

  const onClick = async (n: number) => {
    setValue(n);
    try {
      const db = getDatabase();
      await set(ref(db, `orders/${orderId}/ratings/${uid}`), { value: n, updatedAt: Date.now() });
    } catch {}
  };

  return (
    <div className="mt-1 flex gap-1 text-yellow-400">
      {[1,2,3,4,5].map((i) => (
        <button
          key={i}
          onClick={(e) => { e.preventDefault(); onClick(i); }}
          aria-label={`Avaliar com ${i} estrelas`}
          className="text-2xl leading-none"
        >
          <span style={{ opacity: i <= value ? 1 : 0.25 }}>★</span>
        </button>
      ))}
    </div>
  );
}

function Stepper({ idx, cancelled }: { idx: number; cancelled?: boolean }) {
  const max = STATUS_STEPS.length - 1;
  const clamped = Math.max(0, Math.min(idx, max));
  return (
    <div className="mt-4">
      <div className="flex items-center">
        {STATUS_STEPS.map((_, i) => {
          const Icon = STEP_ICONS[i];
          const active = i <= clamped && !cancelled;
          const color = cancelled ? "bg-red-500 text-white" : active ? "bg-orange-500 text-white" : "bg-zinc-300 text-white";
          const lineColor = cancelled ? "bg-red-400" : i < clamped ? "bg-orange-400" : "bg-zinc-200";
          return (
            <div key={i} className="flex items-center flex-1">
              <div className={`grid place-items-center h-6 w-6 rounded-full ${color}`}>
                <Icon size={14} />
              </div>
              {i < max && <div className={`h-1 mx-2 flex-1 rounded ${lineColor}`} />}
            </div>
          );
        })}
      </div>
      <div className="mt-1 text-xs text-muted-foreground">{cancelled ? "Pedido cancelado" : STATUS_STEPS[clamped]}</div>
    </div>
  );
}

export default function HistoryList() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<MirrorOrder[] | null>(null);
  const [details, setDetails] = useState<Record<string, SnackOrder | null>>({});
  const [storeNames, setStoreNames] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!user) { setOrders([]); return; }
    let unsub: (() => void) | null = null;
    (async () => {
      unsub = await subscribeUserOrders(user.uid, setOrders);
    })();
    return () => { if (unsub) unsub(); };
  }, [user?.uid]);

  useEffect(() => {
    if (!orders || !orders.length) return;
    let cancelled = false; // type trick for TS-less environment
    (async () => {
      const ids = orders.map((o) => o.key).filter(Boolean);
      const missing = ids.filter((id) => !(id in details));
      if (!missing.length) return;
      const pairs = await Promise.all(
        missing.map(async (id) => {
          try {
            const data = await OrderService.getById(id);
            return [id, data] as const;
          } catch {
            return [id, null] as const;
          }
        })
      );
      if (!cancelled) {
        setDetails((prev) => {
          const next = { ...prev };
          for (const [id, d] of pairs) next[id] = d;
          return next;
        });
      }
    })();
    return () => { cancelled = true; };
  }, [orders]);

  /* fetch store names for orders */
  useEffect(() => {
    if (!orders || !orders.length) return;
    const pending: Array<{storeId: string, source: string}> = [];
    const collected: Record<string,string> = {};
    for (const o of orders) {
      const sid = (o.storeId as any) || ((details as any)[o.key]?.storeId as any) || "";
      if (!sid) continue;
      if (!(sid in storeNames)) {
        const fromDet = ((details as any)[o.key]?.store as any)?.displayName || ((details as any)[o.key]?.storeName as any);
        if (typeof fromDet === "string" && fromDet) {
          collected[sid] = fromDet;
        } else {
          pending.push({ storeId: sid, source: o.key });
        }
      }
    }
    if (Object.keys(collected).length) {
      setStoreNames((prev) => ({ ...prev, ...collected }));
    }
    if (pending.length) {
      (async () => {
        const pairs: Array<[string, string]> = [];
        for (const { storeId } of pending) {
          try {
            const cat = await CatalogService.getStoreCatalog(storeId);
            const name = (cat?.store?.displayName || cat?.store?.name || "").trim();
            if (name) pairs.push([storeId, name]);
          } catch {}
        }
        if (pairs.length) {
          setStoreNames((prev) => {
            const next = { ...prev };
            for (const [id, n] of pairs) next[id] = n;
            return next;
          });
        }
      })();
    }
  }, [orders, details, storeNames]);


  if (!user) return null;

  if (orders === null) {
    return (
      <section className="px-4 space-y-3">
        <div className="h-16 rounded-xl bg-zinc-100 animate-pulse" />
        <div className="h-16 rounded-xl bg-zinc-100 animate-pulse" />
        <div className="h-16 rounded-xl bg-zinc-100 animate-pulse" />
      </section>
    );
  }

  if (!orders.length) {
    return (
      <section className="px-4 text-sm text-zinc-500">
        Você ainda não tem pedidos.
      </section>
    );
  }

  return (
    <section className="px-4 space-y-3">
      {orders.map((o) => {
        const det = details[o.key] || null;
        const cancelled = isCanceled(o.status, o.cancelled);
        const idx = statusIndex(o.status, cancelled);

        return (
          <Link
            key={o.key}
            href={`/orders/${encodeURIComponent(o.key)}`}
            className="block rounded-2xl border border-zinc-200 bg-white shadow-[0_2px_8px_rgba(0,0,0,.04)] hover:shadow-[0_6px_20px_rgba(0,0,0,.08)] transition-shadow"
          >
            <div className="p-4">
              {/* Header with store avatar + name + total */}
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="text-xs text-zinc-500">{dateLabel(o.createdAt)}</div>
                  <div className="mt-1 flex items-start gap-3">
                    {/* store logo placeholder (use details if available) */}
                    <div className="h-10 w-10 rounded-full bg-zinc-100 shrink-0 overflow-hidden"></div>
                    <div className="min-w-0">
                      <div className="text-[15px] font-semibold truncate">{ storeNames[o.storeId || (det as any)?.storeId] || (det as any)?.store?.displayName || (det as any)?.storeName || (det as any)?.merchant?.name || "Loja" }</div>
                      <div className="mt-1 flex items-center gap-2 text-sm text-zinc-600">
                        <span className={cancelled ? "h-2 w-2 rounded-full bg-red-500 inline-block" : "h-2 w-2 rounded-full bg-emerald-500 inline-block"} />
                        <span className="truncate">
                          {cancelled ? "Pedido cancelado" : STATUS_STEPS[idx]}{" "}
                          {((det as any)?.humanId || (det as any)?.number) && (
                            <>• Nº {((det as any)?.humanId || (det as any)?.number)}</>
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                  {/* First line item summary */}
                  <div className="mt-2">
                    <ItemsSummary items={det?.items} />
                  </div>
                </div>
                <div className="shrink-0 text-right pt-6">
                  <div className="text-base font-semibold">{brl(o.total)}</div>
                </div>
              </div>

              {/* Stepper (must be kept) */}
              <Stepper idx={idx} cancelled={cancelled} />

              {/* Rating */}
              <div className="mt-3">
                <div className="text-sm font-semibold">Avaliação</div>
                <RatingStars orderId={o.key} uid={user!.uid} />
                
              </div>

              {/* Actions row */}
              <div className="mt-4 flex gap-3">
                {/* Ajuda button: only for in-progress statuses (1..4) */}
                {(!cancelled && idx > 0 && idx < 5) && (
                  <button
                    onClick={(e) => { e.preventDefault(); }}
                    className="flex-1 rounded-2xl border border-pink-300 bg-pink-50 py-3 text-center font-medium text-pink-600"
                  >
                    Ajuda
                  </button>
                )}

                {/* Pedir novamente: only when cancelled or concluded (idx==5 || cancelled) */}
                {((cancelled) || idx === 5) && (
                  <button
                    onClick={(e) => { e.preventDefault(); }}
                    className={(idx > 0 && idx < 5) ? "flex-1 rounded-2xl bg-pink-500 py-3 text-white font-semibold" : "flex-1 rounded-2xl bg-pink-500 py-3 text-white font-semibold w-full"}
                  >
                    Pedir novamente
                  </button>
                )}
              </div>
            </div>
          </Link>
        );
      })}
    </section>
  );
}


  
