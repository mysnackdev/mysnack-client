"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHome, faListUl, faReceipt, faUser } from "@fortawesome/free-solid-svg-icons";

type CartItem = { qty?: number; quantity?: number };

const tabs = [
  { href: "/", label: "Início", icon: faHome },
  { href: "/categorias", label: "Busca", icon: faListUl },
  { href: "/pedidos", label: "Pedidos", icon: faReceipt },
  { href: "/perfil", label: "Perfil", icon: faUser },
];

function getCartCount(): number {
  try {
    const raw = localStorage.getItem("mysnack_cart");
    const arr = raw ? (JSON.parse(raw) as CartItem[]) : [];
    if (!Array.isArray(arr)) return 0;
    return arr.reduce((s, i) => s + (i?.qty ?? i?.quantity ?? 0), 0);
  } catch {
    return 0;
  }
}

export default function BottomNav() {
  const pathname = usePathname() || "/";
  const [cartCount, setCartCount] = React.useState<number>(0);

  React.useEffect(() => {
    const recalc = () => setCartCount(getCartCount());
    recalc(); // inicial

    // Atualiza quando outras partes do app modificarem o carrinho
    window.addEventListener("storage", recalc); // outras abas
    window.addEventListener("open-cart", recalc as EventListener); // já usado no app
    window.addEventListener("cart-updated", recalc as EventListener); // opcional

    return () => {
      window.removeEventListener("storage", recalc);
      window.removeEventListener("open-cart", recalc as EventListener);
      window.removeEventListener("cart-updated", recalc as EventListener);
    };
  }, []);

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t flex justify-around h-16 items-center z-50">
      {tabs.map((tab) => {
        const active = pathname === tab.href;
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={
              "relative flex flex-col items-center text-[12px] font-medium " +
              (active ? "text-gray-900" : "text-gray-600")
            }
          >
            <FontAwesomeIcon icon={tab.icon} className="h-5 w-5" />
            <span>{tab.label}</span>
            {tab.href === "/pedidos" && cartCount > 0 ? (
              <span className="absolute -top-1 -right-2 inline-flex items-center justify-center text-[10px] min-w-[16px] h-4 px-1 rounded-full bg-red-500 text-white">
                {cartCount}
              </span>
            ) : null}
          </Link>
        );
      })}
    </nav>
  );
}
