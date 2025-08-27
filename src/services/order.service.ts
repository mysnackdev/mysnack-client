import { db } from "@/firebase";
import { ref, push, update, onValue, query, limitToLast, Unsubscribe } from "firebase/database";
import type { DataSnapshot } from "firebase/database";
import { ORDER_STATUS_FLOW, type OrderStatus } from "@/constants/order-status";

export interface SnackOrderItem { id: string; name: string; qty: number; price: number; subtotal: number; }
export interface SnackOrder {
  key: string; uid: string; nome: string; items: SnackOrderItem[];
  subtotal: number; total: number; status: OrderStatus; createdAt: number; cancelled?: boolean;
}

type ListenOpts = { limit?: number };

export class OrderService {
/** Compat: API antiga `createOrder(payload)` — mantém a mesma assinatura usada pelo CartManager */
static async createOrder(payload: {
  uid: string;
  nome: string;
  items: SnackOrderItem[];
  subtotal: number;
  total: number;
  status?: OrderStatus;
}): Promise<string> {
  const { uid, nome, items, subtotal, total } = payload;
  const created = await OrderService.create(uid, { nome, items, subtotal, total } as any);
  return created.key;
}

  static async create(uid: string, data: Omit<SnackOrder, "key" | "uid" | "status" | "createdAt">) {
    const orderId = push(ref(db, "orders")).key as string;
    const createdAt = Date.now();
    const payload = { key: orderId, uid, nome: data.nome, items: data.items, subtotal: data.subtotal, total: data.total, status: "pedido realizado" as OrderStatus, createdAt };
    const updates: Record<string, any> = {};
    updates[`/orders/${orderId}`] = payload;
    updates[`/orders_by_user/${uid}/${orderId}`] = { key: orderId, uid, nome: data.nome, subtotal: data.subtotal, total: data.total, status: payload.status, createdAt, itemsCount: data.items?.length || 0 };
    await update(ref(db), updates);
    return { key: orderId, ...payload } as SnackOrder;
  }

  static subscribeOrder(orderId: string, cb: (order: SnackOrder | null) => void): Unsubscribe {
    const r = ref(db, `orders/${orderId}`);
    return onValue(r, (snap: DataSnapshot) => cb(snap.exists()? ({ key: orderId, ...snap.val() } as SnackOrder) : null));
  }

  static subscribeUserOrders(uid: string, cb: (orders: SnackOrder[]) => void): Unsubscribe {
    const indexRef = query(ref(db, `orders_by_user/${uid}`), limitToLast(100));
    const orderUnsubs = new Map<string, Unsubscribe>();
    let cache: Record<string, any> = {};

    const emit = () => {
      const list = Object.keys(cache)
        .map((id) => ({ key: id, ...cache[id] } as SnackOrder))
        .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
      cb(list);
    };

    const unsubIndex = onValue(indexRef, (snap: DataSnapshot) => {
      cache = (snap.val() as Record<string, any>) || {};
      emit();
      const ids = Object.keys(cache);
      for (const [id, un] of orderUnsubs) {
        if (!ids.includes(id)) { un(); orderUnsubs.delete(id); }
      }
      ids.forEach((id) => {
        if (orderUnsubs.has(id)) return;
        const oref = ref(db, `orders/${id}`);
        const un = onValue(oref, (osnap) => {
          if (osnap.exists()) {
            cache[id] = { ...(cache[id] || {}), ...(osnap.val() || {}), key: id };
          }
          emit();
        });
        orderUnsubs.set(id, un);
      });
    });

    return () => {
      unsubIndex();
      for (const [, un] of orderUnsubs) un();
      orderUnsubs.clear();
    };
  }

  static listenUserOrders(uid: string, optsOrCb: ListenOpts | ((orders: SnackOrder[]) => void), maybeCb?: (orders: SnackOrder[]) => void): Unsubscribe {
    let cb: (orders: SnackOrder[]) => void;
    if (typeof optsOrCb === "function") cb = optsOrCb;
    else cb = (maybeCb as (orders: SnackOrder[]) => void);
    return OrderService.subscribeUserOrders(uid, cb);
  }
}

export function listenUserOrders(uid: string, optsOrCb: ListenOpts | ((orders: SnackOrder[]) => void), maybeCb?: (orders: SnackOrder[]) => void): Unsubscribe {
  return OrderService.listenUserOrders(uid, optsOrCb as any, maybeCb as any);
}
