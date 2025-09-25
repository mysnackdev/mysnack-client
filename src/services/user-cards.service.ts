
// src/services/user-cards.service.ts
import { getApp } from "firebase/app";
import { getDatabase, ref, child, get } from "firebase/database";
import type { UserCard } from "@/types/payments";

/** Reads ONLY from RTDB at client/payments/cards/{uid}/{cardId} */
const basePath = (uid: string) => `client/payments/cards/${uid}`;

export async function readUserSavedCards(uid: string): Promise<UserCard[]> {
  const db = getDatabase(getApp());
  const snap = await get(child(ref(db), basePath(uid)));
  if (!snap.exists()) return [];
  const obj = snap.val() as Record<string, any>;
  const entries = Object.values(obj ?? {});
  return entries
    .map((it: any) => ({
      id: it.id ?? it.cardId ?? it.key ?? it.last4,
      brand: it.brand ?? it.scheme ?? it.type ?? "card",
      last4: String(it.last4 ?? "").slice(-4),
      expMonth: Number(it.expMonth ?? it.exp_month ?? 0),
      expYear: Number(it.expYear ?? it.exp_year ?? 0),
      holder: it.holder ?? it.cardholder ?? it.name ?? undefined,
      tokenRef: it.tokenRef ?? it.token ?? undefined,
    }))
    .filter((c) => c.last4);
}
