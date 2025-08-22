import { db } from "../firebase";
import { ref, onValue, push, set, type Unsubscribe } from "firebase/database";

export type Conversation = {
  id?: string;
  title: string;
  lastMessage?: string;
  updatedAt: number;
};

type ConversationRow = Omit<Conversation, "id">;             // como vem do RTDB
type ConversationMap = Record<string, ConversationRow>;       // { [id]: row }

export const ConversationsService = {
  subscribe(uid: string, cb: (items: Conversation[]) => void): Unsubscribe {
    const r = ref(db, `conversas/${uid}`);
    return onValue(r, (snap) => {
      const raw = (snap.val() ?? {}) as ConversationMap;

      const items: Conversation[] = Object.entries(raw)
        .map(([id, v]) => ({ id, ...v }))
        .sort((a, b) => (b.updatedAt ?? 0) - (a.updatedAt ?? 0));

      cb(items);
    });
  },

  async add(uid: string, item: ConversationRow) {
    const r = ref(db, `conversas/${uid}`);
    const k = push(r);
    await set(k, item);
  },
};
