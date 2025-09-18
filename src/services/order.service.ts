/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import {
  getDatabase,
  ref,
  query,
  orderByChild,
  limitToLast,
  onValue,
  DataSnapshot,
  push,
  set,
  child,
  get,
} from "firebase/database";
import { getAuth } from "firebase/auth";
import { getFunctions, httpsCallable } from "firebase/functions";
/** Status aceitos em regras */
export type OrderStatus =
  | "pedido realizado"
  | "pedido confirmado"
  | "pedido sendo preparado"
  | "pedido pronto"
  | "pedido indo até você"
  | "pedido entregue";

export type SnackOrderItem = {
  id: string;
  name: string;
  price: number;
  qty?: number;
  /** usado por partes do app; opcional para compatibilidade */
  subtotal?: number;
};

export type SnackOrder = {
  key: string;
  userId: string;
  storeId: string;
  status: OrderStatus;
  createdAt: number;
  items: SnackOrderItem[];
  /** metadados opcionais apenas para exibição */
  storeName?: string;
  storeLogoUrl?: string;
};

type CreateOrderPayload = {
  /** se omitido, usa o usuário autenticado */
  uid?: string;
  storeId?: string;
  items: SnackOrderItem[];
  subtotal?: number;
  total?: number;
  status?: OrderStatus;
  /** nome do cliente (usado por flows antigos) */
  nome?: string;
};

type CreateOrderResult = { orderId: string };

const REGION =
  process.env.NEXT_PUBLIC_FIREBASE_FUNCTIONS_REGION || "us-central1";

/** utilitário: converte item para formato seguro (sem any) */
function normalizeItem(it: SnackOrderItem): SnackOrderItem {
  const qty = typeof it.qty === "number" && it.qty > 0 ? it.qty : 1;
  const price = Number(it.price || 0);
  const subtotal =
    typeof it.subtotal === "number" ? it.subtotal : qty * price;

  return {
    id: String(it.id),
    name: String(it.name),
    price,
    qty,
    subtotal,
  };
}

/** utilitário: transforma RTDB snapshot de uma lista de pedidos em array tipado */
function snapshotToOrders(snap: DataSnapshot): SnackOrder[] {
  const list: SnackOrder[] = [];
  snap.forEach((c) => {
    const v = (c.val() ?? {}) as Partial<SnackOrder> & {
      items?: unknown;
      key?: string;
    };

    const rawItems =
      Array.isArray(v.items)
        ? (v.items as unknown[])
        : typeof v.items === "object" && v.items !== null
        ? Object.values(v.items as Record<string, unknown>)
        : [];

    const items: SnackOrderItem[] = rawItems
      .map((x) => x as Partial<SnackOrderItem>)
      .filter(Boolean)
      .map((x, idx) =>
        normalizeItem({
          id: String(x?.id ?? `item-${idx}`),
          name: String(x?.name ?? "Item"),
          price: Number(x?.price ?? 0),
          qty: typeof x?.qty === "number" ? x?.qty : 1,
          subtotal:
            typeof x?.subtotal === "number"
              ? x?.subtotal
              : Number(x?.price ?? 0) *
                (typeof x?.qty === "number" ? x?.qty : 1),
        })
      );

    const order: SnackOrder = {
      key: String(v.key ?? (c.key as string)),
      userId: String(v.userId ?? ""),
      storeId: String(v.storeId ?? ""),
      status: (v.status as OrderStatus) ?? "pedido realizado",
      createdAt: Number(v.createdAt ?? Date.now()),
      items,
    };
    list.push(order);
    return false;
  });
  list.sort((a, b) => b.createdAt - a.createdAt);
  return list;
}

export class OrderService {

  /** Garante usuário autenticado (anônimo se necessário) e retorna userId */
  static async ensureUserId(): Promise<string> {
    try {
      const { getAuth, onAuthStateChanged } = await import("firebase/auth");
      const auth = getAuth();
      const existing = auth.currentUser;
      if (existing?.uid) return existing.uid;
      // aguarda onAuthStateChanged (útil pós carregamento)
      const uid = await new Promise<string>((resolve) => {
        const off = onAuthStateChanged(auth, (u) => {
          off();
          resolve(u?.uid ?? "");
        });
        setTimeout(() => { try { off(); } catch {} resolve(""); }, 1000);
      });
      return uid;
    } catch {
      return "";
    }
  }

