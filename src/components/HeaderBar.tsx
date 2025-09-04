"use client";

import Link from "next/link";
import Image from "next/image";
import React from "react";
import { ShoppingCart, Bell } from "lucide-react";

export interface HeaderBarProps {
  title?: string;
  /** Substitui os botões à direita; quando omitido, mostra padrão (Parceiro, carrinho, sino) */
  rightSlot?: React.ReactNode;
}

export default function HeaderBar({ title, rightSlot }: HeaderBarProps) {
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
          {/* 
            - Mantemos um width/height grande (para retina) e deixamos a classe controlar o tamanho visível.
            - h-[clamp(32px,8vw,72px)]: mínimo 32px, cresce com viewport (8vw), máximo 72px.
          */}
          <Image
            src="/logo.svg"
            alt="MySnack"
            width={256}
            height={256}
            priority
            className="h-[clamp(32px,8vw,72px)] w-auto shrink-0"
          />
          {/* Opcional: título acompanha o crescimento do logo, sem exagerar */}
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
            <button
              type="button"
              aria-label="Notificações"
              className="rounded-full p-2 hover:bg-black/5"
            >
              <Bell className="h-5 w-5" />
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
