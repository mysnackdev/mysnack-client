
"use client";

import Link from "next/link";
import Image from "next/image";
import React, { useState, useMemo } from "react";
import { useNotificationsRTDB } from "@/hooks/useNotificationsRTDB";
import { ShoppingCart, Bell } from "lucide-react";
import NotificationsModal from "@/components/NotificationsModal";
import type { RTDBNotification } from "@/lib/notifications.rtdb";

/** Props do Header. */
export interface HeaderBarProps {
  title?: string;
  /** Substitui os botões à direita; quando omitido, mostra padrão (Parceiro, carrinho, sino) */
  rightSlot?: React.ReactNode;
}

export default function HeaderBar({ title, rightSlot }: HeaderBarProps) {
  // Pega as notificações e calcula o badge de modo defensivo
  const { items = [], unreadCount = 0 } = useNotificationsRTDB() ?? {} as { items: RTDBNotification[]; unreadCount: number };
  const [openNotifications, setOpenNotifications] = useState(false);

  const badge = useMemo(() => {
    // se o provider expõe unreadCount confiável, usa; senão calcula localmente
    const local = Array.isArray(items) ? items.filter((n) => !n?.read).length : 0;
    const n = Number.isFinite(unreadCount) && unreadCount > 0 ? unreadCount : local;
    return Math.min(99, n || 0);
  }, [items, unreadCount]);

  const openCart = (): void => {
    try {
      window.dispatchEvent(new Event("open-cart"));
    } catch {
      /* noop */
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-white/90 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 border-b px-4 py-3">
        <Link href="/" aria-label="Página inicial" className="flex items-center gap-3">
          <Image src="/logo.png" alt="MySnack" width={28} height={28} className="rounded-lg" />
          <span className="font-semibold tracking-tight">MySnack</span>
        </Link>

        {title && <div className="text-sm text-zinc-500">{title}</div>}

        <div className="flex items-center gap-3">
          {rightSlot ?? (
            <>
              <Link
                href="/partner"
                className="hidden sm:inline-flex rounded-full border px-3 py-1.5 text-sm hover:bg-black/5"
              >
                Parceiro
              </Link>

              <button
                aria-label="Abrir carrinho"
                onClick={openCart}
                className="relative grid h-9 w-9 place-items-center rounded-full hover:bg-black/5"
              >
                <ShoppingCart size={20} />
              </button>

              <button
                aria-label="Abrir notificações"
                onClick={() => setOpenNotifications(true)}
                className="relative grid h-9 w-9 place-items-center rounded-full hover:bg-black/5"
              >
                <Bell size={20} />
                {badge > 0 && (
                  <span
                    className="absolute -right-1 -top-1 min-w-[18px] h-[18px] rounded-full bg-pink-500 px-[5px] text-[11px] font-bold leading-[18px] text-white text-center shadow"
                    aria-label={`${badge} notificações não lidas`}
                  >
                    {badge}
                  </span>
                )}
              </button>
            </>
          )}
        </div>
      </div>

      <NotificationsModal
        open={openNotifications}
        onClose={() => setOpenNotifications(false)}
      />
    </header>
  );
}
