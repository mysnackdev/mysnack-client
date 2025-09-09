"use client";
import { CatalogService, type StoreSummary } from "@/services/catalog.service";

export interface CFFoodStore {
  id: string;
  name: string;
  category?: string;
  contact?: { phone?: string; website?: string };
  description?: string;
  minimumOrder?: number;
  opening_hours?: unknown;
  isOpenNow?: boolean;
  online?: boolean;
  imageUrl?: string;
  location?: string;
}

export interface GetFoodStoresResult {
  mall: string;
  city: string;
  state: string;
  food_stores: CFFoodStore[];
}

export class StoreService {
  static async getStores(): Promise<GetFoodStoresResult> {
    const list: StoreSummary[] = await CatalogService.getStoresStatus();
    const mapped: CFFoodStore[] = list.map((s) => ({
      id: s.id,
      name: s.displayName || s.name,
      category: s.categoria,
      contact: { phone: s.phone, website: s.website },
      minimumOrder: s.minimo,
      isOpenNow: s.online,
      online: s.online,
      imageUrl: s.imageUrl,
      location: s.location,
    }));
    return { mall: "", city: "", state: "", food_stores: mapped };
  }
}
