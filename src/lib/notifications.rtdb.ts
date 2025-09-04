"use client";

import { db, auth, messagingPromise } from "@/firebase";
import { getToken, onMessage } from "firebase/messaging";
import {
  ref,
  update,
  onValue,
  query,
  orderByChild,
  limitToLast,
  set,
  remove,
  push,
} from "firebase/database";

const VAPID = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY || "";

export async function ensurePushPermissionAndToken(): Promise<string | null> {
  if (typeof window === "undefined") return null; // SSR guard
  if (!("Notification" in window)) return null;

  try {
    // registra o SW (ignora erro silenciosamente)
    if ("serviceWorker" in navigator) {
      try {
        await navigator.serviceWorker.register("/firebase-messaging-sw.js");
      } catch {
        /* noop */
      }
    }

    const messaging = await messagingPromise;
    if (!messaging) return null;

    const perm = await Notification.requestPermission();
    if (perm !== "granted") return null;

    const swReg = await navigator.serviceWorker.getRegistration().catch(() => undefined);

    const token = await getToken(messaging, {
      vapidKey: VAPID,
      serviceWorkerRegistration: swReg,
    });

    const user = auth.currentUser;
    if (user && token) {
      await update(ref(db), { [`userTokens/${user.uid}/${token}`]: true });
    }
    return token || null;
  } catch {
    return null;
  }
}

export type RTDBNotification = {
  id: string;
  title: string;
  body: string;
  ts: number;
  data?: Record<string, string>;
  read?: boolean;
  muted?: boolean;
};

export function subscribeNotifications(
  uid: string,
  cb: (list: RTDBNotification[]) => void,
) {
  const q = query(ref(db, `notifications/${uid}`), orderByChild("ts"), limitToLast(30));
  return onValue(q, (snap) => {
    const val = (snap.val() as Record<string, RTDBNotification>) || {};
    const arr = Object.values(val).sort((a, b) => (b.ts || 0) - (a.ts || 0));
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

export async function bindForegroundPushToRTDB() {
  if (typeof window === "undefined") return; // SSR guard
  const messaging = await messagingPromise;
  if (!messaging) return;

  onMessage(messaging, async (payload) => {
    const user = auth.currentUser;
    if (!user) return;

    const nRef = ref(db, `notifications/${user.uid}`);
    const newRef = push(nRef);
    await set(newRef, {
      id: newRef.key,
      title: payload.notification?.title || "Notificação",
      body: payload.notification?.body || "",
      ts: Date.now(),
      data: payload.data || {},
      read: false,
    });
  });
}
