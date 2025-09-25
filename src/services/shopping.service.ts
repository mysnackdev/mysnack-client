import app from "@/firebase";
import { getFunctions, httpsCallable } from "firebase/functions";

export type ShoppingInfo = { shoppingSlug: string; shoppingName: string };

export async function getShoppingForStore(storeId: string): Promise<ShoppingInfo> {
  const fn = httpsCallable(getFunctions(app), "getShoppingByStoreId");
  const res = await fn({ storeId });
  const data = res.data as any;
  if (!data?.shoppingSlug) throw new Error("Shopping not found for store");
  return { shoppingSlug: data.shoppingSlug, shoppingName: data.shoppingName };
}
