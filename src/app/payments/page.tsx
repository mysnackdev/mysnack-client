"use client";

import React, { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { useAuth } from "@/hooks";
import LoginForm from "@/components/login-form";
import { CreditCard, Plus, Trash2, Check, Shield, AlertCircle, Wallet, BadgeDollarSign } from "lucide-react";

const BottomNav = dynamic(() => import("@/components/bottom-nav"), { ssr: false });

type CardBrand = "Visa" | "Mastercard" | "Elo" | "Amex" | "Hipercard" | "Desconhecido";
type CardType = "credito" | "debito";
type SavedCard = {
  id: string;
  brand: CardBrand;
  holder: string;
  last4: string;
  exp: string;      // MM/AA
  type: CardType;
  default?: boolean;
};

function getLocalKey(uid: string) { return `payments:${uid}`; }

function detectBrand(num: string): CardBrand {
  const n = num.replace(/\D/g, "");
  if (/^4[0-9]{6,}$/.test(n)) return "Visa";
  if (/^5[1-5][0-9]{5,}$/.test(n)) return "Mastercard";
  if (/^(4011|4312|4389|4514|4576|5041|5067|509|6277|6362)/.test(n)) return "Elo";
  if (/^3[47][0-9]{5,}$/.test(n)) return "Amex";
  if (/^(606282|3841)/.test(n)) return "Hipercard";
  return "Desconhecido";
}

export default function PaymentsPage() {
  const { user } = useAuth();
  const [cards, setCards] = useState<SavedCard[]>([]);

  // form
  const [holder, setHolder] = useState("");
  const [number, setNumber] = useState("");
  const [exp, setExp] = useState("");
  const [cvv, setCvv] = useState("");
  const [type, setType] = useState<CardType>("credito");
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<number | null>(null);

  useEffect(() => {
    if (!user) return;
    try {
      const raw = localStorage.getItem(getLocalKey(user.uid));
      setCards(raw ? JSON.parse(raw) as SavedCard[] : []);
    } catch { setCards([]); }
  }, [user?.uid]);

  const persist = (next: SavedCard[]) => {
    if (!user) return;
    setCards(next);
    try { localStorage.setItem(getLocalKey(user.uid), JSON.stringify(next)); } catch {}
  };

  const addCard = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    try {
      const clean = number.replace(/\s+/g, "").replace(/\D/g, "");
      const brand = detectBrand(clean);
      const last4 = clean.slice(-4);
      const id = `card_${Date.now()}`;
      const card: SavedCard = { id, brand, holder: holder.trim(), last4, exp: exp.trim(), type, default: cards.length === 0 };
      persist([card, ...cards]);
      setHolder(""); setNumber(""); setExp(""); setCvv(""); setType("credito");
      setSavedAt(Date.now());
    } finally {
      setSaving(false);
    }
  };

  const removeCard = (id: string) => {
    const next = cards.filter(c => c.id !== id);
    persist(next);
  };

  const setDefault = (id: string) => {
    const next = cards.map(c => ({ ...c, default: c.id === id }));
    persist(next);
  };

  if (!user) {
    return (
      <main className="max-w-2xl mx-auto px-4 py-8 pb-24">
        <h1 className="text-2xl font-semibold mb-1">Pagamentos</h1>
        <p className="opacity-70 mb-6 text-sm">Entre para gerenciar seus cartões.</p>
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
        <h1 className="text-3xl font-bold">Pagamentos</h1>
        <p className="text-sm opacity-70">Meus métodos de pagamento</p>
      </header>

      {/* Cards list */}
      <section className="space-y-3 mb-6">
        {cards.length === 0 ? (
          <div className="bg-white border rounded-2xl p-4 text-sm opacity-80">
            Você ainda não cadastrou cartões. Adicione um cartão abaixo.
          </div>
        ) : cards.map((c) => (
          <div key={c.id} className="bg-white border rounded-2xl p-4 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-6 rounded-md border flex items-center justify-center text-xs">{c.brand}</div>
              <div>
                <div className="font-medium">{c.holder}</div>
                <div className="text-xs opacity-70">•••• •••• •••• {c.last4}  ·  {c.exp}  ·  {c.type === "credito" ? "Crédito" : "Débito"}</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {!c.default && (
                <button className="btn-secondary px-3 py-1 text-xs" onClick={()=>setDefault(c.id)}>Tornar padrão</button>
              )}
              <button className="btn-secondary px-3 py-1 text-xs" onClick={()=>removeCard(c.id)}>
                <Trash2 className="w-4 h-4"/>
              </button>
            </div>
          </div>
        ))}
      </section>

      {/* Add card form (mock) */}
      <form onSubmit={addCard} className="bg-white border rounded-2xl p-4 space-y-4">
        <h2 className="font-semibold text-lg">Adicionar cartão</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <label className="block">
            <div className="text-xs font-medium opacity-70 mb-1">Nome impresso</div>
            <input className="input" value={holder} onChange={(e)=>setHolder(e.target.value)} placeholder="NOME COMPLETO" required/>
          </label>
          <label className="block">
            <div className="text-xs font-medium opacity-70 mb-1">Número</div>
            <input className="input" value={number} onChange={(e)=>setNumber(e.target.value)} inputMode="numeric" placeholder="0000 0000 0000 0000" required/>
          </label>
          <label className="block">
            <div className="text-xs font-medium opacity-70 mb-1">Validade (MM/AA)</div>
            <input className="input" value={exp} onChange={(e)=>setExp(e.target.value)} placeholder="12/29" required/>
          </label>
          <label className="block">
            <div className="text-xs font-medium opacity-70 mb-1">CVV</div>
            <input className="input" value={cvv} onChange={(e)=>setCvv(e.target.value)} inputMode="numeric" placeholder="***" required/>
          </label>
          <label className="block">
            <div className="text-xs font-medium opacity-70 mb-1">Tipo</div>
            <select className="input" value={type} onChange={(e)=>setType(e.target.value as CardType)}>
              <option value="credito">Crédito</option>
              <option value="debito">Débito</option>
            </select>
          </label>
        </div>
        <div className="flex items-center gap-3">
          <button type="submit" className="btn-primary px-5" disabled={saving}>
            {saving ? "Salvando..." : (<span className="inline-flex items-center gap-2"><Plus className="w-4 h-4"/> Adicionar cartão</span>)}
          </button>
          {savedAt && <span className="text-xs opacity-70 flex items-center gap-1"><Check className="w-4 h-4"/> Cartão salvo (mock)</span>}
        </div>
        <p className="text-xs opacity-70 mt-1 flex items-center gap-2"><Shield className="w-4 h-4"/> Os dados são armazenados apenas localmente neste dispositivo enquanto preparamos a integração real.</p>
      </form>

      <BottomNav active="perfil" />
    </main>
  );
}
