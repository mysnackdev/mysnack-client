
"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/firebase";
import { OrderService, type SnackOrder, type OrderStatus } from "@/services/order.service";
import { isFinalStatus } from "@/constants/order-status";

const OrdersHeader = dynamic(() => import("@/components/orders/OrdersHeader"), { ssr: false });
const ScanTableBanner = dynamic(() => import("@/components/orders/ScanTableBanner"), { ssr: false });
const LastOrderCard = dynamic(() => import("@/components/orders/LastOrderCard"), { ssr: false });
const ReferBanner = dynamic(() => import("@/components/orders/ReferBanner"), { ssr: false });
const OrderAgainList = dynamic(() => import("@/components/orders/OrderAgainList"), { ssr: false });
const CouponBanner = dynamic(() => import("@/components/orders/CouponBanner"), { ssr: false });
const HistoryList = dynamic(() => import("@/components/orders/HistoryList"), { ssr: false });

type TabMode = "all" | "active" | "delivered";

function toDateLabel(ts: number) {
  const d = new Date(ts);
  return d.toLocaleDateString("pt-BR", { weekday: "short", day: "2-digit", month: "long", year: "numeric" });
}

export default function OrdersPage() {
  const [ready, setReady] = useState(false);
  const [uid, setUid] = useState<string | null>(null);

  const [tab, setTab] = useState<TabMode>("all");

  // Estado normalizado para evitar flicker: ids + mapa
  const [orderIds, setOrderIds] = useState<string[]>([]);
  const [ordersById, setOrdersById] = useState<Record<string, SnackOrder>>({});

  const [cursor, setCursor] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const initialLoadedRef = useRef(false);
  const unsubRef = useRef<(() => void) | null>(null);

  // Auth
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      setUid(user?.uid ?? null);
      setReady(true);
    });
    return () => unsub();
  }, []);

  // Real-time: assina últimos N pedidos para refletir status
  useEffect(() => {
    if (!ready || !uid) {
      setOrderIds([]);
      setOrdersById({});
      setLoading(false);
      unsubRef.current?.();
      unsubRef.current = null;
      return;
    }

    // Assina últimos 30 para atualizações em tempo real (status, novos pedidos)
    unsubRef.current?.();
    unsubRef.current = OrderService.subscribeUserOrders(uid, (list) => {
      setOrdersById((prev) => {
        const next = { ...prev };
        for (const o of list) {
          next[o.key] = { ...(prev[o.key] || o), ...o };
        }
        return next;
      });
      setOrderIds((prev) => {
        const ids = new Set(prev);
        let changed = false;
        for (const o of list) {
          if (!ids.has(o.key)) { ids.add(o.key); changed = true; }
        }
        // garante ordenação por createdAt desc apenas quando entra id novo
        if (changed) {
          const merged = Array.from(ids);
          merged.sort((a, b) => (ordersById[b]?.createdAt || 0) - (ordersById[a]?.createdAt || 0));
          return merged;
        }
        return prev;
      });
    }, 30);

    return () => { unsubRef.current?.(); unsubRef.current = null; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, uid]);

  // Primeira página de histórico (paginado) — apenas uma vez por sessão/autenticação
  const fetchPage = useCallback(async (reset: boolean) => {
    if (!uid) return;

    if (reset) {
      setLoading(true);
      setCursor(null);
      initialLoadedRef.current = false;
    } else {
      setLoadingMore(true);
    }

    try {
      const { orders: page, nextCursorCreatedAt } = await OrderService.getUserOrdersPaged({
        limit: 20,
        cursorCreatedAt: reset ? undefined : (cursor ?? undefined),
        status: tab === "delivered" ? ("pedido entregue" as OrderStatus) : undefined,
      });

      // merge idempotente (sem reordenar o que já existe)
      setOrdersById((prev) => {
        const next = { ...prev };
        for (const o of page) next[o.key] = { ...(prev[o.key] || o), ...o };
        return next;
      });
      setOrderIds((prev) => {
        const ids = new Set(prev);
        for (const o of page) ids.add(o.key);
        const merged = Array.from(ids);
        // ordena por createdAt desc com base no mapa atualizado
        merged.sort((a, b) => ((ordersById[b]?.createdAt ?? 0) - (ordersById[a]?.createdAt ?? 0)));
        return merged;
      });

      setCursor(typeof nextCursorCreatedAt === "number" ? nextCursorCreatedAt : null);
    } finally {
      if (reset) setLoading(false);
      else setLoadingMore(false);
      initialLoadedRef.current = true;
    }
  }, [uid, tab, cursor, ordersById]);

  // Carregamento inicial da página (uma vez)
  useEffect(() => {
    if (!ready || !uid) return;
    if (!initialLoadedRef.current) fetchPage(true);
  }, [ready, uid, fetchPage]);

  // Derivados
  const orders = useMemo(() => orderIds.map(id => ordersById[id]).filter(Boolean), [orderIds, ordersById]);

  const displayOrders = useMemo(() => {
    if (tab === "active") return orders.filter(o => !isFinalStatus(o.status));
    if (tab === "delivered") return orders.filter(o => isFinalStatus(o.status));
    return orders;
  }, [orders, tab]);

  const featured = displayOrders[0] ?? null;
  const lastData = featured ? {
    id: featured.key,
    storeName: featured.storeName ?? "Pedido MySnack",
    storeLogoUrl: featured.storeLogoUrl,
    itemsText:
      (featured.items?.slice(0, 2).map(i => i.name).join(", ") || "Seu pedido") +
      (featured.items && featured.items.length > 2 ? ` +${featured.items.length - 2}` : ""),
    totalText: (() => {
      const total = Array.isArray(featured.items)
        ? featured.items.reduce((acc, it) => acc + Number(it.price || 0) * Number(it.qty || 1), 0)
        : 0;
      return total ? total.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }) : undefined;
    })(),
  } : null;

  const againItems = featured ? [{
    id: featured.key,
    storeName: featured.storeName ?? "Pedido MySnack",
    title: featured.items?.[0]?.name ?? "Pedido recente",
  }] : [];

  const historyItems = useMemo(() => displayOrders.map(o => ({
    id: o.key,
    dateLabel: toDateLabel(o.createdAt),
    storeName: o.storeName ?? "Pedido MySnack",
    status: o.status === "pedido entregue" ? "Pedido concluído" : o.status,
    numberLabel: o.key.slice(-4),
    title: o.items?.[0]?.name ?? "Pedido",
  })), [displayOrders]);

  return (
    <main className="pb-10">
      <OrdersHeader />
      <ScanTableBanner />

      <div className="px-4 mt-4">
        <div className="inline-flex rounded-xl border border-zinc-200 bg-white p-1 shadow-sm">
          {[
            { key: "all", label: "Todos" },
            { key: "active", label: "Em andamento" },
            { key: "delivered", label: "Concluídos" },
          ].map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key as TabMode)}
              className={
                "px-3 py-2 rounded-lg text-sm " +
                (tab === t.key ? "bg-pink-600 text-white" : "text-zinc-700 hover:bg-zinc-100")
              }
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {lastData && <LastOrderCard data={lastData} />}

      <ReferBanner />
      {againItems.length > 0 && <OrderAgainList items={againItems} />}
      <CouponBanner />

      {loading ? (
        <div className="px-4 mt-6 text-sm text-zinc-500">Carregando pedidos…</div>
      ) : historyItems.length ? (
        <>
          <HistoryList items={historyItems} />
          <div className="px-4 pb-8">
            {cursor ? (
              <button
                onClick={() => fetchPage(false)}
                disabled={loadingMore}
                className="w-full mt-4 rounded-xl border border-zinc-300 bg-white py-3 text-sm font-medium hover:bg-zinc-50 disabled:opacity-60"
              >
                {loadingMore ? "Carregando…" : "Carregar mais"}
              </button>
            ) : (
              <div className="mt-4 text-center text-xs text-zinc-400">Fim do histórico</div>
            )}
          </div>
        </>
      ) : (
        <section className="px-4 mt-6 pb-10">
          <h3 className="text-xl font-semibold mb-3">Histórico</h3>
          <div className="rounded-2xl border border-dashed border-zinc-300 p-6 text-zinc-500 text-sm">
            Nenhum pedido para este filtro.
          </div>
        </section>
      )}
    </main>
  );
}
