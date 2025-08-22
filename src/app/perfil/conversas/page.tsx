"use client";
import React from "react";
import Link from "next/link";

import { useAuth } from "@/hooks";
import { useConversations } from "@/hooks";
import { SkeletonList } from "@/components/skeletons";

function Main(){
  const { user } = useAuth();
  const { items, loading } = useConversations();

  if (!user) {
    return (
      <main className="max-w-5xl mx-auto px-4">
        <header className="py-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">Conversas</h1>
            <p className="muted">Seu histórico de conversas.</p>
          </div>
          <Link href="/perfil" className="btn-ghost">Voltar</Link>
        </header>
        <div className="card-lg">Entre no MySnack para ver suas conversas.</div>
      </main>
    );
  }

  return (
    <main className="max-w-5xl mx-auto px-4">
      <header className="py-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Conversas</h1>
          <p className="muted">Seu histórico de conversas.</p>
        </div>
        <Link href="/perfil" className="btn-ghost">Voltar</Link>
      </header>

      {loading ? (
        <SkeletonList />
      ) : items.length ? (
        <div className="card-lg divide-y">
          {items.map((c) => (
            <div key={c.id} className="py-3">
              <p className="font-semibold">{c.title}</p>
              <p className="muted text-sm">{c.lastMessage || "—"}</p>
            </div>
          ))}
        </div>
      ) : (
        <div className="card-lg">Você ainda não tem conversas.</div>
      )}
    </main>
  );
}

export default function Page(){return <Main/>}