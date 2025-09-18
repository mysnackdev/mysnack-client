import { useEffect, useState } from "react";
import { ConversationsService, type Conversation } from "@/services/conversations.service";
import { useAuth } from "@/hooks";

export const useConversations = () => {
  const { user } = useAuth();
  const [items, setItems] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.userId) { setItems([]); setLoading(false); return; }
    setLoading(true);
    const unsub = ConversationsService.subscribe(user.uid, (x) => { setItems(x); setLoading(false); });
    return () => unsub && unsub();
  }, [user?.userId]);

  return { items, loading };
};