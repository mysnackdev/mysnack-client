"use client";
import { getFunctions, httpsCallable } from "firebase/functions";

export type StoreSummary = {
  id: string;
  name: string;
  displayName?: string;
  categoria?: string;
  minimo?: number;
  phone?: string;
  website?: string;
  location?: string;
  online: boolean;
  cadastroCompleto?: boolean;
  imageUrl?: string;
};

export type MenuItem = {
  id: string;
  name: string;
  price: number;
  imageUrl?: string;
  type?: "preparado" | "industrializado";
  category?: string;
  categories?: string[];
  description?: string;
  available?: boolean;
};

export type StoreCatalog = { store: StoreSummary; categories: string[]; items: MenuItem[] };

const REGION = process.env.NEXT_PUBLIC_FIREBASE_FUNCTIONS_REGION || "us-central1";

function functions() {
  return getFunctions(undefined, REGION);
}

export class CatalogService {
  static async getClientCatalog(): Promise<StoreCatalog[]> {
    const call = httpsCallable<unknown, { catalogs?: StoreCatalog[] }>(
      functions(),
      "getClientCatalog",
    );
    const { data } = await call();
    return data?.catalogs ?? [];
  }

  static async getOnlineStores(): Promise<StoreSummary[]> {
    const call = httpsCallable<unknown, { stores?: StoreSummary[] }>(
      functions(),
      "getOnlineStores",
    );
    const { data } = await call();
    return data?.stores ?? [];
  }

  static async getStoresStatus(): Promise<StoreSummary[]> {
    try {
      const call = httpsCallable<unknown, { stores?: StoreSummary[] }>(
        functions(),
        "getStoresStatus",
      );
      const { data } = await call();
      return data?.stores ?? [];
    } catch {
      // Fallback em projetos sem essa callable
      return this.getOnlineStores();
    }
  }

  static async getStoreCatalog(storeId: string): Promise<StoreCatalog | null> {
    const call = httpsCallable<{ storeId: string }, StoreCatalog>(
      functions(),
      "getStoreCatalog",
    );
    const { data } = await call({ storeId });
    return data ?? null;
  }
}
