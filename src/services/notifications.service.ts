import { db } from "../firebase";
import { ref, onValue, push, set, remove, type Unsubscribe } from "firebase/database";

export type NotificationItem = {
  id?: string;
  title: string;
  body?: string;
  createdAt: number;
  read?: boolean;
};

type NotificationRow = Omit<NotificationItem, "id">;          // como vem do RTDB
type NotificationMap = Record<string, NotificationRow>;        // { [id]: row }

export const NotificationsService = {
  subscribe(uid: string, cb: (items: NotificationItem[]) => void): Unsubscribe {
    const r = ref(db, `notifications/${uid}`);
    return onValue(r, (snap) => {
      if (!snap.exists()) { cb([]); return; }

      const raw = (snap.val() ?? {}) as NotificationMap;

      const items: NotificationItem[] = Object.entries(raw)
        .map(([id, v]) => ({
          ...v,
          id,                                             // garante que a chave do RTDB vença
          createdAt: Number(v.createdAt) || 0,
          read: v.read ?? false,
        }))
        .sort((a, b) => b.createdAt - a.createdAt);

      cb(items);
    });
  },

  async add(uid: string, item: NotificationRow) {
    const r = ref(db, `notifications/${uid}`);
    const k = push(r);
    await set(k, item);
    return k.key; // opcional: retorna o id criado
  },

  async remove(uid: string, id: string): Promise<void> {
    const r = ref(db, `notifications/${uid}/${id}`);
    await remove(r);
  },
};
