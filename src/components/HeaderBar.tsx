"use client";

import Link from "next/link";
import Image from "next/image";
import React, { useState } from "react";
import { useNotificationsRTDB } from "@/hooks/useNotificationsRTDB";
import { ShoppingCart, Bell } from "lucide-react";
import NotificationsModal from "@/components/NotificationsModal";

export interface HeaderBarProps {
  title?: string;
  /** Substitui os botões à direita; quando omitido, mostra padrão (Parceiro, carrinho, sino) */
  rightSlot?: React.ReactNode;
}

export default function HeaderBar({ title, rightSlot }: HeaderBarProps) {
  const { unreadCount, markAllAsRead } = useNotificationsRTDB();
  const [openNotifications, setOpenNotifications] = useState(false);

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
          <Image
            src="/logo.svg"
            alt="MySnack"
            width={256}
            height={256}
            priority
            className="h-[clamp(32px,8vw,72px)] w-auto shrink-0"
          />
          <span className="font-semibold leading-none text-[clamp(16px,2.4vw,24px)]">
            MySnack
          </span>
        </Link>

        {title ? <h1 className="text-base font-medium">{title}</h1> : <div />}

        {rightSlot ?? (
          <div className="flex items-center gap-2">
            <button
              type="button"
              aria-label="Carrinho"
              className="rounded-full p-2 hover:bg-black/5"
              onClick={openCart}
            >
              <ShoppingCart className="h-5 w-5" />
            </button>

            <div className="relative">
              <button
                type="button"
                aria-label="Notificações"
                className="rounded-full p-2 hover:bg-black/5"
                onClick={() => {
                  markAllAsRead();      // zera a badge de forma otimista
                  setOpenNotifications(true);
                }}
              >
                <Bell className="h-5 w-5" />
              </button>

              {unreadCount > 0 && (
                <span
                  className="absolute -top-0.5 -right-0.5 h-[18px] px-1.5 rounded-full bg-pink-600 text-white text-[10px] leading-[18px] text-center whitespace-nowrap"
                  aria-label={`${unreadCount} notificações não lidas`}
                >
                  {unreadCount}
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      <NotificationsModal
        open={openNotifications}
        onClose={() => setOpenNotifications(false)}
      />
    </header>
  );
}
