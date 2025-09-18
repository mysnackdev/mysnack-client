/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { getDatabase, ref, onValue, off, query, orderByChild } from "firebase/database";
import { app } from "@/firebase";

export type MirrorOrder = {
  key: string;
  storeId: string | null;
  status: string;
  createdAt: number;
  cancelled?: boolean;
  total?: number | null;
  number?: string | number | null;
  lastItem?: string | null;
};

export function subscribeUserOrders(uid: string, cb: (orders: MirrorOrder[]) => void): () => void {
  const db = getDatabase(app);
  const r = query(ref(db, `orders_by_user/${uid}`), orderByChild("createdAt"));
  const handler = (snap: any) => {
    const v = snap.val() || {};
    const list: MirrorOrder[] = Object.entries(v)
      .map(([key, value]: [string, any]) => ({
        key,
        storeId: value?.storeId ?? null,
        status: String(value?.status ?? "pedido realizado"),
        createdAt: Number(value?.createdAt ?? 0),
        cancelled: !!value?.cancelled,
        total: typeof value?.total === "number" ? value.total : null,
        number: value?.number ?? null,
        lastItem: value?.lastItem ?? null,
      }))
      .sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0));
    cb(list);
  };
  onValue(r, handler);
  return () => off(r, "value", handler);
}