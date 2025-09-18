"use client";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { MallService, type MallProfile } from "@/services/mall.service";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/firebase";

export type MallState = {
  mallId: string | null;
  profile: MallProfile | null;
  setMallById: (id: string) => Promise<void>;
  clearMall: () => void;
};

const Ctx = createContext<MallState | null>(null);

export function MallProvider({ children }: { children: React.ReactNode }) {
  const [mallId, setMallId] = useState<string | null>(null);
  const [profile, setProfile] = useState<MallProfile | null>(null);

  useEffect(() => {
    const saved = MallService.getSavedMallId();
    if (saved) {
      setMallId(saved);
      MallService.getMallProfile(saved).then(setProfile).catch(() => setProfile(null));
    }
  }, []);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      if (u && mallId) MallService.saveUserMall(u.userId, mallId).catch(() => {});
    });
    return () => unsub();
  }, [mallId]);

  const setMallById = useCallback(async (id: string) => {
    setMallId(id);
    MallService.saveMallId(id);
    const p = await MallService.getMallProfile(id);
    setProfile(p);
    const u = auth.currentUser;
    if (u) MallService.saveUserMall(u.userId, id).catch(() => {});
  }, []);

  const clearMall = useCallback(() => {
    setMallId(null);
    setProfile(null);
    MallService.clearMallId();
  }, []);

  const value = useMemo<MallState>(() => ({ mallId, profile, setMallById, clearMall }), [mallId, profile, setMallById, clearMall]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useMall() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useMall must be used within MallProvider");
  return ctx;
}
