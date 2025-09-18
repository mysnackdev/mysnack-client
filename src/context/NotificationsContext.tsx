/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";
import React, { createContext, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { onValue, ref } from "firebase/database";
import { auth, db } from "@/firebase";
import {
  ensurePushPermissionAndToken,
  subscribeNotifications,
  markAsRead as rtdbMarkAsRead, clearAll,
  muteOrder, unmuteOrder,
  bindForegroundPushToRTDB,
  markAllAsReadServer,
  type RTDBNotification
} from "@/lib/notifications.rtdb";

type Ctx = {
  items: RTDBNotification[];
  unreadCount: number;
  enabled: boolean;
  activate: () => Promise<void>;
  markRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  mute: (orderId: string) => Promise<void>;
  unmute: (orderId: string) => Promise<void>;
  clear: () => Promise<void>;
};

export const NotificationsContext = createContext<Ctx>({
  items: [], unreadCount: 0, enabled: false,
  activate: async () => {}, markRead: async () => {},
  markAllAsRead: async () => {}, mute: async () => {}, unmute: async () => {}, clear: async () => {}
});

export function NotificationsProvider({ children }: { children: React.ReactNode }) {
  const [uid, setUid] = useState<string | null>(null);
  const [items, setItems] = useState<RTDBNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [enabled, setEnabled] = useState(false);
  const unsubRef = useRef<null | (() => void)>(null);

  useEffect(() => {
    const off = onAuthStateChanged(auth, (u) => {
      setUid(u?.uid ?? null);
    });
    return () => off();
  }, []);

  // subscribe list
  useEffect(() => {
    if (!uid) { setItems([]); setUnreadCount(0); if (unsubRef.current) { unsubRef.current(); unsubRef.current = null; } return; }
    if (unsubRef.current) { unsubRef.current(); unsubRef.current = null; }
    unsubRef.current = subscribeNotifications(uid, (list) => {
      setItems(list);
    });
    // counter via RTDB
    const r = ref(db, `/userCounters/${uid}/notificationsUnread`);
    const offCounter = onValue(r, (snap) => setUnreadCount(Number(snap.val() || 0)));
    return () => { if (unsubRef.current) unsubRef.current(); offCounter(); };
  }, [uid]);

  const activate = useCallback(async () => {
    const token = await ensurePushPermissionAndToken();
    setEnabled(!!token);
  }, []);

  const markRead = useCallback(async (id: string) => {
    if (!uid) return;
    await rtdbMarkAsRead(uid, id);
  }, [uid]);

  const markAllAsRead = useCallback(async () => {
    if (!uid) return;
    await markAllAsReadServer();
    setItems(prev => prev.map(n => ({ ...n, read: true })));
  }, [uid]);

  const mute = useCallback(async (orderId: string) => { if (uid) await muteOrder(uid, orderId); }, [uid]);
  const unmute = useCallback(async (orderId: string) => { if (uid) await unmuteOrder(uid, orderId); }, [uid]);
  const clear = useCallback(async () => { if (uid) await clearAll(uid); }, [uid]);

  const value: Ctx = useMemo(() => ({
    items, unreadCount, enabled, activate, markRead, markAllAsRead, mute, unmute, clear
  }), [items, unreadCount, enabled, activate, markRead, markAllAsRead, mute, unmute, clear]);

  return <NotificationsContext.Provider value={value}>{children}</NotificationsContext.Provider>;
}
