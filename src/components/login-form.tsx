"use client";
import React, { useState } from "react";
import { useAuth } from "@/hooks";

export function LoginForm() {
  const { loginWithEmail } = useAuth();
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await loginWithEmail(email, password);
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : typeof err === "string"
          ? err
          : "Falha ao entrar";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={onSubmit} noValidate>
      <label htmlFor="login-email" className="text-sm">E-mail</label>
      <input
        id="login-email"
        type="email"
        placeholder="seu@email.com"
        onChange={(e) => setEmail(e.target.value)}
        className="bg-white rounded w-full me-2 h-8 p-1 mb-2 border"
        value={email}
        required
        autoComplete="email"
      />

      <label htmlFor="login-password" className="text-sm">Senha</label>
      <input
        id="login-password"
        type="password"
        placeholder="••••••••"
        onChange={(e) => setPassword(e.target.value)}
        className="bg-white rounded w-full me-2 h-8 p-1 mb-3 border"
        value={password}
        required
        autoComplete="current-password"
        minLength={6}
      />

      {error && <p className="text-red-600 text-sm mb-2">{error}</p>}

      <button type="submit" className="btn-primary w-full" disabled={loading}>
        {loading ? "Entrando..." : "Entrar"}
      </button>
    </form>
  );
}

export default LoginForm;
