// src/services/user-cards.service.ts
import { getApp } from "firebase/app";
import { getDatabase, ref, child, get } from "firebase/database";
import type { UserCard } from "@/types/payments";

/** Primary location (matches /payments page service): client/profiles/{uid}/payments/cards */
const primaryPath = (uid: string) => `client/profiles/${uid}/payments/cards`;
/** Legacy location kept for backward compatibility: client/payments/cards/{uid} */
const legacyPath  = (uid: string) => `client/payments/cards/${uid}`;

async function readPath(path: string): Promise<Record<string, any> | null> {
  const db = getDatabase(getApp());
  const snap = await get(child(ref(db), path));
  return snap.exists() ? (snap.val() as Record<string, any>) : null;
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
  for (const [id, it] of Object.entries(obj)) {
    const expStr = String((it as any).exp ?? "");
    const [m, y] = expStr.includes("/") ? expStr.split("/") : [(it as any)?.expMonth, (it as any)?.expYear];
    const expMonth = typeof m === "string" ? parseInt(m, 10) : Number(m ?? 0);
    const expYear  = typeof y === "string" ? parseInt(y, 10) : Number(y ?? 0);

    list.push({
      id: (it as any).id ?? (it as any).cardId ?? id,
      brand: (it as any).brand ?? (it as any).scheme ?? (it as any).type ?? "Desconhecido",
      last4: String((it as any).last4 ?? "").slice(-4),
      expMonth: Number.isFinite(expMonth) && expMonth > 0 ? expMonth : undefined,
      expYear: Number.isFinite(expYear) && expYear > 0 ? expYear : undefined,
      holder: (it as any).holder ?? (it as any).cardholder ?? (it as any).name ?? undefined,
      tokenRef: (it as any).tokenRef ?? (it as any).token ?? undefined,
    });
  }
  return list.filter(c => c.last4);
}
