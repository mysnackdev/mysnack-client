"use client";

import React, { useEffect, useState } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { OrderService, type SnackOrder } from "@/services/order.service";
import BottomNav from "@/components/bottom-nav";
import { Order } from "@/components/order.component";
import { OrderFloatButton } from "@/components/order-float-button.component";

export default function PedidosPage() {
  const [orders, setOrders] = useState<SnackOrder[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);

  useEffect(() => {
    const auth = getAuth();
    let unsub: (() => void) | undefined;
    const off = onAuthStateChanged(auth, async (user) => {
      try {
        if (!user) { setOrders([]); return; }
        unsub?.();
        unsub = OrderService.subscribeUserOrders(user.uid, setOrders);
      } catch (e) {
        console.error(e);
      }
    });
    return () => {
      off();
      if (unsub) unsub();
    };
  }, []);

  const handleInitOrder = () => setIsModalVisible(true);

  return (
    <main className="pb-24">
      <h1 className="text-2xl font-bold my-4">Your orders</h1>

      {orders.length === 0 ? (
        <div className="card">You don’t have any orders yet.</div>
      ) : (
        <div className="space-y-3">
          {orders.map((o) => (
            <div key={o.key} className="rounded-2xl border bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="font-semibold">#{o.key?.slice(-6)} — {o.status}</div>
                <div className="text-sm text-muted-foreground">
                  {new Date(o.createdAt).toLocaleString("pt-BR")}
                </div>
              </div>
              {Array.isArray(o.items) && o.items.length > 0 && (
                <ul className="mt-2 text-sm list-disc list-inside">
                  {o.items.map((it, idx) => (
                    <li key={idx}>
                      {it.qty}× {it.name} — R$ {(it.price ?? 0).toFixed(2)}
                    </li>
                  ))}
                </ul>
              )}
              <div className="mt-2 text-right font-semibold">
                Total: R$ {(o.total ?? 0).toFixed(2)}
              </div>
            </div>
          ))}
        </div>
      )}

      <OrderFloatButton isModalVisible={isModalVisible} handleInitOrder={handleInitOrder} />
      {isModalVisible && <Order />}

      <BottomNav active="orders" />
    </main>
  );
}
