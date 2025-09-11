"use client";
import { db } from "@/firebase";
import { ref, push, set } from "firebase/database";

export type NotificationPayload = {
  title: string;
  body?: string;
  data?: Record<string, unknown>;
};

export async function addNotificationRTDB(uid: string, payload: NotificationPayload): Promise<string | null> {
  try {
    const nRef = ref(db, `notifications/${uid}`);
    const k = push(nRef);
    await set(k, {
      id: k.key,
      title: payload.title,
      body: payload.body ?? "",
      data: payload.data ?? {},
      createdAt: Date.now(),
      read: false,
    });
    return k.key;
  } catch {
    return null;
  }
}
