import { getDatabase, ref, push, set, remove, update, get, child, onValue } from "firebase/database";
import { auth } from "@/firebase";
import { onAuthStateChanged } from "firebase/auth";

/** Tipos exibidos na UI e no banco */
export type UiCardType = "Crédito" | "Débito";
export type DbCardType = "credit_card" | "debit_card";

export interface SavedCard {
  id: string;
  brand: string;     // Visa, Mastercard, etc.
  last4: string;     // "1234"
  exp: string;       // "MM/YY"
  holder: string;
  type: DbCardType;
  default?: boolean;
}

/** Caminho base para cartões do usuário */
function cardsPath(uid: string) {
  return `client/payments/cards/${uid}`;
}
function cardsRefFor(uid: string) {
  return ref(getDatabase(), cardsPath(uid));
}
function assertUid(): string {
  const u = auth.currentUser;
  if (!u?.uid) throw new Error("Usuário não autenticado.");
  return u.uid;
}

/** Util simples para detectar bandeira (mock) */
function detectBrand(cardNumber: string): string {
  const n = cardNumber.replace(/\s+/g, "");
  if (/^4\d{12}(\d{3})?$/.test(n)) return "Visa";
  if (/^5[1-5]\d{14}$/.test(n)) return "Mastercard";
  if (/^3[47]\d{13}$/.test(n)) return "Amex";
  if (/^(6011|65|64[4-9])\d+/.test(n)) return "Discover";
  return "Desconhecido";
}

/** Adiciona cartão (mock, NÃO salva dados sensíveis) */
export async function addCard(opts: { holder: string; number: string; exp: string; cvv?: string; uiType: UiCardType }): Promise<SavedCard> {
  const uid = assertUid();
  const db = getDatabase();
  const brand = detectBrand(opts.number);
  const last4 = opts.number.replace(/\s+/g, "").slice(-4);
  const type: DbCardType = opts.uiType === "Crédito" ? "credit_card" : "debit_card";

  const r = cardsRefFor(uid);
  const keyRef = push(r);
  const payload = {
    brand, last4, exp: opts.exp, holder: opts.holder, type,
    default: false,
    // ⚠️ NÃO persistimos número nem CVV
  };
  await set(keyRef, payload);
  return { id: keyRef.key as string, ...(payload as any) };
}

/** Remove cartão */
export async function deleteCard(cardId: string): Promise<void> {
  const uid = assertUid();
  await remove(ref(getDatabase(), `${cardsPath(uid)}/${cardId}`));
}

/** Define cartão padrão (atualiza todos para default=false e um para true) */
export async function setDefaultCard(cardId: string): Promise<void> {
  const uid = assertUid();
  const db = getDatabase();
  const base = cardsPath(uid);

  const snap = await get(ref(db, base));
  const updates: Record<string, any> = {};
  if (snap.exists()) {
    const val = snap.val() as Record<string, any>;
    Object.keys(val).forEach((id) => {
      updates[`${base}/${id}/default`] = id === cardId;
    });
  } else {
    updates[`${base}/${cardId}/default`] = true;
  }
  await update(ref(db), updates);
}

/** Ouve cartões do usuário em tempo real.
 *  - Emite [] se não autenticado e passa a aguardar login.
 *  - Retorna função de unsubscribe (auth + db).
 */
export function listenCards(cb: (cards: SavedCard[]) => void): () => void {
  const start = (uid: string) => {
    const r = cardsRefFor(uid);
    const off = onValue(r, (snap) => {
      const raw = snap.val() as Record<string, Omit<SavedCard, "id">> | null;
      const list: SavedCard[] = raw
        ? Object.entries(raw).map(([id, v]) => ({ id, ...(v as any) }))
        : [];
      cb(list);
    });
    return off;
  };

  let dbUnsub: (() => void) | undefined;
  const u = auth.currentUser;
  if (u?.uid) {
    dbUnsub = start(u.uid);
    return () => { if (dbUnsub) dbUnsub(); };
  }

  // Sem usuário logado: emite vazio e espera autenticar
  cb([]);
  const authUnsub = onAuthStateChanged(auth, (nu) => {
    if (nu?.uid) {
      dbUnsub = start(nu.uid);
      authUnsub();
    }
  });
  return () => {
    authUnsub();
    if (dbUnsub) dbUnsub();
  };
}
