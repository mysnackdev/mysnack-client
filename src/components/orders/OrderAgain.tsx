"use client";

import React, { useEffect, useMemo, useState } from "react";
import ReorderCard from "@/components/reorder-card";
import { useAuth } from "@/hooks/useAuth";
import { subscribeUserOrders, type MirrorOrder } from "@/services/orders.mirror.service";
import { OrderService, type SnackOrder } from "@/services/order.service";
import { CatalogService } from "@/services/catalog.service";
import { addItems } from "@/components/CartManager";

function normalize(s: string) {
  return String(s || "").toLowerCase().normalize("NFD").replace(/\p{Diacritic}/gu, "");
}

function isConcluded(status?: string, cancelled?: boolean) {
  if (cancelled) return false;
  const s = normalize(status || "");
  if (!s) return false;
  return s.includes("entregue") || s.includes("concluido") || s.includes("concluído") || s.includes("delivered") || s.includes("finalizado");
}

export default function OrderAgain() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<MirrorOrder[] | null>(null);
  const [detail, setDetail] = useState<SnackOrder | null>(null);
  const [storeName, setStoreName] = useState<string>("");

  useEffect(() => {
    if (!user) { setOrders([]); return; }
    let unsub: (() => void) | null = null;
    (async () => {
      unsub = await subscribeUserOrders(user.uid, setOrders);
    })();
    return () => { if (unsub) unsub(); };
  }, [user]);

  const last = useMemo(() => {
    if (!orders || !orders.length) return null;
    const concluded = orders
      .filter(o => isConcluded(o.status, o.cancelled))
      .sort((a,b) => (b.createdAt || 0) - (a.createdAt || 0));
    return concluded[0] || null;
  }, [orders]);

  useEffect(() => {
    if (!last) { setDetail(null); setStoreName(""); return; }
    let cancel = false;
    (async () => {
      try {
        const d = await OrderService.getById(last.key);
        if (cancel) return;
        setDetail(d || null);
        const name =
          (d as (SnackOrder & { store?: { displayName?: string } | null; merchant?: { name?: string } | null }) | null | undefined)?.store?.displayName ||
          (d as { storeName?: string } | null | undefined)?.storeName ||
          (d as { merchant?: { name?: string } | null } | null | undefined)?.merchant?.name || "";
        if (name) {
          setStoreName(name);
        } else {
          const sid = last.storeId || (d as { storeId?: string } | null | undefined)?.storeId;
          if (sid) {
            try {
              const cat = await CatalogService.getStoreCatalog(sid);
              if (!cancel) setStoreName((cat?.store?.displayName || cat?.store?.name || "").trim());
            } catch {}
          }
        }
      } catch {
        if (!cancel) { setDetail(null); setStoreName(""); }
      }
    })();
    return () => { cancel = true; };
  }, [last]);

  if (!user) return null;
  if (!last || !detail) return null;

  const firstName = Array.isArray(detail.items) && detail.items.length ? (detail.items[0]?.name || "1 item") : "1 item";

  const handleAdd = () => {
    try {
      const items = (detail.items || []).map((it: Partial<import("@/services/order.service").SnackOrderItem>, idx: number) => ({
        id: String(it.id || idx),
        name: String(it.name || "Item"),
        qty: Number(it.qty || 1),
        price: Number(it.price || 0),
      }));
      if (!items.length) return;
      addItems(items);
    } catch {}
  };

  return (
    <section className="px-4 mt-4">
      <ReorderCard brand={storeName || "Meu último pedido"} itemTitle={firstName} onAddToBag={handleAdd} />
    </section>
  );
}
