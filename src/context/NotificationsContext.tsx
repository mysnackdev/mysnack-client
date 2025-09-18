"use client";
import React, { createContext, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/firebase";
import {
  ensurePushPermissionAndToken,
  subscribeNotifications,
  markAsRead as rtdbMarkAsRead, clearAll,
  muteOrder, unmuteOrder,
  bindForegroundPushToRTDB,
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
  activate: async () => {}, markRead: async () => {}, markAllAsRead: async () => {},
  mute: async () => {}, unmute: async () => {}, clear: async () => {},
});

export function NotificationsProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<RTDBNotification[]>([]);
  const [enabled, setEnabled] = useState(false);
  const [uid, setUid] = useState<string | null>(auth.currentUser?.userId || null);
  const subRef = useRef<null | (() => void)>(null);

  // track auth
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUid(u?.userId || null));
    return () => unsub();
  }, []);

  // subscribe RTDB for this uid
  useEffect(() => {
    if (subRef.current) { subRef.current(); subRef.current = null; }
    setItems([]);
    if (!uid) return;
    subRef.current = subscribeNotifications(uid, setItems);
    return () => { if (subRef.current) { subRef.current(); subRef.current = null; } };
  }, [uid]);

  // register push + foreground binding (once)
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const token = await ensurePushPermissionAndToken();
      if (token && !cancelled) setEnabled(true);
      await bindForegroundPushToRTDB();
    })();
    return () => { cancelled = true; };
  }, []);

  const unreadCount = useMemo(() => items.filter(i => !i.read).length, [items]);

  const activate = useCallback(async () => {
    const token = await ensurePushPermissionAndToken();
    setEnabled(!!token);
  }, []);

  const markRead = useCallback(async (id: string) => {
    if (!uid) return;
    // otimista
    setItems(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    await rtdbMarkAsRead(uid, id);
  }, [uid]);

  const markAllAsRead = useCallback(async () => {
    if (!uid) return;
    // otimista
    setItems(prev => prev.map(n => ({ ...n, read: true })));
    // assíncrono
    const pending = items.filter(n => !n.read);
    await Promise.all(pending.map(n => rtdbMarkAsRead(uid, n.id)));
  }, [uid, items]);

  const mute = useCallback(async (orderId: string) => { if (uid) await muteOrder(uid, orderId); }, [uid]);
  const unmute = useCallback(async (orderId: string) => { if (uid) await unmuteOrder(uid, orderId); }, [uid]);
  const clear = useCallback(async () => { if (uid) await clearAll(uid); }, [uid]);

  const value: Ctx = { items, unreadCount, enabled, activate, markRead, markAllAsRead, mute, unmute, clear };
  return <NotificationsContext.Provider value={value}>{children}</NotificationsContext.Provider>;
}
