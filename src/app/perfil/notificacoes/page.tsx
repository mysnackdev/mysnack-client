"use client";
import React, { useEffect } from "react";
import { useNotificationsRTDB } from "@/hooks/useNotificationsRTDB";
import Link from "next/link";

import { useAuth } from "@/hooks";
import { useNotifications } from "@/hooks";
import { SkeletonList } from "@/components/skeletons";

function Main() {
  const { user } = useAuth();
  const { items, loading } = useNotifications();

  // Zera badge/contagem ao entrar na tela de notificações
  const { markAllAsRead } = useNotificationsRTDB();
  useEffect(() => { markAllAsRead(); }, [markAllAsRead]);

  if (!user) {
    return (
      <main className="max-w-5xl mx-auto px-4">
        <header className="py-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">Notificações</h1>
            <p className="muted">Sua central de notificações.</p>
          </div>
          <Link href="/perfil" className="btn-ghost">Voltar</Link>
        </header>
        <div className="card-lg">Entre no MySnack para ver suas notificações.</div>
      </main>
    );
  }

  return (
    <main className="max-w-5xl mx-auto px-4">
      <header className="py-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Notificações</h1>
          <p className="muted">Sua central de notificações.</p>
        </div>
        <Link href="/perfil" className="btn-ghost">Voltar</Link>
      </header>

      {loading ? (
        <SkeletonList />
      ) : items.length ? (
        <div className="card-lg divide-y">
          {items.map((n) => (
            <div key={n.id} className="py-3">
              <p className="font-semibold">{n.title}</p>
              <p className="muted text-sm">{n.body || "—"}</p>
              {/* usa apenas createdAt; 'ts' não existe em NotificationItem */}
              <p className="muted text-xs mt-1">
                {new Date(n.createdAt).toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <div className="card-lg">Sem notificações por aqui.</div>
      )}
    </main>
  );
}

export default function Page() {
  return <Main />;
}
