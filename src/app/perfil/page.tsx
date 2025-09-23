"use client";

import React from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { ChevronRight, Bell, User2, CreditCard } from "lucide-react";
import LoginForm from "@/components/login-form";
import { useAuth } from "@/hooks/useAuth";

const BottomNav = dynamic(() => import("@/components/bottom-nav"), { ssr: false });

function Row({ href = "#", title, description, right }: {
  href?: string; title: string; description?: string; right?: React.ReactNode;
}) {
  const cls = "flex items-center justify-between p-4 rounded-xl border bg-white";
  return (
    <Link href={href} className={cls}>
      <div>
        <div className="font-medium">{title}</div>
        {description && <div className="text-sm text-muted-foreground">{description}</div>}
      </div>
      <div className="flex items-center gap-2">
        {right}
        <ChevronRight className="w-5 h-5 text-muted-foreground" />
      </div>
    </Link>
  );
}

export default function PerfilPage() {
  const { user, loading, logout } = useAuth();

  if (loading) {
    return (
      <main className="max-w-2xl mx-auto px-4 py-8 pb-24">
        <div className="h-10 w-1/3 rounded bg-gray-200 animate-pulse mb-4" />
        <div className="space-y-3">
          <div className="h-16 rounded-xl bg-gray-200 animate-pulse" />
          <div className="h-16 rounded-xl bg-gray-200 animate-pulse" />
          <div className="h-16 rounded-xl bg-gray-200 animate-pulse" />
        </div>
        <BottomNav active="perfil" />
      </main>
    );
  }

  if (!user) {
    return (
      <main className="max-w-2xl mx-auto px-4 py-8 pb-24">
        <h1 className="text-2xl font-semibold mb-1">Perfil</h1>
        <p className="opacity-70 mb-6 text-sm">Entre para acessar histórico de pedidos e conversas.</p>
        <div className="bg-white rounded-2xl shadow-sm border p-5">
          <LoginForm />
        </div>
        <BottomNav active="perfil" />
      </main>
    );
  }

  const display = (user.displayName || user.email || "").split("@")[0];
  const displayUpper = display.toUpperCase();

  return (
    <main className="max-w-2xl mx-auto px-4 py-6 pb-24">
      <header className="px-1 pt-2">
        <h1 className="text-3xl font-bold tracking-wide">{displayUpper}</h1>
      </header>

      {/* Lista enxuta de opções */}
      <section className="mt-6 space-y-3">
        <Row
          href="/perfil/notificacoes"
          title="Notificações"
          description="Minha central de notificações"
          right={<Bell className="w-4 h-4" />}
        />
        <Row
          href="/account"
          title="Dados da conta"
          description="Minhas informações da conta"
          right={<User2 className="w-4 h-4" />}
        />
        <Row
          href="/payments"
          title="Pagamentos"
          description="Meus métodos de pagamento"
          right={<CreditCard className="w-4 h-4" />}
        />
      </section>

      <div className="mt-8 flex justify-center">
        <button onClick={logout} className="text-sm text-muted-foreground underline">Sair</button>
      </div>

      <BottomNav active="perfil" />
    </main>
  );
}
