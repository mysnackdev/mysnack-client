
"use client";
import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { saveReg } from "@/lib/registrationStore";

type FormData = {
  displayName: string;
  email: string;
  phone: string;
  password: string;
  confirm: string;
};

export default function RegisterForm() {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    mode: "onChange",
    defaultValues: {
      displayName: "",
      email: "",
      phone: "",
      password: "",
      confirm: "",
    },
  });

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const nameVal = watch("displayName");
  const emailVal = watch("email");
  const passVal = watch("password");
  const confirmVal = watch("confirm");

  const step = nameVal && emailVal ? (passVal && confirmVal ? 3 : 2) : 1;

  async function onSubmit(values: FormData) {
    setError(null);
    setSuccess(null);
    setLoading(true);
    try {
      if (values.password !== values.confirm) {
        throw new Error("As senhas não conferem.");
      }
      saveReg({
        displayName: values.displayName,
        email: values.email,
        phone: values.phone,
        password: values.password,
      });
      setSuccess("Dados salvos. Próxima etapa: endereço.");
      router.push("/auth/register/step-3");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Erro ao criar conta";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <div className="flex items-center gap-2 mb-4" aria-label="Progresso de cadastro">
        {["Dados", "Segurança", "Endereço"].map((label, i) => {
          const active = i + 1 <= step;
          return (
            <div key={label} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${active ? "bg-indigo-600 text-white" : "bg-gray-200 text-gray-700"}`}>
                {i + 1}
              </div>
              <span className="text-sm hidden sm:inline">{label}</span>
              {i < 2 && <div className="w-6 sm:w-12 h-px bg-gray-300" />}
            </div>
          );
        })}
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
        <div>
          <label className="label">Nome completo</label>
          <input className="input" {...register("displayName", { required: "Informe seu nome" })} placeholder="Seu nome" autoComplete="name" />
          {errors.displayName && <p className="text-red-600 text-sm mt-1">{errors.displayName.message}</p>}
        </div>

        <div>
          <label className="label">E-mail</label>
          <input className="input" type="email" {...register("email", { required: "Informe seu e-mail" })} placeholder="seu@email.com" autoComplete="email" />
          {errors.email && <p className="text-red-600 text-sm mt-1">{errors.email.message}</p>}
        </div>

        <div>
          <label className="label">Telefone</label>
          <input className="input" {...register("phone", { required: "Informe seu telefone" })} placeholder="(11) 99999-9999" autoComplete="tel" />
          {errors.phone && <p className="text-red-600 text-sm mt-1">{errors.phone.message}</p>}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="label">Senha</label>
            <input className="input" type="password" {...register("password", { required: "Crie uma senha" })} placeholder="••••••••" autoComplete="new-password" />
            {errors.password && <p className="text-red-600 text-sm mt-1">{errors.password.message}</p>}
          </div>

          <div>
            <label className="label">Confirmar senha</label>
            <input className="input" type="password" {...register("confirm", { required: "Confirme a senha" })} placeholder="••••••••" autoComplete="new-password" />
            {errors.confirm && <p className="text-red-600 text-sm mt-1">{errors.confirm.message}</p>}
          </div>
        </div>

        <button disabled={loading} className="btn-primary w-full">
          {loading ? "Salvando…" : "Continuar"}
        </button>

        {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
        {success && <p className="text-sm text-green-700 mt-1">{success}</p>}

        <p className="text-xs text-gray-500 mt-2">
          Já tem conta? <Link href="/auth/login" className="underline">Entrar</Link>
        </p>
      </form>
    </div>
  );
}
