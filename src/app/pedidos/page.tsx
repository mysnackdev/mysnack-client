"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useOrder } from "@/hooks/useOrder";
import { Order } from "@/components/order.component";
import { OrderFloatButton } from "@/components/order-float-button.component";
import Link from "next/link";
import { QrCode, Home, Search, FileText, User } from "lucide-react";
import { auth } from "@/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { OrderService, SnackOrder } from "@/services/order.service";

export default function PedidosPage() {
  const { isModalVisible, handleInitOrder } = useOrder();

  const [uid, setUid] = useState<string | null>(auth.currentUser?.uid ?? null);
  const [orders, setOrders] = useState<SnackOrder[]>([]);
  const [loading, setLoading] = useState(true);

  // Observa login/logout
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      setUid(user?.uid ?? null);
    });
    return () => unsub();
  }, []);

  // Stream dos pedidos do usuário
  useEffect(() => {
    if (!uid) {
      setOrders([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const stop = OrderService.listenUserOrders(uid, { limit: 50 }, (list) => {
      setOrders(list);
      setLoading(false);
    });
    return () => stop();
  }, [uid]);

  const lastOrder = useMemo(() => orders[0], [orders]);

  const handleReorder = async (order: SnackOrder) => {
    const key = await OrderService.reorderFrom(order);
    if (key) handleInitOrder(); // abre modal/fluxo de confirmação
  };

  return (
    <main className="max-w-5xl mx-auto px-4 pb-28">
      <header className="py-6">
        <h1 className="text-center text-sm font-semibold tracking-wide text-muted-foreground">
          MEUS PEDIDOS
        </h1>
      </header>

      {/* Banner gradiente */}
      <section className="mb-6">
        <div
          className="rounded-2xl p-6 md:p-8 text-white"
          style={{
            background:
              "linear-gradient(135deg, #ff7a59 0%, #ff5f6d 50%, #d946ef 100%)",
          }}
        >
          <div className="flex flex-col items-center text-center gap-3">
            <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
              <QrCode className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-semibold">Escaneie sua Mesa</h3>
              <p className="text-white/80 text-sm">
                Para finalizar seu pedido e receber na mesa
              </p>
            </div>
            <button
              onClick={handleInitOrder}
              className="mt-2 bg-white text-pink-600 px-4 py-2 rounded-xl font-semibold hover:opacity-90 transition"
            >
              Escanear QR Code
            </button>
          </div>
        </div>
      </section>

      {/* Peça de novo */}
      <section className="mb-6">
        <h2 className="text-[17px] font-semibold mb-3">Peça de novo</h2>

        <div className="rounded-2xl border bg-white shadow-sm overflow-hidden">
          <div className="p-4 flex items-start gap-3">
            <div className="w-9 h-9 rounded-full bg-gray-200 shrink-0" />
            <div className="flex-1">
              <div className="text-[15px] font-semibold">
                {lastOrder?.brand ?? "—"}
              </div>
              <div className="text-sm text-muted-foreground">
                {lastOrder
                  ? formatItemsTitle(lastOrder)
                  : uid
                  ? "Você ainda não realizou pedidos."
                  : "Entre para ver seus pedidos."}
              </div>
            </div>
          </div>

          <button
            onClick={() => lastOrder && handleReorder(lastOrder)}
            disabled={!lastOrder}
            className="w-full rounded-b-2xl py-3 font-semibold hover:opacity-95 transition disabled:opacity-50"
            style={{ background: "linear-gradient(90deg,#ff63a0,#ff2bb5)" }}
          >
            Adicionar à sacola
          </button>
        </div>
      </section>

      {/* Histórico */}
      <section className="mb-8">
        <h2 className="text-[17px] font-semibold mb-3">Histórico</h2>

        {loading ? (
          <div className="text-sm text-muted-foreground">Carregando…</div>
        ) : orders.length === 0 ? (
          <div className="text-sm text-muted-foreground">
            {uid ? "Nenhum pedido encontrado." : "Entre para ver seu histórico."}
          </div>
        ) : (
          orders.map((o) => (
            <div key={o.key} className="rounded-2xl border bg-white shadow-sm overflow-hidden mb-4">
              <div className="px-4 pt-4 text-sm text-muted-foreground">
                {formatDate(o.createdAt)}
              </div>

              <div className="p-4 flex gap-3 items-start">
                <div className="w-10 h-10 rounded-full bg-gray-200 shrink-0" />
                <div className="flex-1">
                  <div className="font-semibold">{o.brand ?? "—"}</div>

                  <div className="mt-1 text-sm text-muted-foreground">
                    <span className={`inline-block w-2 h-2 rounded-full mr-2 align-middle ${statusDot(o.status)}`} />
                    {labelStatus(o.status)} · Nº {o.key?.slice(-4)}
                  </div>

                  <div className="mt-2 text-sm">{formatItemsTitle(o)}</div>
                </div>

                <div className="flex flex-col items-end gap-2">
                  <button
                    onClick={() => handleReorder(o)}
                    className="px-3 py-1.5 text-sm rounded-lg bg-rose-500 text-white font-semibold hover:opacity-90"
                  >
                    Pedir Novamente
                  </button>
                  <div className="text-sm text-muted-foreground">
                    R$ {Number(o.total).toFixed(2).replace(".", ",")}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </section>

      {/* FAB / Modal */}
      <OrderFloatButton
        isModalVisible={isModalVisible}
        handleInitOrder={handleInitOrder}
      />
      {isModalVisible && <Order />}

      {/* Bottom nav (Pedidos ativo) */}
      <nav className="fixed bottom-0 left-0 right-0 z-40">
        <div className="mx-auto max-w-5xl px-4">
          <div className="rounded-t-2xl border bg-white shadow-lg grid grid-cols-4">
            <Link href="/" className="flex flex-col items-center justify-center gap-1 text-xs flex-1 py-2 text-muted-foreground">
              <Home className="w-5 h-5" />
              Início
            </Link>
            <Link href="/busca" className="flex flex-col items-center justify-center gap-1 text-xs flex-1 py-2 text-muted-foreground">
              <Search className="w-5 h-5" />
              Busca
            </Link>
            <Link href="/pedidos" className="flex flex-col items-center justify-center gap-1 text-xs flex-1 py-2 text-rose-500 font-semibold">
              <FileText className="w-5 h-5" />
              Pedidos
            </Link>
            <Link href="/perfil" className="flex flex-col items-center justify-center gap-1 text-xs flex-1 py-2 text-muted-foreground">
              <User className="w-5 h-5" />
              Perfil
            </Link>
          </div>
        </div>
      </nav>
    </main>
  );
}

/* === helpers de exibição === */

function formatItemsTitle(o: SnackOrder) {
  if (!o.items?.length) return "—";
  const first = o.items[0];
  const qty = first.qty ?? 1;
  const title = first.name ?? "Item";
  return `${qty} ${title}${o.items.length > 1 ? ` + ${o.items.length - 1} itens` : ""}`;
}

function formatDate(ts: number) {
  try {
    return new Intl.DateTimeFormat("pt-BR", {
      weekday: "short",
      day: "2-digit",
      month: "long",
      year: "numeric",
    }).format(ts);
  } catch {
    return "—";
  }
}

function labelStatus(s: string) {
  const val = (s || "").toLowerCase();
  if (val.includes("concl")) return "Pedido concluído";
  if (val.includes("aguard")) return "Aguardando aceite";
  if (val.includes("prepar")) return "Em preparo";
  return s || "—";
}

function statusDot(s: string) {
  const v = (s || "").toLowerCase();
  if (v.includes("concl")) return "bg-emerald-500";
  if (v.includes("aguard")) return "bg-amber-500";
  if (v.includes("prepar")) return "bg-sky-500";
  return "bg-gray-400";
}