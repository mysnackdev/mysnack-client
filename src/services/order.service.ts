import { db } from "@/firebase";
import {
  ref,
  push,
  update,
  onValue,
  query,
  limitToLast,
  Unsubscribe,
  DataSnapshot,
} from "firebase/database";
import type { OrderStatus } from "@/constants/order-status";

export interface SnackOrderItem {
  id: string;
  name: string;
  qty: number;
  price: number;
  subtotal: number;
}

export interface SnackOrder {
  key: string;
  uid: string;
  nome: string;
  items: SnackOrderItem[];
  subtotal: number;
  total: number;
  status: OrderStatus;
  createdAt: number;
  cancelled?: boolean;
}

type ListenOpts = { limit?: number };

/** Índice enxuto salvo em /orders_by_user/{uid}/{orderId} */
interface UserOrderIndex {
  key: string;
  uid: string;
  nome: string;
  subtotal: number;
  total: number;
  status: OrderStatus;
  createdAt: number;
  itemsCount: number;
}

/** Usado internamente para cachear parciais até o detalhe do pedido chegar */
type PartialOrder = Partial<SnackOrder> & { key?: string };

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
    const created = await OrderService.create(uid, { nome, items, subtotal, total });
    return created.key;
  }

  static async create(
    uid: string,
    data: Omit<SnackOrder, "key" | "uid" | "status" | "createdAt">
  ): Promise<SnackOrder> {
    const orderId = push(ref(db, "orders")).key as string;
    const createdAt = Date.now();
    const status: OrderStatus = "pedido realizado";

    const payload: SnackOrder = {
      key: orderId,
      uid,
      nome: data.nome,
      items: data.items,
      subtotal: data.subtotal,
      total: data.total,
      status,
      createdAt,
      cancelled: data.cancelled,
    };

    const indexEntry: UserOrderIndex = {
      key: orderId,
      uid,
      nome: data.nome,
      subtotal: data.subtotal,
      total: data.total,
      status,
      createdAt,
      itemsCount: data.items?.length ?? 0,
    };

    const updates: Record<string, SnackOrder | UserOrderIndex> = {};
    updates[`/orders/${orderId}`] = payload;
    updates[`/orders_by_user/${uid}/${orderId}`] = indexEntry;

    await update(ref(db), updates as Record<string, unknown>);
    return payload;
  }

  static subscribeOrder(orderId: string, cb: (order: SnackOrder | null) => void): Unsubscribe {
    const r = ref(db, `orders/${orderId}`);
    return onValue(r, (snap: DataSnapshot) => {
      const val = snap.val() as SnackOrder | null;
      cb(snap.exists() && val ? { ...val, key: orderId } : null);
    });
  }

  static subscribeUserOrders(uid: string, cb: (orders: SnackOrder[]) => void): Unsubscribe {
    const indexRef = query(ref(db, `orders_by_user/${uid}`), limitToLast(100));
    const orderUnsubs = new Map<string, Unsubscribe>();
    let cache: Record<string, PartialOrder> = {};

    const toSnack = (key: string, o: PartialOrder): SnackOrder => ({
      key,
      uid: o.uid ?? "",
      nome: o.nome ?? "",
      items: o.items ?? [],
      subtotal: o.subtotal ?? 0,
      total: o.total ?? 0,
      status: (o.status ?? "pedido realizado") as OrderStatus,
      createdAt: o.createdAt ?? 0,
      cancelled: o.cancelled,
    });

    const emit = () => {
      const list = Object.keys(cache)
        .map((id) => toSnack(id, cache[id]))
        .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
      cb(list);
    };

    const unsubIndex = onValue(indexRef, (snap: DataSnapshot) => {
      const index = (snap.val() as Record<string, UserOrderIndex> | null) ?? {};

      // Recria cache mesclando índice com o que já tínhamos
      cache = Object.fromEntries(
        Object.keys(index).map((id) => [id, { ...cache[id], ...index[id] }]),
      );

      emit();

      const ids = Object.keys(index);

      // Desinscreve pedidos que saíram do índice
      for (const [id, un] of orderUnsubs) {
        if (!ids.includes(id)) {
          un();
          orderUnsubs.delete(id);
        }
      }

      // Garante listener em cada pedido indexado
      ids.forEach((id) => {
        if (orderUnsubs.has(id)) return;
        const oref = ref(db, `orders/${id}`);
        const un = onValue(oref, (osnap: DataSnapshot) => {
          const order = osnap.val() as Partial<SnackOrder> | null;
          if (order) {
            cache[id] = { ...(cache[id] || {}), ...order, key: id };
            emit();
          }
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

  static listenUserOrders(
    uid: string,
    optsOrCb: ListenOpts | ((orders: SnackOrder[]) => void),
    maybeCb?: (orders: SnackOrder[]) => void
  ): Unsubscribe {
    if (typeof optsOrCb === "function") {
      return OrderService.subscribeUserOrders(uid, optsOrCb);
    }
    // (opts ainda não usados; mantido por compatibilidade)
    if (maybeCb) {
      return OrderService.subscribeUserOrders(uid, maybeCb);
    }
    // Fallback no-op se alguém esquecer o callback
    return () => {};
  }
}

export function listenUserOrders(
  uid: string,
  optsOrCb: ListenOpts | ((orders: SnackOrder[]) => void),
  maybeCb?: (orders: SnackOrder[]) => void
): Unsubscribe {
  if (typeof optsOrCb === "function") {
    return OrderService.listenUserOrders(uid, optsOrCb);
  }
  return OrderService.listenUserOrders(uid, optsOrCb, maybeCb);
}
