import { httpsCallable } from "firebase/functions";
import { functions } from "../firebase";
import { Store } from "@/@types";

// Updated function name
const getFoodStores = httpsCallable<unknown, Store>(
  functions,
  "getFoodStores"
);

export class StoresService {
  static getStores = async (): Promise<Store> => {
    const { data } = await getFoodStores();
    return data;
  };
}