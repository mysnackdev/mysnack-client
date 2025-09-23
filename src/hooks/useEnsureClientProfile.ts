// src/hooks/useEnsureClientProfile.ts
"use client";

import { useEffect } from "react";
import { getAuth, onAuthStateChanged, User } from "firebase/auth";
import { getDatabase, ref, get, set, update } from "firebase/database";

type MinimalProfile = {
  uid: string;
  displayName?: string | null;
  email?: string | null;
  phone?: string | null;
  updatedAt: number;
};

/**
 * Garante que exista um perfil do cliente em /client/profiles/{uid}
 * (utilizado pelo backoffice para mostrar nome/e-mail/telefone no pedido).
 */
export function useEnsureClientProfile() {
  useEffect(() => {
    const auth = getAuth();
    const db = getDatabase();
    const unsub = onAuthStateChanged(auth, async (u: User | null) => {
      if (!u?.uid) return;
      const r = ref(db, `/client/profiles/${u.uid}`);
      const snap = await get(r);
      const payload: MinimalProfile = {
        uid: u.uid,
        displayName: u.displayName ?? null,
        email: u.email ?? null,
        phone: u.phoneNumber ?? null,
        updatedAt: Date.now()
      };
      if (!snap.exists()) {
        await set(r, payload);
      } else {
        await update(r, payload);
      }
    });
    return () => unsub();
  }, []);
}
