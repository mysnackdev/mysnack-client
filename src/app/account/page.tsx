"use client";

import React, { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { useAuth } from "@/hooks";
import LoginForm from "@/components/login-form";
import type { ClientProfileInput } from "@/@types/profile.types";
import { ProfileService } from "@/services/profile.service";
import { Check, Save, Mail, Phone, IdCard, Calendar, MapPin, ToggleLeft, ToggleRight } from "lucide-react";

const BottomNav = dynamic(() => import("@/components/bottom-nav"), { ssr: false });

type LocalProfile = ClientProfileInput & { uid?: string };

function getLocalKey(uid: string) { return `client:profile:${uid}`; }

function loadLocal(uid: string): LocalProfile | null {
  try {
    const raw = localStorage.getItem(getLocalKey(uid));
    return raw ? JSON.parse(raw) as LocalProfile : null;
  } catch { return null; }
}
function saveLocal(uid: string, data: LocalProfile) {
  try { localStorage.setItem(getLocalKey(uid), JSON.stringify(data)); } catch {}
}

export default function AccountPage() {
  const { user } = useAuth();
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<number | null>(null);

  // Form state
  const [form, setForm] = useState<LocalProfile>({
    email: "",
    displayName: "",
    phone: "",
    document: "",
    birthDate: "",
    address: { street: "", number: "", complement: "", neighborhood: "", city: "", state: "", zip: "" },
    marketingOptIn: true
  });

  useEffect(() => {
    if (!user) return;
    const base: LocalProfile = {
      uid: user.uid,
      email: user.email || "",
      displayName: user.displayName || (user.email ? user.email.split("@")[0] : ""),
      phone: form.phone || "",
      document: form.document || "",
      birthDate: form.birthDate || "",
      address: form.address || { street: "", number: "", complement: "", neighborhood: "", city: "", state: "", zip: "" },
      marketingOptIn: form.marketingOptIn ?? true
    };
    const cached = loadLocal(user.uid);
    setForm({ ...base, ...(cached || {}) });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.uid]);

  const handle = (path: string, value: any) => {
    setForm((prev) => {
      const next = structuredClone(prev);
      const keys = path.split(".");
      let ref: any = next;
      for (let i = 0; i < keys.length - 1; i++) ref = ref[keys[i]] ||= {};
      ref[keys.at(-1)!] = value;
      return next;
    });
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    try {
      // Persist mock locally
      saveLocal(user.uid, form);
      // Try real backend if available (silently ignore failures)
      try {
        await ProfileService.upsertClientProfile({ ...form, uid: user.uid });
      } catch (err) {
        // noop – callable pode não existir ainda
        console.info("upsertClientProfile (mock fallback):", (err as any)?.message || err);
      }
      setSavedAt(Date.now());
    } finally {
      setSaving(false);
    }
  };

  if (!user) {
    return (
      <main className="max-w-2xl mx-auto px-4 py-8 pb-24">
        <h1 className="text-2xl font-semibold mb-1">Dados da conta</h1>
        <p className="opacity-70 mb-6 text-sm">Entre para visualizar e editar seus dados.</p>
        <div className="bg-white rounded-2xl shadow-sm border p-5">
          <LoginForm />
        </div>
        <BottomNav active="perfil" />
      </main>
    );
  }

  return (
    <main className="max-w-2xl mx-auto px-4 py-6 pb-24">
      <header className="px-1 pt-2 mb-4">
        <h1 className="text-3xl font-bold">Dados da conta</h1>
        <p className="text-sm opacity-70">Minhas informações da conta</p>
      </header>

      <form onSubmit={onSubmit} className="space-y-6">
        <section className="bg-white border rounded-2xl p-4 space-y-4">
          <Field label="Nome" icon={<UserIcon/>}>
            <input className="input" value={form.displayName || ""} onChange={e=>handle("displayName", e.target.value)} placeholder="Seu nome" />
          </Field>
          <Field label="E-mail" icon={<Mail className="w-4 h-4 opacity-70" />}>
            <input className="input" value={form.email || ""} onChange={e=>handle("email", e.target.value)} placeholder="email@exemplo.com" type="email" />
          </Field>
          <Field label="Telefone" icon={<Phone className="w-4 h-4 opacity-70" />}>
            <input className="input" value={form.phone || ""} onChange={e=>handle("phone", e.target.value)} placeholder="(11) 99999-9999" />
          </Field>
          <Field label="Documento (CPF/CNPJ)" icon={<IdCard className="w-4 h-4 opacity-70" />}>
            <input className="input" value={form.document || ""} onChange={e=>handle("document", e.target.value)} placeholder="000.000.000-00" />
          </Field>
          <Field label="Nascimento" icon={<Calendar className="w-4 h-4 opacity-70" />}>
            <input className="input" value={form.birthDate || ""} onChange={e=>handle("birthDate", e.target.value)} type="date" />
          </Field>
        </section>

        <section className="bg-white border rounded-2xl p-4 space-y-4">
          <h2 className="font-semibold text-lg mb-2">Endereço</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input label="Rua" value={form.address?.street || ""} onChange={v=>handle("address.street", v)} />
            <Input label="Número" value={form.address?.number || ""} onChange={v=>handle("address.number", v)} />
            <Input label="Complemento" value={form.address?.complement || ""} onChange={v=>handle("address.complement", v)} />
            <Input label="Bairro" value={form.address?.neighborhood || ""} onChange={v=>handle("address.neighborhood", v)} />
            <Input label="Cidade" value={form.address?.city || ""} onChange={v=>handle("address.city", v)} />
            <Input label="Estado" value={form.address?.state || ""} onChange={v=>handle("address.state", v)} />
            <Input label="CEP" value={form.address?.zip || ""} onChange={v=>handle("address.zip", v)} />
          </div>
        </section>

        <section className="bg-white border rounded-2xl p-4 space-y-2">
          <label className="flex items-center justify-between">
            <div>
              <div className="font-medium">Quero receber ofertas por e-mail</div>
              <div className="text-xs opacity-70">Você pode desligar quando quiser.</div>
            </div>
            <button type="button" onClick={() => handle("marketingOptIn", !form.marketingOptIn)} className="p-2">
              {form.marketingOptIn ? <ToggleRight className="w-6 h-6"/> : <ToggleLeft className="w-6 h-6"/>}
            </button>
          </label>
        </section>

        <div className="flex items-center gap-3">
          <button type="submit" className="btn-primary px-5" disabled={saving}>
            {saving ? "Salvando..." : "Salvar alterações"}
          </button>
          {savedAt && <span className="text-xs opacity-70 flex items-center gap-1"><Check className="w-4 h-4"/> Alterações salvas</span>}
        </div>
      </form>

      <BottomNav active="perfil" />
    </main>
  );
}

function Field({ label, icon, children }: { label: string; icon?: React.ReactNode; children: React.ReactNode }) {
  return (
    <label className="block">
      <div className="text-xs font-medium opacity-70 mb-1 flex items-center gap-2">{icon}{label}</div>
      <div>{children}</div>
    </label>
  );
}
function Input({ label, value, onChange }: { label: string; value: string; onChange: (v: string)=>void }) {
  return (
    <label className="block">
      <div className="text-xs font-medium opacity-70 mb-1">{label}</div>
      <input className="input" value={value} onChange={(e)=>onChange(e.target.value)} />
    </label>
  );
}

// Local user icon
function UserIcon() { return <svg className="w-4 h-4 opacity-70" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M20 21a8 8 0 10-16 0"/><circle cx="12" cy="7" r="4"/></svg>; }
