"use client";
import React, { useState } from "react";
import { useAuth } from "@/hooks";

export function RegisterForm() {
  const { registerWithEmail } = useAuth();
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirm, setConfirm] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (password !== confirm) {
      setError("As senhas não coincidem.");
      return;
    }

    setLoading(true);
    try {
      await registerWithEmail(email, password);
      setSuccess("Conta criada com sucesso! Você já pode entrar.");
      setEmail("");
      setPassword("");
      setConfirm("");
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : typeof err === "string" ? err : "Falha ao registrar";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={onSubmit} noValidate>
      <label htmlFor="reg-email" className="text-sm">E-mail</label>
      <input
        id="reg-email"
        type="email"
        placeholder="seu@email.com"
        onChange={(e) => setEmail(e.target.value)}
        className="bg-white rounded w-full me-2 h-8 p-1 mb-2 border"
        value={email}
        required
        autoComplete="email"
      />

      <label htmlFor="reg-pass" className="text-sm">Senha</label>
      <input
        id="reg-pass"
        type="password"
        placeholder="••••••••"
        onChange={(e) => setPassword(e.target.value)}
        className="bg-white rounded w-full me-2 h-8 p-1 mb-2 border"
        value={password}
        minLength={6}
        required
        autoComplete="new-password"
      />

      <label htmlFor="reg-confirm" className="text-sm">Confirmar senha</label>
      <input
        id="reg-confirm"
        type="password"
        placeholder="••••••••"
        onChange={(e) => setConfirm(e.target.value)}
        className="bg-white rounded w-full me-2 h-8 p-1 mb-3 border"
        value={confirm}
        minLength={6}
        required
        autoComplete="new-password"
      />

      {error && <p className="text-red-600 text-sm mb-2">{error}</p>}
      {success && <p className="text-green-700 text-sm mb-2">{success}</p>}

      <button type="submit" className="btn-primary w-full" disabled={loading}>
        {loading ? "Criando conta..." : "Criar conta"}
      </button>
    </form>
  );
}

export default RegisterForm;
