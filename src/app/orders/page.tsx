"use client";
import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/firebase";
import { OrderService, type SnackOrder } from "@/services/order.service";

// Tipos e service auxiliar para buscar detalhes em /orders/{id}
import { getDatabase, ref, get, child } from "firebase/database";
type SnackOrderDetails = SnackOrder & { total?: number; storeName?: string; storeLogoUrl?: string };
async function getOrderDetails(orderId: string): Promise<SnackOrderDetails | null> {
  const db = getDatabase();
  const snap = await get(child(ref(db), `orders/${orderId}`));
  if (!snap.exists()) return null;
  const v = snap.val() || {};
  return {
    key: orderId,
    uid: v.uid,
    storeId: v.storeId,
    status: v.status,
    createdAt: v.createdAt,
    items: Array.isArray(v.items) ? v.items : [],
    total: typeof v.total === "number" ? v.total : undefined,
    storeName: v.storeName || v.store?.name,
    storeLogoUrl: v.storeLogoUrl || v.store?.logoUrl,
  };
}

const OrdersHeader = dynamic(() => import("@/components/orders/OrdersHeader"), { ssr: false });
const ScanTableBanner = dynamic(() => import("@/components/orders/ScanTableBanner"), { ssr: false });
const LastOrderCard = dynamic(() => import("@/components/orders/LastOrderCard"), { ssr: false });
const ReferBanner = dynamic(() => import("@/components/orders/ReferBanner"), { ssr: false });
const OrderAgainList = dynamic(() => import("@/components/orders/OrderAgainList"), { ssr: false });
const CouponBanner = dynamic(() => import("@/components/orders/CouponBanner"), { ssr: false });
const HistoryList = dynamic(() => import("@/components/orders/HistoryList"), { ssr: false });

type OrderVM = SnackOrderDetails;

function toDateLabel(ts: number) {
  const d = new Date(ts);
  return d.toLocaleDateString("pt-BR", { weekday: "short", day: "2-digit", month: "long", year: "numeric" });
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<OrderVM[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubOrders: (() => void) | undefined;

    const unsubAuth = onAuthStateChanged(auth, (user) => {
      if (!user) {
        setOrders([]);
        setLoading(false);
        if (unsubOrders) unsubOrders();
        return;
      }
      unsubOrders = OrderService.listenUserOrders(user.uid, { limit: 20 }, async (list: SnackOrder[]) => {
        const details: OrderVM[] = await Promise.all(
          list.map(async (o) => (await getOrderDetails(o.key)) ?? { ...o })
        );
        setOrders(details.sort((a, b) => b.createdAt - a.createdAt));
        setLoading(false);
      });
    });

    return () => { unsubOrders?.(); unsubAuth?.(); };
  }, []);

  const last = orders[0];
  const lastData = last ? {
    id: last.key,
    storeName: last.storeName ?? "Pedido MySnack",
    storeLogoUrl: last.storeLogoUrl,
    itemsText: last.items?.[0]?.name ? `${last.items[0].name}` : "Pedido recente",
    totalText: typeof last.total === "number" ? last.total.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }) : undefined
  } : null;

  const againItems = last ? [{
    id: last.key,
    storeName: last.storeName ?? "Pedido MySnack",
    title: last.items?.[0]?.name ?? "Pedido recente",
  }] : [];

  const historyItems = useMemo(() => orders.map(o => ({
    id: o.key,
    dateLabel: toDateLabel(o.createdAt),
    storeName: o.storeName ?? "Pedido MySnack",
    status: o.status === "pedido entregue" ? "Pedido concluído" : o.status,
    numberLabel: o.key.slice(-4),
    title: o.items?.[0]?.name ?? "Pedido",
  })), [orders]);

  return (
    <main className="pb-10">
      <OrdersHeader />
      <ScanTableBanner />
      <LastOrderCard data={lastData} />
      <ReferBanner />
      <OrderAgainList items={againItems} />
      <CouponBanner />
      {loading ? (
        <div className="px-4 mt-6 text-sm text-zinc-500">Carregando histórico…</div>
      ) : (
        <HistoryList items={historyItems} />
      )}
    </main>
  );
}
