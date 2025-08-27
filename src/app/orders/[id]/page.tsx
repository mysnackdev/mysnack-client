"use client";

import React from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { OrderService, type SnackOrder } from "@/services/order.service";
import OrderStatusProgress from "@/components/OrderStatusProgress";
import StatusBadge from "@/components/StatusBadge";

export default function OrderDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const orderId = params?.id as string;
  const [order, setOrder] = React.useState<SnackOrder | null>(null);

  React.useEffect(() => {
    if (!orderId) return;
    const unsub = OrderService.subscribeOrder(orderId, setOrder);
    return () => { unsub?.(); };
  }, [orderId]);

  if (!orderId) {
    return (
      <div className="p-4">
        <p className="text-sm text-muted-foreground">Pedido não encontrado.</p>
        <Link href="/orders" className="mt-3 inline-block text-sm underline">Voltar</Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl p-4">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-lg font-semibold">Pedido #{orderId.slice(-6)}</h1>
        <Link href="/orders" className="text-sm underline">Voltar</Link>
      </div>

      {!order ? (
        <div className="rounded-2xl border bg-white p-4 shadow-sm">
          <p className="text-sm text-muted-foreground">Carregando informações do pedido…</p>
        </div>
      ) : (
        <div className="rounded-2xl border bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-1">
            <span className="text-sm text-muted-foreground">Nome</span>
            <span className="text-base font-medium">{order.nome}</span>
          </div>

          <div className="mt-4">
            <span className="text-sm text-muted-foreground">Status atual</span>
            <div className="mt-1"><StatusBadge status={order.status} /></div>
            <OrderStatusProgress status={order.status} />
          </div>

          <div className="mt-6">
            <span className="text-sm text-muted-foreground">Itens</span>
            <ul className="mt-2 divide-y rounded-2xl border">
              {order.items?.map((it) => (
                <li key={it.id} className="flex items-center justify-between p-3 text-sm">
                  <span>{it.name} <span className="text-xs text-muted-foreground">×{it.qty}</span></span>
                  <span>R$ {(it.subtotal ?? (it.qty * it.price)).toFixed(2)}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-4 flex items-center justify-end gap-6">
            <span className="text-sm">Subtotal: <strong>R$ {Number(order.subtotal || 0).toFixed(2)}</strong></span>
            <span className="text-sm">Total: <strong>R$ {Number(order.total || 0).toFixed(2)}</strong></span>
          </div>
        </div>
      )}
    </div>
  );
}
