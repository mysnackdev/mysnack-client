/* eslint-disable @typescript-eslint/no-explicit-any */

import { getFunctions, httpsCallable } from "firebase/functions";
import { getDatabase, ref, child, get } from "firebase/database";

export type Product = {
  id: string;
  name: string;
  price: number;
  imageUrl?: string;
  description?: string;
  category?: string;
  categories?: string[];
  available?: boolean;
  storeId: string;
  storeName?: string;
};

function normalizeItem(storeId: string, productId: string, v: any) {
  const price = typeof v?.preco === "number" ? v.preco
              : (typeof v?.price === "number" ? v.price : Number(v?.preco ?? v?.price ?? 0));
  return {
    id: String(v?.id ?? productId),
    name: String(v?.nome ?? v?.name ?? "Produto"),
    price: Number.isFinite(price) ? price : 0,
    imageUrl: v?.imageUrl ?? v?.imagemUrl,
    description: v?.description ?? v?.descricao,
    category: v?.category,
    categories: Array.isArray(v?.categories) ? v.categories.filter((x: any) => typeof x === "string") : undefined,
    available: v?.available !== false,
    storeId,
  } as Product;
}

export class ProductService {
  static async getById(storeId: string, productId: string): Promise<Product | null> {
    // 0) Catálogo da loja via callable oficial
    try {
      const call = httpsCallable(getFunctions(undefined, "us-central1"), "getStoreCatalog");
      const resp: any = await call({ storeId });
      const data: any = resp?.data || null;
      if (data) {
        const pools: any[] = [];

        // coleções como arrays
        for (const key of ["items","produtos","menu","combos","pacotes"]) {
          const v = (data as any)[key];
          if (Array.isArray(v)) pools.push(...v);
        }

        // coleções como objetos (dicionários)
        for (const key of ["items","produtos","menu","combos","pacotes"]) {
          const obj = (data as any)[key];
          if (obj && typeof obj === "object" && !Array.isArray(obj)) {
            for (const [k, val] of Object.entries(obj)) {
              pools.push({ id: k, ...(val as any) });
            }
          }
        }

        // categorias aninhadas
        const cats = Array.isArray((data as any).categories) ? (data as any).categories : [];
        for (const c of cats) {
          for (const key of ["items","produtos","menu","combos","pacotes"]) {
            const v = (c as any)?.[key];
            if (Array.isArray(v)) pools.push(...v);
            if (v && typeof v === "object" && !Array.isArray(v)) {
              for (const [k, val] of Object.entries(v)) {
                pools.push({ id: k, ...(val as any) });
              }
            }
          }
        }

        const match = pools.find((it: any) => String(it?.id ?? "") === String(productId))
                   || pools.find((it: any) => String(it?.nome ?? it?.name ?? "") === String(productId));
        if (match) return normalizeItem(storeId, productId, match);
      }
    } catch {}    

    // 1) Callable dedicada (region fixa)
    try {
      const fn = httpsCallable(getFunctions(undefined, "us-central1"), "getProductById");
      const res: any = await fn({ storeId, productId });
      const p: any = res?.data?.product || null;
      if (p && p.id) return p as Product;
    } catch {}    

    // 2) Fallback direto ao RTDB (tenta items e combos, objetos ou arrays)
    try {
      const db = getDatabase();
      for (const path of [
        `client/catalog/${storeId}/items/${productId}`,
        `client/catalog/${storeId}/combos/${productId}`,
      ]) {
        const snap = await get(child(ref(db), path));
        if (snap.exists()) return normalizeItem(storeId, productId, snap.val());
      }
    } catch {}    

    return null;
  }
}
