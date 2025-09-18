"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { getAuth, onAuthStateChanged, type User } from "firebase/auth";
import { OrderService, type SnackOrder } from "@/services/order.service";

function formatBRL(v: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v || 0);
}

function sumOrder(o: SnackOrder): number {
  try {
    return (o.items || []).reduce(
      (acc: number, it: { price?: number; qty?: number }) =>
        acc + Number(it.price || 0) * Number(it.qty || 1),
      0
    );
  } catch {
    return 0;
  }
}

export default function RecentOrders() {
  const [orders, setOrders] = useState<SnackOrder[]>([]);
  const [user, setUser] = useState<User | null>(null);

  // Observa autenticação para obter o uid do usuário
  useEffect(() => {
    const auth = getAuth();
    const unsub = onAuthStateChanged(auth, (u) => setUser(u));
    return () => unsub();
  }, []);

  // Assina os pedidos recentes do usuário autenticado
  useEffect(() => {
    if (!user?.uid) return;

    let off: (() => void) | undefined;

    (async () => {
      try {
        off = await OrderService.subscribeUserOrders(
          user.uid,
          (list) => {
            setOrders(list.slice(0, 10));
          },
          10
        );
      } catch {
        setOrders([]);
      }
    })();

    return () => {
      try {
        if (off) off(); // <- evita o warning @typescript-eslint/no-unused-expressions
      } catch {
        // noop
      }
    };
  }, [user?.uid]);

  // Não mostra a seção se não houver pedidos
  if (!orders.length) return null;

  return (
    <section className="mt-6">
      <h2 className="px-4 text-lg font-semibold">Últimos Pedidos</h2>
      <div className="no-scrollbar mt-3 flex gap-3 overflow-x-auto px-4 pb-2">
        {orders.map((o) => (
          <Link
            key={o.key}
            href={`/orders`}
            className="min-w-[200px] max-w-[220px] rounded-2xl border border-zinc-200 bg-white shadow-sm"
          >
            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-t-2xl bg-zinc-100">
              <Image
                src={"/placeholder-food.jpg"}
                alt={o.items?.[0]?.name || "Pedido"}
                fill
                sizes="220px"
                className="object-cover"
              />
            </div>
            <div className="p-3">
              <div className="line-clamp-2 text-sm text-zinc-800">
                {o.items?.[0]?.name || "Pedido MySnack"}
              </div>
              <div className="mt-1 text-[13px] font-semibold text-green-600">
                {formatBRL(sumOrder(o))}
              </div>
              <div className="mt-1 text-xs text-zinc-500">
                #{String(o.key).slice(-6)} •{" "}
                {new Date(o.createdAt || Date.now()).toLocaleDateString("pt-BR")}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
