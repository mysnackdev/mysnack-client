"use client";
import React, { useState } from "react";
import { useAuth } from "@/hooks";
import Link from "next/link";

export function LoginForm() {
  const { loginWithEmail } = useAuth();
  const [email, setEmail] = useState<string>(""); 
  const [password, setPassword] = useState<string>(""); 
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null); setLoading(true);
    try {
      await loginWithEmail(email, password);
    } catch (err: unknown) {
      setError(err instanceof Error && err.message ? err.message : "Erro ao entrar");
    } finally { setLoading(false); }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-3 max-w-[420px]">
      <div>
        <label className="label">E-mail</label>
        <input
          className="input" type="email" placeholder="seu@email.com"
          value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" required
        />
      </div>
      <div>
        <label className="label">Senha</label>
        <div className="flex gap-2 items-center">
          <input
            className="input flex-1" type={showPw ? 'text':'password'}
            value={password} onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password" minLength={6} required
          />
          <button type="button" className="btn-secondary px-3" onClick={() => setShowPw(v=>!v)}>
            {showPw ? 'Ocultar':'Mostrar'}
          </button>
        </div>
      </div>

      {error && <p className="error">{error}</p>}

      <div className="flex items-center justify-between">
        <Link href="/criar-conta" className="text-sm underline opacity-80">Criar conta</Link>
        <Link href="/orders" className="text-sm underline opacity-80">Esqueci minha senha</Link>
        <button type="submit" className="btn-primary w-auto px-5" disabled={loading}>
          {loading ? "Entrando..." : "Entrar"}
        </button>
      </div>
    </form>
  );
}


export default LoginForm;
