"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import { auth } from "@/firebase";
import {
  ensurePushPermissionAndToken,
  subscribeNotifications,
  markAsRead, clearAll,
  muteOrder, unmuteOrder,
  bindForegroundPushToRTDB,
  type RTDBNotification
} from "@/lib/notifications.rtdb";

export function useNotificationsRTDB() {
  const [items, setItems] = useState<RTDBNotification[]>([]);
  const [enabled, setEnabled] = useState(false);
  const uid = auth.currentUser?.uid || null;

  useEffect(() => {
    bindForegroundPushToRTDB();
  }, []);

  useEffect(() => {
    if (!uid) return;
    const unsub = subscribeNotifications(uid, setItems);
    return () => unsub();
  }, [uid]);

  const unreadCount = useMemo(() => items.filter(i => !i.read).length, [items]);

  const activate = useCallback(async () => {
    const tok = await ensurePushPermissionAndToken();
    setEnabled(!!tok);
  }, []);

  const markRead = useCallback(async (id: string) => {
    if (!uid) return;
    await markAsRead(uid, id);
  }, [uid]);

  const mute = useCallback(async (orderId: string) => {
    if (!uid) return;
    await muteOrder(uid, orderId);
  }, [uid]);

  const unmute = useCallback(async (orderId: string) => {
    if (!uid) return;
    await unmuteOrder(uid, orderId);
  }, [uid]);

  const clear = useCallback(async () => {
    if (!uid) return;
    await clearAll(uid);
  }, [uid]);

  return { items, unreadCount, enabled, activate, markRead, mute, unmute, clear };
}
