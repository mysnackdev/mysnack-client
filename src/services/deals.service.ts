"use client";
import { CatalogService, type StoreCatalog, type MenuItem } from "@/services/catalog.service";

export type DealItem = (MenuItem & { storeId: string; storeName: string });

export class DealsService {
  static async getCheapest(limit = 12): Promise<DealItem[]> {
    const cats: StoreCatalog[] = await CatalogService.getClientCatalog();
    const items: DealItem[] = [];
    for (const c of cats) {
      const storeName = c.store.displayName || c.store.name;
      for (const it of c.items) {
        if (typeof it.price === "number" && it.price >= 0) {
          items.push({ ...it, storeId: c.store.id, storeName });
        }
      }
    }
    items.sort((a, b) => a.price - b.price);
    return items.slice(0, limit);
  }
}
