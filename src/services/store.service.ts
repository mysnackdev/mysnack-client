"use client";

import { getFunctions, httpsCallable, type HttpsCallableResult } from "firebase/functions";

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
  id?: string;               // pode vir do backend
  name: string;
  category: string;
  location: string;
  contact: CFContactInfo;
  bundles: CFBundle[];
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
  /** Busca lojas no Cloud Functions (onCall: getFoodStores) */
  static async getStores(opts: GetStoresOptions = {}): Promise<GetFoodStoresResult> {
    // Usa região definida no .env se existir
    const region = opts.region ?? process.env.NEXT_PUBLIC_FIREBASE_FUNCTIONS_REGION ?? undefined;
    const functions = getFunctions(undefined, region);
    const callable = httpsCallable<unknown, GetFoodStoresResult>(functions, "getFoodStores");
    const res: HttpsCallableResult<GetFoodStoresResult> = await callable();
    return res.data;
  }
}
