"use client";

import React from "react";
import StatusBadge from "@/components/StatusBadge";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/firebase";
import { OrderService, type SnackOrder } from "@/services/order.service";

// Tipo mínimo para contagem de itens (compatível com índice /orders_by_user)
type OrderLikeForCount = Partial<Pick<SnackOrder, "items">> & { itemsCount?: number };

function getItemsCount(o: OrderLikeForCount): number {
  if (Array.isArray(o.items)) return o.items.length;
  if (typeof o.itemsCount === "number") return o.itemsCount;
  return 0;
}

function formatBRL(n: number): string {
  try {
    return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  } catch {
    return `R$ ${Number(n || 0).toFixed(2)}`;
  }
}

export default function RecentOrders() {
  const [uid, setUid] = React.useState<string | null>(auth.currentUser?.uid ?? null);
  const [loading, setLoading] = React.useState<boolean>(true);
  const [orders, setOrders] = React.useState<SnackOrder[]>([]);

  React.useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUid(u?.uid ?? null));
    return () => unsub();
  }, []);

  React.useEffect(() => {
    if (!uid) {
      setOrders([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const stop = OrderService.listenUserOrders(uid, { limit: 10 }, (list) => {
      setOrders(list);
      setLoading(false);
    });
    return () => stop();
  }, [uid]);

  return (
    <section className="mt-6">
      <h3 className="px-1 text-lg font-semibold">Pedidos recentes</h3>

      {loading && (
        <div className="mt-3 rounded-2xl bg-white p-4 text-sm text-muted-foreground shadow-sm">
          Carregando...
        </div>
      )}

      {!loading && (
        <ul className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {orders.slice(0, 4).map((o) => (
            <li key={o.key} className="rounded-2xl bg-white p-4 shadow-sm">
              <p className="font-semibold">{o.nome || "Pedido"}</p>
              <p className="text-sm text-muted-foreground">
                {getItemsCount(o)} item(ns) • {formatBRL(o.total ?? 0)}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                <StatusBadge status={o.status} />
              </p>
            </li>
          ))}
          {orders.length === 0 && (
            <li className="rounded-2xl bg-white p-4 text-sm text-muted-foreground shadow-sm">
              Nenhum pedido ainda.
            </li>
          )}
        </ul>
      )}
    </section>
  );
}
