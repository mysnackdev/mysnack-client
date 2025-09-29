function hasKey<T extends Record<string, unknown>>(obj: T | undefined, key: string): obj is T {
  return !!obj && Object.prototype.hasOwnProperty.call(obj, key);
}
function isObj(v: unknown): v is Record<string, unknown> { return !!v && typeof v === "object"; }
// src/services/shoppings.ts
import app from "@/firebase";
import { getDatabase, ref, get } from "firebase/database";
import { httpsCallable } from "firebase/functions";
import { functions } from "@/firebase";

export type ShoppingInfo = { slug: string; name?: string };

const db = getDatabase(app);

/**
 * Descobre o shopping ao qual a loja pertence varrendo relações,
 * priorizando a Cloud Function (Admin SDK) e caindo para um scan no RTDB.
 */
export async function getShoppingByStoreId(storeId: string): Promise<ShoppingInfo | null> {
  if (!storeId) return null;
  // 1) Callable (Admin SDK)
  try {
    const getByFn = httpsCallable(functions, "getShoppingByStoreId");
    const res: unknown = await getByFn({ storeId });
    const data = ((res as { data?: { shoppingSlug?: string; shoppingName?: string } } | null | undefined)?.data) || {};
    if (data?.shoppingSlug) {
      return { slug: data.shoppingSlug as string, name: data.shoppingName as (string | undefined) };
    }
  } catch (err: unknown) {
    console.warn("[getShoppingByStoreId] callable failed, fallback to RTDB scan", err);
  }
  // 2) Fallback: RTDB scan (para ambientes dev com usuário com role)
  try {
    const snap = await get(ref(db, "backoffice/shoppings"));
    if (!snap.exists()) return null;
    const all = (snap.val() as Record<string, unknown>) || {};
    for (const slug of Object.keys(all)) {
      const sUnknown = all[slug] as unknown;
      const s = isObj(sUnknown) ? (sUnknown as Record<string, unknown>) : undefined;

      const storeNode = isObj(s?.store) ? (s!.store as Record<string, unknown>) : undefined;
      const storesNode = isObj(s?.stores) ? (s!.stores as Record<string, unknown>) : undefined;

      const hasInStore = hasKey(storeNode, storeId);
      const hasInStores = hasKey(storesNode, storeId);
      if (hasInStore || hasInStores) {
        let name = "";
        if (isObj(s)) {
          const nv = s["name"];
          if (typeof nv === "string") name = nv;
        }
        return { slug, name };
      }
    }
  } catch {
    return null;
  }
  return null;
}