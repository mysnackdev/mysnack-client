// src/hooks/useEnsureClientProfile.ts
"use client";

import { useEffect } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getDatabase, ref, get, set, update } from "firebase/database";

type MinimalProfile = {
  uid: string;
  displayName?: string | null;
  email?: string | null;
  phone?: string | null;
  updatedAt: number;
};

/**
 * Garante que o nó client/profiles/{uid} exista e esteja atualizado.
 * Não lança erros para não quebrar a UI; apenas loga no console.
 */
export function useEnsureClientProfile() {
  useEffect(() => {
    const auth = getAuth();
    const db = getDatabase();

    const unsub = onAuthStateChanged(auth, async (u) => {
      if (!u) return;
      try {
        const r = ref(db, `client/profiles/${u.uid}`);
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
      } catch (e) {
        // Evita interromper a renderização.
        console.error("[useEnsureClientProfile] upsertClientProfile error", e);
      }
    });

    return () => unsub();
  }, []);
}
