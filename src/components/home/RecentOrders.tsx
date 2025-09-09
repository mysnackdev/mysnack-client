"use client";
import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import Link from "next/link";
import { auth } from "@/firebase";
import { OrderService, type SnackOrder } from "@/services/order.service";

type Unsubscribe = () => void;

export default function RecentOrdersRow() {
  const [orders, setOrders] = useState<SnackOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubOrders: Unsubscribe | undefined;

    const unsubAuth = onAuthStateChanged(auth, (user) => {
      if (!user) {
        setOrders([]);
        setLoading(false);
        if (unsubOrders) unsubOrders();
        return;
      }
      unsubOrders = OrderService.listenUserOrders(
        user.uid,
        { limit: 12 },
        (list: SnackOrder[]) => {
          setOrders(list);
          setLoading(false);
        }
      );
    });

    return () => {
      if (unsubOrders) unsubOrders();
      unsubAuth();
    };
  }, []);

  if (loading) return null; // linha silenciosa durante o carregamento
  if (!orders.length) return null;

  return (
    <div className="px-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium">Pedidos recentes</h3>
        <Link href="/orders" className="text-xs text-blue-600">
          ver todos
        </Link>
      </div>
      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
        {orders.slice(0, 10).map((o) => (
          <div
            key={o.key}
            className="text-xs px-3 py-2 rounded-full bg-zinc-100 text-zinc-700 whitespace-nowrap"
          >
            #{o.key.slice(-6)} • {new Date(o.createdAt).toLocaleDateString()}
          </div>
        ))}
      </div>
    </div>
  );
}
