import { httpsCallable } from "firebase/functions";
import { functions } from "../firebase";
import { Store } from "@/@types";

export type GetStoresOptions = { signal?: AbortSignal }; // opcional e ignorado

const getStores = httpsCallable<unknown, Store>(functions, "getFoodStores");

export class StoresService {
  static getStores = async (_options?: GetStoresOptions): Promise<Store> => {
    // _options?.signal é ignorado, pois httpsCallable não suporta abort
    console.log("_options recebido em getStores:", _options);
    const { data } = await getStores();
    return data;
  };
}