  /** Busca um pedido por ID (CF getOrderById com fallback RTDB) */
  static async getById(orderId: string): Promise<SnackOrder | null> {
    if (!orderId) return null;

    // 1) tenta callable
    try {
      const fn = httpsCallable(
        getFunctions(undefined, REGION),
        "getOrderById"
      );
      const res: any = await fn({ orderId });
      const d: any = res?.data || null;

      if (d && d.orderId) {
        const itemsRaw = Array.isArray(d.items) ? d.items : [];
        const items: SnackOrderItem[] = itemsRaw.map(
          (x: any, idx: number) =>
            normalizeItem({
              id: String(x?.id ?? `item-${idx}`),
              name: String(x?.name ?? "Item"),
              price: Number(x?.price ?? 0),
              qty: Number(x?.qty ?? 1),
              subtotal:
                typeof x?.subtotal === "number"
                  ? x.subtotal
                  : Number(x?.price ?? 0) * Number(x?.qty ?? 1),
            })
        );

        return {
          key: String(d.orderId),
          userId: String(d.userId || ""),
          storeId: String(d.storeId || ""),
          status: String(d.status || "pedido realizado") as OrderStatus,
          createdAt: Number(d.createdAt || Date.now()),
          items,
        };
      }
    } catch {
      // segue para fallback
    }

    // 2) fallback direto no RTDB
    try {
      const db = getDatabase();
      const snap = await get(child(ref(db), `orders/${orderId}`));
      if (!snap.exists()) return null;

      const v: any = snap.val() || {};
      const raw =
        Array.isArray(v.items)
          ? v.items
          : v.items && typeof v.items === "object"
          ? Object.values(v.items)
          : [];
      const items: SnackOrderItem[] = raw.map((x: any, idx: number) =>
        normalizeItem({
          id: String(x?.id ?? `item-${idx}`),
          name: String(x?.name ?? "Item"),
          price: Number(x?.price ?? 0),
          qty: Number(x?.qty ?? 1),
          subtotal:
            typeof x?.subtotal === "number"
              ? x.subtotal
              : Number(x?.price ?? 0) * Number(x?.qty ?? 1),
        })
      );

      return {
        key: String(orderId),
        userId: String(v?.userId ?? ""),
        storeId: String(v?.storeId ?? ""),
        status: String(v?.status ?? "pedido realizado") as OrderStatus,
        createdAt: Number(v?.createdAt ?? Date.now()),
        items,
      };
    } catch {
      return null;
    }
  }

  /** Nova API recomendada: assina /orders_by_user/{uid} */
  static subscribeUserOrders(
    userId: string,
    cb: (orders: SnackOrder[]) => void,
    limit = 20
  ): () => void {
    const safeLimit =
      Number.isFinite(limit) && limit > 0 ? Math.floor(limit) : 20;
    const db = getDatabase();
    const q = query(
      ref(db, `orders_by_user/${userId}`),
      orderByChild("createdAt"),
      limitToLast(safeLimit)
    );
    return onValue(q, (snap) => cb(snapshotToOrders(snap)));
  }

  /**
   * Compat: aceita
   *  - listenUserOrders(uid, (list) => void)
   *  - listenUserOrders(uid, 10, (list) => void)
   *  - listenUserOrders(uid, { limit: 10 }, (list) => void)
   */
  static listenUserOrders(
    userId: string,
    optionsOrLimit?:
      | number
      | { limit?: number }
      | ((orders: SnackOrder[]) => void),
    cbMaybe?: (orders: SnackOrder[]) => void
  ): () => void {
    let limit = 20;
    let cb: (orders: SnackOrder[]) => void = () => {};

    if (typeof optionsOrLimit === "function") {
      cb = optionsOrLimit;
    } else if (typeof optionsOrLimit === "number") {
      limit = optionsOrLimit;
      if (typeof cbMaybe === "function") cb = cbMaybe;
    } else if (optionsOrLimit && typeof optionsOrLimit === "object") {
      if (typeof optionsOrLimit.limit === "number")
        limit = optionsOrLimit.limit;
      if (typeof cbMaybe === "function") cb = cbMaybe;
    } else if (typeof cbMaybe === "function") {
      cb = cbMaybe;
    }

    const uid = getAuth().currentUser?.uid;
    if (!uid) { cb([]); return () => {}; }
    return OrderService.subscribeUserOrders(uid, cb, limit);
  }

