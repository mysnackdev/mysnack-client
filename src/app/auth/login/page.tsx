"use client";
import React from 'react';
import LoginForm from '@/components/login-form';
import Link from 'next/link';

export default function LoginPage(){
  return (
    <main className="max-w-md mx-auto px-4 py-8">
      <h1 className="text-2xl font-semibold mb-1">Entrar</h1>
      <p className="opacity-70 mb-6 text-sm">Acesse suas conversas, notificações e pedidos.</p>
      <div className="bg-white rounded-2xl shadow-sm border p-5">
        <LoginForm />
        <p className="mt-4 text-sm text-center">
          Não tem conta? <Link className="underline" href="/auth/register/step-1">Crie agora</Link>
        </p>
      </div>
    </main>
  );
}
