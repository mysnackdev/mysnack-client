"use client";

import Link from "next/link";
import { Home, Search, FileText, User as UserIcon } from "lucide-react";
import { usePathname } from "next/navigation";
import React from "react";

type Tab = 'inicio' | 'busca' | 'orders' | 'perfil';
export default function BottomNav({ active }: { active?: Tab }) {
  const pathname = usePathname();

  const forced = active;
  const isActive = (tab: Tab, fallback: boolean) => (forced ? forced === tab : fallback);


  const item = (
    href: string,
    label: string,
    icon: React.ReactNode,
    active: boolean,
  ) => (
    <Link
      href={href}
      className={`flex flex-col items-center justify-center gap-1 py-2 text-xs ${
        active ? "font-semibold text-black" : "text-muted-foreground"
      }`}
      aria-current={active ? "page" : undefined}
    >
      {icon}
      {label}
    </Link>
  );

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40">
      <div className="mx-auto max-w-5xl px-4">
        <div className="grid grid-cols-4 rounded-t-2xl border bg-white shadow-lg">
          {item("/", "Início", <Home className="h-5 w-5" />, pathname === "/")}
          {item(
            "/busca",
            "Busca",
            <Search className="h-5 w-5" />,
            isActive('busca', pathname?.startsWith("/busca") || false),
          )}
          {item(
            "/orders",
            "Pedidos",
            <FileText className="h-5 w-5" />,
            isActive('orders', pathname?.startsWith("/orders") || false),
          )}
          {item(
            "/perfil",
            "Perfil",
            <UserIcon className="h-5 w-5" />,
            isActive('perfil', pathname?.startsWith("/perfil") || false),
          )}
        </div>
      </div>
    </nav>
  );
}
