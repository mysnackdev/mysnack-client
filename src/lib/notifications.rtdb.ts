"use client";
import { db, auth, messagingPromise } from "@/firebase";
import { getToken, onMessage, type Messaging } from "firebase/messaging";
import { ref, update, onValue, query, orderByChild, limitToLast, set, remove, push } from "firebase/database";

export type RTDBNotification = {
  id: string;
  title: string;
  body: string;
  createdAt: number;
  ts?: number;
  data?: Record<string, string>;
  read?: boolean;
  muted?: boolean;
}

export async function ensurePushPermissionAndToken(): Promise<string | null> {
  if (typeof window === "undefined") return null;
  if (!("Notification" in window)) return null;
  try {
    if ("serviceWorker" in navigator) {
      try { await navigator.serviceWorker.register("/firebase-messaging-sw.js"); } catch {}
    }
    const messaging: Messaging | null = await messagingPromise;
    const perm = await Notification.requestPermission();
    if (perm !== "granted" || !messaging) return null; // ← garante Messaging

    const token = await getToken(messaging, { vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY });
    const user = auth.currentUser;
    if (user && token) {
      await update(ref(db), { [`userTokens/${user.uid}/${token}`]: true });
    }
    return token || null;
  } catch {
    return null;
  }
}

export function subscribeNotifications(uid: string, cb: (list: RTDBNotification[]) => void) {
  const q = query(ref(db, `notifications/${uid}`), orderByChild("createdAt"), limitToLast(30));
  return onValue(q, snap => {
    const val = (snap.val() as Record<string, RTDBNotification>) || {};
    const arr = Object.values(val).sort(
      (a, b) => (b.createdAt || b.ts || 0) - (a.createdAt || a.ts || 0)
    );
    cb(arr);
  });
}

export async function markAsRead(uid: string, id: string) {
  await update(ref(db, `notifications/${uid}/${id}`), { read: true });
}

export async function clearAll(uid: string) {
  await remove(ref(db, `notifications/${uid}`));
}

export async function muteOrder(uid: string, orderId: string) {
  await set(ref(db, `notificationPrefs/${uid}/mutedOrders/${orderId}`), true);
}
export async function unmuteOrder(uid: string, orderId: string) {
  await remove(ref(db, `notificationPrefs/${uid}/mutedOrders/${orderId}`));
}

// Grava pushs recebidos em foreground dentro do RTDB para aparecer no sino
export async function bindForegroundPushToRTDB() {
  if (typeof window === "undefined") return;
  const messaging: Messaging | null = await messagingPromise;
  if (!messaging) return; // ← evita passar null

  onMessage(messaging, async (payload) => {
    const user = auth.currentUser;
    if (!user) return;
    const nRef = ref(db, `notifications/${user.uid}`);
    const newRef = push(nRef);
    await set(newRef, {
      id: newRef.key,
      title: payload.notification?.title || "Notificação",
      body: payload.notification?.body || "",
      createdAt: Date.now(),
      data: (payload.data || {}) as Record<string, string>,
      read: false,
    });
  });
}
