import { db } from "../firebase";
import { ref, onValue, set } from "firebase/database";

export type Card = { brand: string; holder: string; last4: string };
export type PaymentsData = { balance: number; cards: Card[] };

export const PaymentsService = {
  subscribe(uid: string, cb: (data: PaymentsData | null) => void) {
    const r = ref(db, `payments/${uid}`);
    return onValue(r, (snap) => {
      cb(snap.val() || null);
    });
  },
  async replace(uid: string, data: PaymentsData) {
    const r = ref(db, `payments/${uid}`);
    await set(r, data);
  }
};