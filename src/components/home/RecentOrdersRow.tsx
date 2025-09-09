"use client";
import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import Image from "next/image";
import { auth } from "@/firebase";
import { OrderService, type SnackOrder } from "@/services/order.service";

export default function RecentOrdersRow() {
  const [orders, setOrders] = useState<SnackOrder[]>([]);
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
      unsubOrders = OrderService.listenUserOrders(user.uid, { limit: 12 }, (list: SnackOrder[]) => {
        setOrders(list);
        setLoading(false);
      });
    });
    return () => { unsubOrders?.(); unsubAuth?.(); };
  }, []);

  return (
    <section className="px-4 mt-6">
      <h2 className="text-lg font-semibold mb-3">Últimos Pedidos</h2>
      {loading ? (
        <div className="text-sm text-zinc-500">Carregando…</div>
      ) : !orders.length ? (
        <div className="text-sm text-zinc-500">Você ainda não fez pedidos.</div>
      ) : (
        <div className="flex gap-4 overflow-x-auto pb-1 no-scrollbar">
          {orders.map((o) => (
            <div key={o.key} className="min-w-[180px] max-w-[200px] rounded-2xl border border-zinc-200 shadow-sm">
              <div className="relative w-full aspect-[4/3] overflow-hidden rounded-t-2xl bg-zinc-100">
                <Image src="/placeholder-food.jpg" alt="Pedido" fill sizes="200px" className="object-cover" />
              </div>
              <div className="p-3 text-sm">
                <div className="text-zinc-800 line-clamp-2">#{o.key.slice(-6)} • {o.items[0]?.name ?? "Pedido MySnack"}</div>
                <div className="text-xs text-zinc-500 mt-1">{new Date(o.createdAt).toLocaleDateString()} • {o.status}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
