import app from "@/firebase";
import { getFunctions, httpsCallable } from "firebase/functions";

export type ShoppingInfo = { shoppingSlug: string; shoppingName: string };

/** Safe parser for the Cloud Function response */
export class ShoppingLookup implements ShoppingInfo {
  shoppingSlug: string;
  shoppingName: string;
  constructor(raw: unknown) {
    const r = (raw && typeof raw === "object") ? (raw as Record<string, unknown>) : {};
    const slug = r["shoppingSlug"];
    if (typeof slug !== "string" || !slug.trim()) {
      throw new Error("Shopping not found for store");
    }
    this.shoppingSlug = slug;
    const name = r["shoppingName"];
    this.shoppingName = typeof name === "string" ? name : "";
  }
}

export async function getShoppingForStore(storeId: string): Promise<ShoppingInfo> {
  const region = process.env.NEXT_PUBLIC_FIREBASE_FUNCTIONS_REGION || "us-central1";
  const fn = httpsCallable(getFunctions(app, region), "getShoppingByStoreId");
  const res = await fn({ storeId });
  const parsed = new ShoppingLookup(res?.data);
  return { shoppingSlug: parsed.shoppingSlug, shoppingName: parsed.shoppingName };
}
