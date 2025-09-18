import { useEffect, useState } from "react";
import { NotificationsService, type NotificationItem } from "@/services/notifications.service";
import { useAuth } from "@/hooks";

export const useNotifications = () => {
  const { user } = useAuth();
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.userId) { setItems([]); setLoading(false); return; }
    setLoading(true);
    const unsub = NotificationsService.subscribe(user.uid, (x) => { setItems(x); setLoading(false); });
    return () => unsub && unsub();
  }, [user?.userId]);

  return { items, loading };
};