"use client";

import React, { useEffect, useState } from "react";
import OnboardingModal from "./OnboardingModal";

const KEY = "mysnack_onboarding_v1_done";

export default function OnboardingInitializer() {
  const [open, setOpen] = useState<boolean>(false);

  useEffect(() => {
    const already = typeof window !== "undefined" ? window.localStorage.getItem(KEY) === "1" : true;
    if (!already) {
      setOpen(true);
    }
    // Ouvir pedidos explícitos para abrir o tutorial (a partir da Central de Ajuda)
    const onOpen = () => setOpen(true);
    window.addEventListener("mysnack:open-tutorial", onOpen as EventListener);
    return () => {
      window.removeEventListener("mysnack:open-tutorial", onOpen as EventListener);
    };
  }, []);

  return (
    <OnboardingModal
      open={open}
      onClose={() => {
        try { window.localStorage.setItem(KEY, "1"); } catch {}
        setOpen(false);
      }}
    />
  );
}
