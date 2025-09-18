
"use client";
import React from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { subscribeUserOrders, type MirrorOrder } from "@/services/orders.mirror.service";
import ScanBanner from "@/components/scan-banner";
import OrderAgainList, { type OrderAgainItem } from "@/components/orders/OrderAgainList";
import HistoryList, { type HistoryCard } from "@/components/orders/HistoryList";

type TabKey = "all" | "progress" | "done";

const DONE = new Set(["pedido entregue", "pedido cancelado"]);
const PROGRESS = new Set([
  "pedido realizado",
  "pedido confirmado",
  "pedido sendo preparado",
  "pedido pronto",
  "pedido indo até você",
]);

export default function OrdersPage() {
  const { user, loading } = useAuth();
  const [orders, setOrders] = React.useState<MirrorOrder[]>([]);
  const [tab, setTab] = React.useState<TabKey>("all");

  React.useEffect(() => {
    if (!user?.uid) return;
    return subscribeUserOrders(user.uid, (list) => setOrders(list.reverse()));
  }, [user?.uid]);

  const filtered = React.useMemo(() => {
    if (tab === "all") return orders;
    if (tab === "progress") return orders.filter(o => PROGRESS.has((o.status||"").toLowerCase()));
    return orders.filter(o => DONE.has((o.status||"").toLowerCase()));
  }, [orders, tab]);

  const againItems: OrderAgainItem[] = React.useMemo(() => {
    if (!orders.length) return [];
    const last = orders[0];
    return [{
      id: last.key,
      storeName: "MySnack",
      title: last.lastItem ?? "Pedido MySnack"
    }];
  }, [orders]);

  const historyItems: HistoryCard[] = React.useMemo(() => {
    return filtered.map((o) => ({
      id: o.key,
      dateLabel: new Date(o.createdAt || Date.now()).toLocaleDateString(undefined, { weekday: "short", day: "2-digit", month: "long", year: "numeric" }),
      storeName: "Pedido MySnack",
      status: o.status || "pedido realizado",
      numberLabel: `Nº ${String(o.number ?? o.key).slice(-5)}`,
      title: o.lastItem ?? "Pedido",
    }));
  }, [filtered]);

  if (loading) return <div className="p-6">Carregando…</div>;

  if (!user) {
    return (
      <div className="p-6 max-w-xl mx-auto">
        <h1 className="text-2xl font-bold mb-3">MEUS PEDIDOS</h1>
        <ScanBanner onScan={() => location.assign("/scan")} />
        <div className="mt-6 rounded-2xl border p-4">
          <p className="text-sm text-muted-foreground mb-3">
            Faça login para visualizar seu histórico de pedidos.
          </p>
          <Link className="inline-block px-4 py-2 rounded-xl bg-black text-white" href="/login">Fazer login</Link>
        </div>
      </div>
    );
  }

  return (
    <main className="pb-24">
      <div className="px-4 pt-6">
        <h1 className="text-center tracking-wide font-extrabold text-zinc-800" style={{ letterSpacing: 1 }}>MEUS PEDIDOS</h1>
      </div>

      <div className="px-4 mt-2">
        <ScanBanner onScan={() => {}} />
      </div>

      {/* Tabs */}
      <div className="px-4 mt-4">
        <div className="inline-flex rounded-2xl bg-zinc-100 p-1 text-sm font-medium">
          <button
            className={"px-3 py-2 rounded-xl " + (tab === "all" ? "bg-white shadow" : "text-zinc-600")}
            onClick={() => setTab("all")}
          >
            Todos
          </button>
          <button
            className={"px-3 py-2 rounded-xl " + (tab === "progress" ? "bg-white shadow" : "text-zinc-600")}
            onClick={() => setTab("progress")}
          >
            Em andamento
          </button>
          <button
            className={"px-3 py-2 rounded-xl " + (tab === "done" ? "bg-white shadow" : "text-zinc-600")}
            onClick={() => setTab("done")}
          >
            Concluídos
          </button>
        </div>
      </div>

      {/* Peça de novo */}
      <OrderAgainList items={againItems} />

      {/* Histórico */}
      <section className="px-4 mt-6">
        <h3 className="text-xl font-semibold mb-3">Histórico</h3>
      </section>
      <HistoryList items={historyItems} />

      <div className="h-10" />
    </main>
  );
}