  /** Cria pedido via Cloud Function `createOrder`; fallback: grava no RTDB mantendo UX */
  static async createOrder(
    payload: CreateOrderPayload
  ): Promise<CreateOrderResult> {
    // Garante auth e obtem userId
    const ensuredUserId = await OrderService.ensureUserId();
    if (!ensuredUserId) {
      throw new Error("Usuário não autenticado.");
    }

    const auth = getAuth();
    const user = auth.currentUser;
    const ensuredUid = payload.uid ?? user?.uid ?? ensuredUserId;

    if (!ensuredUid) {
      throw new Error("Usuário não autenticado.");
    }

    // 1) Tenta a callable se existir
    try {
      const fn = httpsCallable<CreateOrderPayload, CreateOrderResult>(
        getFunctions(undefined, REGION),
        "createOrder"
      );
      const { data } = await fn({ ...payload, uid: ensuredUid });
      if (data && typeof data.orderId === "string") {
        return data;
      }
    } catch {
      // segue para fallback
    }

    // 2) Fallback: grava estrutura mínima diretamente no RTDB
    const db = getDatabase();
    const orderRef = push(ref(db, "orders"));
    const orderId = String(orderRef.key ?? "");
    if (!orderId) throw new Error("Falha ao gerar ID do pedido.");

    const createdAt = Date.now();
    const status: OrderStatus = payload.status ?? "pedido realizado";
    const storeId = String(payload.storeId ?? "");

    const safeItems: SnackOrderItem[] = Array.isArray(payload.items)
      ? payload.items.map(normalizeItem)
      : [];

    const orderData = {
      key: orderId,
      userId: ensuredUid,
      storeId,
      status,
      createdAt,
      items: safeItems,
    };

    // Escreve em /orders e em /orders_by_user/{uid}/{orderId} (conforme regras)
    await set(ref(db, `orders/${orderId}`), orderData);
    await set(ref(db, `orders_by_user/${ensuredUid}/${orderId}`), orderData);

    return { orderId };
  }

  /** Alias para compatibilidade com chamadas antigas */
  static async create(
    payload: CreateOrderPayload
  ): Promise<CreateOrderResult> {
    return this.createOrder(payload);
  }

  /** Lista pedidos paginados do usuário autenticado via callable getUserOrders */
  static async getUserOrdersPaged(opts?: {
    limit?: number;
    cursorCreatedAt?: number;
    status?: OrderStatus;
  }): Promise<{
    orders: SnackOrder[];
    nextCursorCreatedAt: number | null;
  }> {
    const limit =
      opts?.limit && Number.isFinite(opts.limit)
        ? Math.min(50, Math.max(1, Number(opts.limit)))
        : 20;

    const fn = httpsCallable(
      getFunctions(undefined, REGION),
      "getUserOrders"
    );
    const res: any = await fn({
      limit,
      cursorCreatedAt: opts?.cursorCreatedAt,
      status: opts?.status,
    });

    const arr: any[] = Array.isArray(res?.data?.orders)
      ? res.data.orders
      : [];

    const orders: SnackOrder[] = arr.map((o: any) => {
      const raw =
        Array.isArray(o.items)
          ? o.items
          : o.items && typeof o.items === "object"
          ? Object.values(o.items)
          : [];
      const items: SnackOrderItem[] = raw.map((x: any, i: number) =>
        normalizeItem({
          id: String(x?.id ?? `item-${i}`),
          name: String(x?.name ?? "Item"),
          price: Number(x?.price ?? 0),
          qty: Number(x?.qty ?? 1),
          subtotal:
            typeof x?.subtotal === "number"
              ? x.subtotal
              : Number(x?.price ?? 0) * Number(x?.qty ?? 1),
        })
      );

      return {
        key: String(o.key),
        userId: String(o.userId || ""),
        storeId: String(o.storeId || ""),
        status: String(o.status || "pedido realizado") as OrderStatus,
        createdAt: Number(o.createdAt || Date.now()),
        items,
      };
    });

    const nextCursorCreatedAt =
      typeof res?.data?.nextCursorCreatedAt === "number"
        ? res.data.nextCursorCreatedAt
        : null;

    return { orders, nextCursorCreatedAt };
  }
}