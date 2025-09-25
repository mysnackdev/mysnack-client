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
    const res: any = await getByFn({ storeId });
    const data = res?.data || {};
    if (data?.shoppingSlug) {
      return { slug: data.shoppingSlug as string, name: data.shoppingName as (string | undefined) };
    }
  } catch (err) {
    console.warn("[getShoppingByStoreId] callable failed, fallback to RTDB scan", err);
  }
  // 2) Fallback: RTDB scan (para ambientes dev com usuário com role)
  try {
    const snap = await get(ref(db, "backoffice/shoppings"));
    if (!snap.exists()) return null;
    const all = snap.val() as Record<string, any>;
    for (const slug of Object.keys(all)) {
      const s = all[slug];
      const hasInStore = !!s?.store?.[storeId];
      const hasInStores = !!s?.stores?.[storeId];
      if (hasInStore || hasInStores) {
        return { slug, name: s?.name };
      }
    }
  } catch {}
  return null;
}
