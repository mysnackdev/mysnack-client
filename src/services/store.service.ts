"use client";

import { getFunctions, httpsCallable } from "firebase/functions";

/** Tipos que espelham sua Cloud Function getFoodStores */
export interface CFContactInfo {
  phone: string;
  website: string;
}

export interface CFBundle {
  id?: string;               // pode vir do backend
  name: string;
  description: string;
  price: number;
  image?: string;            // pode vir do backend
}

export interface CFFoodStore {
  id?: string;
  name: string;
  category?: string;
  location?: string;
  contact: CFContactInfo;
  /** novos: */
  description?: string;
  minimumOrder?: number;
  opening_hours?: Record<string, { enabled: boolean; open: string; close: string }>;
  payments?: {
    onDelivery?: string[];
    appSite?: string[];
    mysnackAwards?: string[];
    banking?: string[];
  };
  menus?: unknown;
  isOpenNow?: boolean;
  updatedAt?: number;
  /** legado opcional */
  bundles?: CFBundle[];
}

export interface GetFoodStoresResult {
  mall: string;
  city: string;
  state: string;
  food_stores: CFFoodStore[];
}

export interface GetStoresOptions {
  /** Mantido pela assinatura do hook; httpsCallable não cancela de fato. */
  signal?: AbortSignal;
  /** Região do Cloud Functions (ex.: "us-central1"). Pode vir do .env */
  region?: string;
}

export class StoreService {
  static async getStores() {
    const region =
      process.env.NEXT_PUBLIC_FIREBASE_FUNCTIONS_REGION || "us-central1"; // <— bate com o backend
    const functions = getFunctions(undefined, region);
    const callable = httpsCallable<unknown, GetFoodStoresResult>(functions, "getFoodStores");
    const res = await callable();
    return res.data;
  }
}
