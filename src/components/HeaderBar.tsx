"use client";
import React from "react";
import Image from "next/image";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBell, faShoppingCart, faArrowUpRightFromSquare } from "@fortawesome/free-solid-svg-icons";
import { useNotifications } from "@/hooks";
import CartDrawer from "./cart-drawer";

type CartItem = { qty?: number; quantity?: number; price?: number };

function getCartCount(): number {
  try {
    if (typeof window === "undefined") return 0;
    const raw = localStorage.getItem("mysnack_cart");
    const arr = raw ? (JSON.parse(raw) as CartItem[]) : [];
    if (!Array.isArray(arr)) return 0;
    return arr.reduce((s, i) => s + (i?.qty ?? i?.quantity ?? 0), 0);
  } catch {
    return 0;
  }
}

export default function HeaderBar() {
  const [open, setOpen] = React.useState(false);
  const [cartCount, setCartCount] = React.useState<number>(0);
  const { items } = useNotifications();

  // Abre o carrinho quando o app dispara o evento global "open-cart"
  React.useEffect(() => {
    const openHandler = () => setOpen(true);
    if (typeof window !== "undefined") {
      window.addEventListener("open-cart", openHandler as EventListener);
    }
    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("open-cart", openHandler as EventListener);
      }
    };
  }, []);

  // Mantém o badge do carrinho em dia via localStorage + eventos
  React.useEffect(() => {
    const recalc = () => setCartCount(getCartCount());
    recalc(); // inicial
    if (typeof window === "undefined") return;

    window.addEventListener("storage", recalc); // mudanças em outras abas
    window.addEventListener("cart-updated", recalc as EventListener); // evento customizado do app
    // quando o drawer abre/fecha, reconta (útil se o drawer altera o carrinho)
    const syncOnOpen = () => recalc();
    window.addEventListener("open-cart", syncOnOpen as EventListener);

    return () => {
      window.removeEventListener("storage", recalc);
      window.removeEventListener("cart-updated", recalc as EventListener);
      window.removeEventListener("open-cart", syncOnOpen as EventListener);
    };
  }, [open]);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b shadow-sm">
      <div className="max-w-[1200px] mx-auto px-4 h-16 flex items-center gap-3">
        <Link href="/" className="flex items-center gap-3">
          <Image src="/icon.png" alt="MySnack" width={32} height={32} className="rounded" />
          <span className="font-extrabold tracking-tight text-[20px] md:text-[22px] text-gray-900">
            MySnack
          </span>
        </Link>

        <div className="ml-auto flex items-center gap-2">
          <a
            href="https://mysnack-backoffice-6fb29.web.app"
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1.5 rounded-full border bg-white hover:bg-gray-50 text-sm flex items-center gap-2 shadow-sm"
            aria-label="Área do Parceiro"
          >
            Parceiro
            <FontAwesomeIcon icon={faArrowUpRightFromSquare} className="w-3 h-3 opacity-70" />
          </a>

          <button
            type="button"
            onClick={() => setOpen(true)}
            className="relative p-2 rounded-full hover:bg-gray-100"
            aria-label="Abrir carrinho"
            title="Seu carrinho"
          >
            <FontAwesomeIcon icon={faShoppingCart} className="w-5 h-5" />
            {cartCount > 0 ? (
              <span className="absolute -top-0.5 -right-0.5 inline-flex items-center justify-center text-[10px] min-w-[16px] h-4 px-1 rounded-full bg-red-500 text-white">
                {cartCount}
              </span>
            ) : null}
          </button>

          <Link
            href="/perfil/notificacoes"
            className="relative p-2 rounded-full hover:bg-gray-100"
            aria-label="Notificações"
            title="Notificações"
          >
            <FontAwesomeIcon icon={faBell} className="w-5 h-5" />
            {items?.length ? (
              <span className="absolute -top-0.5 -right-0.5 inline-flex items-center justify-center text-[10px] min-w-[16px] h-4 px-1 rounded-full bg-red-500 text-white">
                {items.length}
              </span>
            ) : null}
          </Link>
        </div>
      </div>

      <CartDrawer open={open} onClose={() => setOpen(false)} />
    </header>
  );
}
