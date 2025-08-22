"use client";
import React from "react";

import { useAuth } from "@/hooks";

function Main(){
  const { user } = useAuth();

  if (!user) {
    return (
      <main className="max-w-5xl mx-auto px-4">
        <header className="py-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">Dados da conta</h1>
            <p className="muted">Gerencie suas informações pessoais.</p>
          </div>
          <a href="/perfil" className="btn-ghost">Voltar</a>
        </header>
        <div className="card-lg">Entre no MySnack para gerenciar sua conta.</div>
      </main>
    );
  }

  return (
    <main className="max-w-5xl mx-auto px-4">
      <header className="py-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Dados da conta</h1>
          <p className="muted">Gerencie suas informações pessoais.</p>
        </div>
        <a href="/perfil" className="btn-ghost">Voltar</a>
      </header>

      <div className="card-lg space-y-2">
        <p><strong>UID:</strong> {user.uid}</p>
        <p><strong>E-mail:</strong> {user.email}</p>
        <p><strong>Nome:</strong> {user.displayName || "—"}</p>
      </div>
    </main>
  );
}

export default function Page(){return <Main/>}