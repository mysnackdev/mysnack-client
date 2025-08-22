// services/order.service.ts
import { db } from "@/firebase";
import {
  ref, query, orderByChild, equalTo, limitToLast,
  onValue, off, get, push, set, DataSnapshot
} from "firebase/database";

export type SnackOrderItem = {
  id: string;
  name: string;
  qty: number;
  price: number; // unit price
};

export type SnackOrder = {
  key: string;
  userId: string;
  brand?: string;          // ex.: "Pizza Caesar"
  items: SnackOrderItem[];
  total: number;           // total do pedido
  status: string;          // ex.: "concluído" | "aguardando aceite"
  createdAt: number;       // Date.now()
  // campos livres (mesa, storeId etc)
};

type ListOptions = { limit?: number };

// UTIL: converte snapshot em array ordenada por createdAt desc
function snapshotToOrders(snapshot: DataSnapshot): SnackOrder[] {
  const result: SnackOrder[] = [];
  snapshot.forEach((child) => {
    const val = child.val() || {};
    result.push({
      key: child.key || "",
      userId: val.userId,
      brand: val.brand,
      items: val.items || [],
      total: Number(val.total || 0),
      status: String(val.status || ""),
      createdAt: Number(val.createdAt || 0),
    });
  });
  return result.sort((a, b) => b.createdAt - a.createdAt);
}

export const OrderService = {
  async createOrder(name: string): Promise<string> {
    const pedidosRef = ref(db, "pedidos");
    const newRef = push(pedidosRef);
    await set(newRef, {
      userId: "anonymous",
      brand: "Pizza Caesar",
      items: [],
      total: 0,
      status: "aguardando aceite",
      createdAt: Date.now(),
      name,
    });
    return newRef.key as string;
  },

  trackOrder(orderKey: string, cb: (s: DataSnapshot) => void) {
    const r = ref(db, `pedidos/${orderKey}`);
    return onValue(r, cb);
  },

  // Escuta pedidos do usuário (histórico + peça de novo)
  listenUserOrders(userId: string, { limit = 20 }: ListOptions, cb: (orders: SnackOrder[]) => void) {
    const base = ref(db, "pedidos");
    const q = query(base, orderByChild("userId"), equalTo(userId), limitToLast(limit));
    onValue(q, (snap) => cb(snapshotToOrders(snap)));
    return () => off(q); // cancelar listener
  },

  // Busca uma vez (sem streaming)
  async fetchUserOrdersOnce(userId: string, { limit = 20 }: ListOptions = {}): Promise<SnackOrder[]> {
    const base = ref(db, "pedidos");
    const q = query(base, orderByChild("userId"), equalTo(userId), limitToLast(limit));
    const snap = await get(q);
    return snapshotToOrders(snap);
  },

  // Pedir novamente — replica os itens do pedido anterior
  async reorderFrom(order: SnackOrder, overrides?: Partial<Omit<SnackOrder, "key">>) {
    const pedidosRef = ref(db, "pedidos");
    const newRef = push(pedidosRef);
    const payload: Omit<SnackOrder, "key"> = {
      userId: order.userId,
      brand: order.brand,
      items: order.items || [],
      total: order.total,
      status: "aguardando aceite",
      createdAt: Date.now(),
      ...overrides,
    };
    await set(newRef, payload);
    return newRef.key as string;
  },
};
