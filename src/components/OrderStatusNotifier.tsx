"use client";
import { useEffect, useRef } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/firebase";
import { OrderService, type SnackOrder } from "@/services/order.service";
import { addNotificationRTDB } from "@/lib/add-notification";

export default function OrderStatusNotifier() {
  const unsubRef = useRef<null | (() => void)>(null);
  const seenRef = useRef<Record<string,string>>({});

  useEffect(() => {
    try { const raw = localStorage.getItem("orders_status_seen"); if (raw) seenRef.current = JSON.parse(raw) || {}; } catch {}

    const unsubAuth = onAuthStateChanged(auth, (user) => {
      if (unsubRef.current) { unsubRef.current(); unsubRef.current = null; }
      if (!user?.userId) return;

      unsubRef.current = OrderService.subscribeUserOrders(user.uid, (list) => {
        const seen = seenRef.current;
        let changed = false;
        list.forEach((o: SnackOrder) => {
          const prev = seen[o.key];
          if (prev && prev !== o.status) {
            const short = o.key.slice(-4);
            addNotificationRTDB(user.uid, {
              title: "Status do pedido atualizado",
              body: `Pedido nº ${short}: ${o.status}`,
              data: { orderId: o.key, status: o.status }
            });
          }
          if (o.status && prev !== o.status) { seen[o.key] = o.status; changed = true; }
          else if (!prev && o.status) { seen[o.key] = o.status; changed = true; }
        });
        if (changed) { try { localStorage.setItem("orders_status_seen", JSON.stringify(seen)); } catch {} }
      }, 50);
    });

    return () => { if (unsubRef.current) { unsubRef.current(); unsubRef.current = null; } unsubAuth(); };
  }, []);

  return null;
}
