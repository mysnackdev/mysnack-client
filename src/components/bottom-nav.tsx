"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, FileText, User } from "lucide-react";

type Tab = "inicio" | "busca" | "orders" | "perfil";

export default function BottomNav({ active }: { active?: Tab }) {
  const pathname = usePathname();

  // Deduz a aba ativa pela rota, caso a prop não seja passada
  const inferred: Tab = React.useMemo(() => {
    switch (pathname) {
      case "/":
        return "inicio";
      case "/busca":
        return "busca";
      case "/orders":
        return "orders";
      case "/perfil":
        return "perfil";
      default:
        return "inicio";
    }
  }, [pathname]);

  const current = active ?? inferred;

  const base =
    "flex flex-col items-center justify-center gap-1 text-xs flex-1 py-2";
  const inactive = "text-muted-foreground";
  const activeCls = "text-rose-500 font-semibold";

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40">
      <div className="mx-auto max-w-5xl px-4 pb-safe">
        <div className="rounded-t-2xl border bg-white shadow-lg grid grid-cols-4">
          <Link href="/" className={`${base} ${current === "inicio" ? activeCls : inactive}`}>
            <Home className="w-5 h-5" />
            Início
          </Link>
          <Link href="/busca" className={`${base} ${current === "busca" ? activeCls : inactive}`}>
            <Search className="w-5 h-5" />
            Busca
          </Link>
          <Link href="/orders" className={`${base} ${current === "orders" ? activeCls : inactive}`}>
            <FileText className="w-5 h-5" />
            Orders
          </Link>
          <Link href="/perfil" className={`${base} ${current === "perfil" ? activeCls : inactive}`}>
            <User className="w-5 h-5" />
            Perfil
          </Link>
        </div>
      </div>
    </nav>
  );
}
