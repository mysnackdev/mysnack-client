
"use client";
import React from "react";
import QrScannerDialog, { type QrResult } from "@/components/common/QrScannerDialog";
import ScanTableBanner from "@/components/orders/ScanTableBanner";
import OrderAgainList, { type OrderAgainItem } from "@/components/orders/OrderAgainList";
import HistoryList, { type HistoryCard } from "@/components/orders/HistoryList";
import CouponBanner from "@/components/orders/CouponBanner";
import LoginNotice from "@/components/LoginNotice";
import { useAuth } from "@/hooks/useAuth";
import { subscribeUserOrders, type MirrorOrder } from "@/services/orders.mirror.service";
import { useMall } from "@/context/MallContext";

/** Converte status para etiquetas */
const LABEL_BY_STATUS: Record<string, string> = {
  "pedido concluído": "Pedido concluído",
  "pedido entregue": "Pedido concluído",
  "pedido cancelado": "Pedido cancelado",
  "pedido realizado": "Pedido realizado",
  "pedido confirmado": "Pedido confirmado",
  "pedido sendo preparado": "Sendo preparado",
  "pedido pronto": "Pedido pronto"
};

function formatDateLabel(ts: number): string {
  const d = new Date(ts || Date.now());
  const weekday = d.toLocaleDateString(undefined, { weekday: "short" });
  const day = d.toLocaleDateString(undefined, { day: "2-digit" });
  const month = d.toLocaleDateString(undefined, { month: "long" });
  const year = d.getFullYear();
  return `${weekday}. ${day} ${month} ${year}`;
}

export default function OrdersPage() {
  const { user } = useAuth();
  const isLogged = Boolean(user);
  const [orders, setOrders] = React.useState<MirrorOrder[]>([]);
  const [openScan, setOpenScan] = React.useState(false);
  const { setMallById } = useMall();

  // Assina pedidos do usuário
  React.useEffect(() => {
    let done = false;
    let unsub: (() => void) | undefined;
    (async () => {
      if (!user?.uid) return;
      unsub = await subscribeUserOrders(user.uid, setOrders);
      if (done && unsub) unsub();
    })();
    return () => { done = true; if (unsub) unsub(); };
  }, [user?.uid]);

  const againItems: OrderAgainItem[] = React.useMemo(() => {
    if (!orders.length) return [];
    const last = orders[0];
    return [{
      id: last.key,
      storeName: last.storeId || "MySnack",
      title: last.lastItem || "Pedido recente",
      price: last.total ?? null
    }];
  }, [orders]);

  const historyItems: HistoryCard[] = React.useMemo(() => {
    return orders.map(o => ({
      id: o.key,
      dateLabel: formatDateLabel(o.createdAt || Date.now()),
      storeName: o.storeId || "MySnack",
      statusLabel: `${LABEL_BY_STATUS[o.status] ?? o.status} • Nº ${o.number ?? "—"}`,
      itemsSummary: o.lastItem ?? undefined,
      price: o.total ?? null
    }));
  }, [orders]);

  const hasOrders = historyItems.length > 0;

  const handleAddAgain = React.useCallback((item: OrderAgainItem) => {
    // salva item simples no localStorage consumido pelo CartManager
    try {
      const raw = localStorage.getItem("mysnack_cart");
      const arr: Array<{id:string; name:string; qty:number; price:number}> = raw ? JSON.parse(raw) : [];
      arr.push({ id: `again-${item.id}`, name: item.title, qty: 1, price: Number(item.price ?? 0) });
      localStorage.setItem("mysnack_cart", JSON.stringify(arr));
      window.dispatchEvent(new Event("cart-updated"));
      window.dispatchEvent(new Event("open-cart"));
    } catch (e) {
      console.warn("Falha ao adicionar à sacola", e);
    }
  }, []);

  const onScan = React.useCallback((res: QrResult) => {
    if (res.mallId) {
      void setMallById(res.mallId);
    }
  }, [setMallById]);

  return (
    <main className="pb-24">
      <header className="px-4 pt-4 pb-3">
        <h1 className="text-center font-semibold tracking-wide text-zinc-700">MEUS PEDIDOS</h1>
      </header>

      <div className="h-2" />
      {/* Aviso quando não logado */}
      {!isLogged && <LoginNotice />}
    

      <ScanTableBanner onClick={() => setOpenScan(true)} />

      {isLogged && againItems.length > 0 && (<OrderAgainList items={againItems} onAdd={handleAddAgain} />)}

      {isLogged && <CouponBanner />}

      {isLogged && hasOrders && (<>
        <section className="px-4 mt-6">
          <h3 className="text-lg font-semibold mb-3">Histórico</h3>
        </section>
        <HistoryList items={historyItems} />
      </>)}

      <QrScannerDialog open={openScan} onClose={() => setOpenScan(false)} onScan={onScan} />
    </main>
  );
}
