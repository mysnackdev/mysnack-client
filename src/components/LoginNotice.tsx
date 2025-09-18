
"use client";
import Link from "next/link";
import { LogIn } from "lucide-react";

export default function LoginNotice({ className = "" }: { className?: string }) {
  return (
    <div className={`mx-4 mt-3 rounded-2xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-900 ${className}`}>
      <div className="flex items-start gap-3">
        <div className="mt-0.5">
          <LogIn size={18} />
        </div>
        <div className="flex-1">
          <div className="font-medium">Entre para ver seus pedidos</div>
          <div className="opacity-90">
            Faça login para visualizar seu histórico, repetir pedidos e receber notificações.
          </div>
        </div>
        <Link
          href="/perfil#entrar"
          className="shrink-0 rounded-xl bg-blue-600 px-3 py-1.5 text-white font-semibold hover:bg-blue-700"
        >
          Entrar
        </Link>
      </div>
    </div>
  );
}
