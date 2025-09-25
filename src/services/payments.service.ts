import { getDatabase, ref, push, set, remove, update, get, child, onValue, off } from "firebase/database";
import { auth } from "@/firebase";

/**
 * Tipos persistidos no RTDB (compatível com suas regras)
 * - type: 'credit_card' | 'debit_card'
 */
export type UiCardType = "Crédito" | "Débito";
export type DbCardType = "credit_card" | "debit_card";

export interface SavedCard {
  id: string;
  brand: string;     // ex: Visa, Mastercard, Amex, Desconhecido
  last4: string;     // '1234'
  exp: string;       // 'MM/YY'
  holder: string;    // Nome impresso
  type: DbCardType;  // 'credit_card' | 'debit_card'
  createdAt: number; // epoch ms
  updatedAt?: number;
  default?: boolean;
}

const mapUiTypeToDb = (t: UiCardType): DbCardType => (t === "Débito" ? "debit_card" : "credit_card");

function detectBrand(num: string): string {
  const n = (num || "").replace(/\D/g, "");
  if (/^4\d{12,18}$/.test(n)) return "Visa";
  if (/^5[1-5]\d{14}$/.test(n) || /^2(2\d\d|7[01]\d|720)\d{12}$/.test(n)) return "Mastercard";
  if (/^3[47]\d{13}$/.test(n)) return "Amex";
  if (/^(?:6011|65|64[4-9])\d{12,15}$/.test(n)) return "Discover";
  if (/^3(?:0[0-5]|[68])\d{11}$/.test(n)) return "Diners";
  if (/^35\d{14}$/.test(n)) return "JCB";
  return "Desconhecido";
}

function cardsRef(uid?: string) {
  const cur = uid ?? auth.currentUser?.uid;
  if (!cur) throw new Error("Usuário não autenticado.");
  return ref(getDatabase(), `client/profiles/${cur}/payments/cards`);
}

export async function listCards(): Promise<SavedCard[]> {
  const cur = auth.currentUser?.uid;
  if (!cur) return [];
  const snap = await get(cardsRef(cur));
  if (!snap.exists()) return [];
  const raw = snap.val() as Record<string, Omit<SavedCard, "id">>;
  return Object.entries(raw).map(([id, v]) => ({ id, ...(v as any) }));
}

export function listenCards(cb: (cards: SavedCard[]) => void): () => void {
  const uid = auth.currentUser?.uid;
  if (!uid) {
    cb([]);
    return () => {};
  }
  const q = cardsRef(uid);
  const handler = (snap: any) => {
    if (!snap.exists()) {
      cb([]);
      return;
    }
    const raw = snap.val() as Record<string, Omit<SavedCard, "id">>;
    const arr = Object.entries(raw).map(([id, v]) => ({ id, ...(v as any) }));
    // Ordena por createdAt desc, com default primeiro
    arr.sort((a: any, b: any) => {
      if (a.default === b.default) return (b.createdAt ?? 0) - (a.createdAt ?? 0);
      return a.default ? -1 : 1;
    });
    cb(arr as SavedCard[]);
  };
  onValue(q, handler, { onlyOnce: false });
  return () => off(q, "value", handler);
}

export async function addCard(input: { holder: string; number: string; exp: string; cvv: string; type: UiCardType; }): Promise<string> {
  const { holder, number, exp, type } = input;
  const createdAt = Date.now();
  const last4 = (number || "").replace(/\D/g, "").slice(-4);
  const brand = detectBrand(number);
  const data: Omit<SavedCard, "id"> = {
    brand,
    last4,
    exp,
    holder,
    type: mapUiTypeToDb(type),
    createdAt,
  };
  const newRef = push(cardsRef());
  await set(newRef, data);
  return newRef.key as string;
}

export async function deleteCard(cardId: string): Promise<void> {
  await remove(child(cardsRef(), cardId));
}

export async function setDefaultCard(cardId: string): Promise<void> {
  const db = getDatabase();
  const snap = await get(cardsRef());
  const updates: Record<string, any> = {};
  if (snap.exists()) {
    Object.keys(snap.val() as any).forEach((id) => {
      updates[`${cardsRef().toString().replace(getDatabase().ref().toString(), "")}/${id}/default`] = id === cardId;
    });
  } else {
    updates[`${cardsRef().toString().replace(getDatabase().ref().toString(), "")}/${cardId}/default`] = true;
  }
  await update(ref(db), updates);
}
