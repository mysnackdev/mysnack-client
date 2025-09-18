
"use client";
import app from "@/firebase";
import { getDatabase, ref, onValue, off, query, orderByChild, equalTo, get, type DataSnapshot, type DatabaseReference, type Query } from "firebase/database";

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


type AnyRecord = Record<string, unknown>;
const isRecord = (v: unknown): v is AnyRecord => typeof v === "object" && v !== null;
const asRecord = (v: unknown): AnyRecord => (isRecord(v) ? v : {});
const asArray = (v: unknown): unknown[] => (Array.isArray(v) ? v : []);
const pick = (obj: unknown, keys: string[]): unknown => {
  const r = asRecord(obj);
  for (const k of keys) {
    if (k.includes(".")) {
      const [a, b] = k.split(".", 2);
      const inner = asRecord(r[a]);
      if (b in inner) return inner[b];
    } else if (k in r) {
      return r[k];
    }
  }
  return undefined;
};
const toNum = (v: unknown): number | null => (typeof v === "number" ? v : (typeof v === "string" && !isNaN(Number(v)) ? Number(v) : null));
const toStr = (v: unknown): string | null => (typeof v === "string" ? v : null);

/** Normaliza diferentes formatos de um pedido salvo no RTDB. */
function normalize(key: string, value: unknown): MirrorOrder {
  const createdAt = toNum(pick(value,["createdAt","ts","timestamp"])) ?? 0;
  const storeId =
    toStr(pick(value,["storeId","tenantId","store_id","store.id"]))
  const status = String(toStr(pick(value,["status","state","workflowStatus"])) ?? "pedido realizado")
  const total = toNum(pick(value,["total","amount"]));
  const number =
    toStr(pick(value,["number","n","orderNumber","code"]))
  const lastItem =
    toStr(pick(value,["lastItem","summary"])) ?? toStr(asArray(asRecord(value)["items"])[0] && (asRecord(asArray(asRecord(value)["items"])[0])["name"]))

  return {
    key,
    storeId,
    status,
    createdAt,
    cancelled: asRecord(value)["cancelled"] === true,
    total,
    number,
    lastItem,
  };
}

async function detectUserOrdersPath(uid: string): Promise<string | null> {
  const db = getDatabase(app);

  // 1) Força por env (opcional)
  const envPathTpl = process.env.NEXT_PUBLIC_ORDERS_MIRROR_PATH as string | undefined;
  if (envPathTpl) {
    const path = envPathTpl.includes("${uid}") ? envPathTpl.replace("${uid}", uid) : `${envPathTpl.replace(/\/+$/, "")}/${uid}`;
    try {
      const snap = await get(ref(db, path));
      if (snap.exists()) return path;
    } catch {/* ignore */}
  }

  const candidates = [
    `mirror/ordersByUser/${uid}`,
    `userOrdersMirror/${uid}`,
    `backoffice/userOrdersMirror/${uid}`,
    `ordersByUser/${uid}`,
    `users/${uid}/orders`,
    `orders_by_user/${uid}`,
  ];

  for (const path of candidates) {
    try {
      const snap = await get(ref(db, path));
      if (snap.exists()) return path;
    } catch {
      // tenta próxima
    }
  }

  // fallback: consulta por userId em /orders
  try {
    const q = query(ref(db, "orders"), orderByChild("userId"), equalTo(uid));
    const snap = await get(q);
    if (snap.exists()) return "__QUERY__/orders.userId";
  } catch {
    // ignore
  }
  return null;
}

/** Escuta os pedidos espelhados do usuário, independente do caminho usado no projeto. */
export async function subscribeUserOrders(uid: string, cb: (orders: MirrorOrder[]) => void): Promise<() => void> {
  const db = getDatabase(app);
  const path = await detectUserOrdersPath(uid);

  if (!path) {
    // nenhum caminho encontrado; devolve lista vazia e noop-unsub
    cb([]);
    return () => {};
  }

  if (path === "__QUERY__/orders.userId") {
    const q = query(ref(db, "orders"), orderByChild("userId"), equalTo(uid));
    const handler = (snap: DataSnapshot) => {
      const val = snap.val() || {};
      const list = Object.entries(val as Record<string, unknown>)
        .map(([key, v]) => normalize(key, v))
        .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
      cb(list);
    };
    onValue(q, handler);
    return () => off(q as Query, "value", handler);
  }

  const r = ref(db, path);
  const handler = (snap: DataSnapshot) => {
    const val = snap.val() || {};
    const list = Object.entries(val as Record<string, unknown>)
      .map(([key, v]) => normalize(key, v))
      .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
    cb(list);
  };
  onValue(r, handler);
  return () => off(r as DatabaseReference, "value", handler);
}
