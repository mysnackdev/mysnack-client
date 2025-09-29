"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { useAuth } from "@/hooks";
import { getAuth, updateProfile } from "firebase/auth";
import { db } from "@/firebase";
import { ref, update as rtdbUpdate } from "firebase/database";

const BottomNav = dynamic(() => import("@/components/bottom-nav"), { ssr: false });

export default function CriarContaPage() {

const router = useRouter();
  const { registerWithEmail } = useAuth();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    if (password !== confirm) {
      setError("As senhas não conferem.");
      return;
    }
    try {
      setLoading(true);
      const user = await registerWithEmail(email, password);
      try {
        // Atualiza displayName no Firebase Auth
        if (getAuth().currentUser) {
          await updateProfile(getAuth().currentUser!, { displayName: name });
        }
      } catch {}
      try {
        // Persiste/atualiza perfil completo no RTDB
        const uid = user.uid;
        const profileRef = ref(db, `client/profiles/${uid}`);
        await rtdbUpdate(profileRef, {
          uid,
          displayName: name,
          email,
          phone,
          updatedAt: Date.now(),
        });
      } catch {}
      router.push("/perfil");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Não foi possível criar a conta.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen max-w-md mx-auto px-4 py-6">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold">Criar conta</h1>
        <p className="text-sm opacity-70">Use seu e‑mail para se cadastrar.</p>
      </header>

      <form onSubmit={onSubmit} className="space-y-4">
        <div className="space-y-2">
          <label className="block text-sm font-medium" htmlFor="name">Nome completo</label>
          <input
            id="name"
            name="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full input"
            placeholder="Seu nome"
            autoComplete="name"
            minLength={2}
            required
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium" htmlFor="phone">Telefone (WhatsApp)</label>
          <input
            id="phone"
            name="phone"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full input"
            placeholder="(XX) 9XXXX-XXXX"
            autoComplete="tel"
            required
          />
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-medium" htmlFor="email">E‑mail</label>
          <input
            id="email"
            name="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full input"
            placeholder="voce@exemplo.com"
            autoComplete="email"
            required
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium" htmlFor="password">Senha</label>
          <input
            id="password"
            name="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full input"
            placeholder="mínimo de 6 caracteres"
            autoComplete="new-password"
            minLength={6}
            required
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium" htmlFor="confirm">Confirmar senha</label>
          <input
            id="confirm"
            name="confirm"
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            className="w-full input"
            autoComplete="new-password"
            minLength={6}
            required
          />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="flex items-center justify-between">
          <Link href="/perfil" className="text-sm underline opacity-80">Já tenho conta</Link>
          <button type="submit" className="btn-primary px-5" disabled={loading}>
            {loading ? "Criando..." : "Criar conta"}
          </button>
        </div>
      </form>

      <BottomNav />
    </div>
  );
}