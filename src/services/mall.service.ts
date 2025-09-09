import { getDatabase, ref, get, child, set } from "firebase/database";

export type MallProfile = {
  id: string;
  name: string;
  displayName?: string;
  praça?: string;
  rating?: number;
  avgMins?: number;
};

const LOCAL_KEY = "mysnack.mallId";

export const MallService = {
  getSavedMallId(): string | null {
    if (typeof window === "undefined") return null;
    try { return localStorage.getItem(LOCAL_KEY); } catch { return null; }
  },
  saveMallId(id: string) {
    if (typeof window === "undefined") return;
    try { localStorage.setItem(LOCAL_KEY, id); } catch {}
  },
  clearMallId() {
    if (typeof window === "undefined") return;
    try { localStorage.removeItem(LOCAL_KEY); } catch {}
  },
  async getMallProfile(mallId: string) {
    const db = getDatabase();
    const snap = await get(child(ref(db), `backoffice/tenants/${mallId}/storeProfile`));
    const v = (snap.exists() ? snap.val() : {}) as Record<string, unknown>;
    return {
      id: mallId,
      name: (typeof v["name"] === "string" ? v["name"] : (typeof v["displayName"] === "string" ? v["displayName"] : "Praça de Alimentação")) as string,
      displayName: typeof v["displayName"] === "string" ? (v["displayName"] as string) : undefined,
      praça: typeof v["praca"] === "string" ? (v["praca"] as string) : (typeof v["address"] === "string" ? (v["address"] as string) : undefined),
      rating: typeof v["rating"] === "number" ? (v["rating"] as number) : 4.8,
      avgMins: typeof v["avgMins"] === "number" ? (v["avgMins"] as number) : 30,
    };
  },
  async saveUserMall(uid: string, mallId: string): Promise<void> {
    const db = getDatabase();
    await set(ref(db, `users/${uid}/currentMall`), { mallId, updatedAt: Date.now() });
  },
};
