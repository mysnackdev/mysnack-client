import { db } from "@/firebase";
import {
  get,
  onValue,
  orderByChild,
  query,
  ref,
  limitToLast,
  push,
  set,
  DataSnapshot,
} from "firebase/database";

export interface SnackOrderItem {
  name: string;
  qty: number;
  price: number;
}

export interface SnackOrder {
  key?: string;
  brand?: string;
  items: SnackOrderItem[];
  total: number;
  status?: string;
  createdAt: number; // timestamp (ms)
}

export interface ListenOptions {
  limit?: number;
}

export class OrderService {
  /** escuta pedidos do usuário em tempo real */
  static listenUserOrders(
    uid: string,
    options: ListenOptions,
    cb: (orders: SnackOrder[]) => void
  ): () => void {
    const lmt = options.limit ?? 50;
    const q = query(ref(db, `pedidos/${uid}`), orderByChild("createdAt"), limitToLast(lmt));

    const unsubscribe = onValue(q, (snap: DataSnapshot) => {
      const val = snap.val() as Record<string, SnackOrder> | null;
      const list: SnackOrder[] = val
        ? Object.entries(val)
            .map(([key, v]) => ({ ...(v as SnackOrder), key }))
            .sort((a, b) => b.createdAt - a.createdAt)
        : [];
      cb(list);
    });

    return () => unsubscribe();
  }

  /** cria um pedido simples */
  static async createOrder(uid: string, order: Omit<SnackOrder, "key">): Promise<string> {
    const r = ref(db, `pedidos/${uid}`);
    const newRef = push(r);
    await set(newRef, order);
    return newRef.key as string;
  }

  /** obtém o último pedido (exemplo utilitário) */
  static async getLastOrder(uid: string): Promise<SnackOrder | null> {
    const q = query(ref(db, `pedidos/${uid}`), orderByChild("createdAt"), limitToLast(1));
    const snap = await get(q);
    const val = snap.val() as Record<string, SnackOrder> | null;
    if (!val) return null;
    const [key, o] = Object.entries(val)[0];
    return { ...(o as SnackOrder), key };
  }
}