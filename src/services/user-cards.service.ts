// src/services/user-cards.service.ts
import { getApp } from "firebase/app";
import { getDatabase, ref, child, get } from "firebase/database";
import type { UserCard } from "@/types/payments";

/** Primary location (matches /payments page service): client/profiles/{uid}/payments/cards */
const primaryPath = (uid: string) => `client/profiles/${uid}/payments/cards`;
/** Legacy location kept for backward compatibility: client/payments/cards/{uid} */
const legacyPath  = (uid: string) => `client/payments/cards/${uid}`;

async function readPath(path: string): Promise<Record<string, unknown> | null> {
  const db = getDatabase(getApp());
  const snap = await get(child(ref(db), path));
  return snap.exists() ? (snap.val() as Record<string, unknown>) : null;
}

export async function readUserSavedCards(uid: string): Promise<UserCard[]> {
  // Try primary location first
  let obj = await readPath(primaryPath(uid));
  if (!obj) {
    // Fallback to legacy location if present
    obj = await readPath(legacyPath(uid));
  }
  if (!obj) return [];

  const list: UserCard[] = [];
  for (const [id, it] of Object.entries(obj as Record<string, unknown>)) {
    const expStr = String((it as Record<string, unknown>).exp ?? "");
    const [m, y] = expStr.includes("/") ? expStr.split("/") : [(it as Record<string, unknown>)?.expMonth, (it as Record<string, unknown>)?.expYear];
    const expMonth = typeof m === "string" ? parseInt(m, 10) : Number(m ?? 0);
    const expYear  = typeof y === "string" ? parseInt(y, 10) : Number(y ?? 0);

    list.push({
      id: (typeof (it as Record<string, unknown>)['id'] === 'string' ? (it as Record<string, unknown>)['id'] as string : (typeof (it as Record<string, unknown>)['cardId'] === 'string' ? (it as Record<string, unknown>)['cardId'] as string : id)),
      brand: ((it as Record<string, unknown>)['brand'] as string) ?? ((it as Record<string, unknown>)['scheme'] as string) ?? ((it as Record<string, unknown>)['type'] as string) ?? "Desconhecido",
      last4: String(((it as Record<string, unknown>)['last4'] as string) ?? "").slice(-4),
      expMonth: Number.isFinite(expMonth) && expMonth > 0 ? expMonth : undefined,
      expYear: Number.isFinite(expYear) && expYear > 0 ? expYear : undefined,
      holder: ((it as Record<string, unknown>)['holder'] as string) ?? ((it as Record<string, unknown>)['cardholder'] as string) ?? ((it as Record<string, unknown>)['name'] as string) ?? undefined,
      tokenRef: ((it as Record<string, unknown>)['tokenRef'] as string) ?? ((it as Record<string, unknown>)['token'] as string) ?? undefined,
    });
  }
  return list.filter(c => c.last4);
}
