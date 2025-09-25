
'use client';
import { useEffect, useState } from "react";
import BottomNav from "@/components/BottomNav";
import { Trash2, CreditCard, Star, Plus } from "lucide-react";
import { addCard, deleteCard, listenCards, SavedCard, setDefaultCard } from "@/services/payments.service";

export default function PaymentsPage() {
  const [cards, setCards] = useState<SavedCard[]>([]);
  const [holder, setHolder] = useState('');
  const [number, setNumber] = useState('');
  const [exp, setExp] = useState('');
  const [cvv, setCvv] = useState('');
  const [type, setType] = useState<'Crédito' | 'Débito'>('Crédito');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const unsub = listenCards((c) => setCards(c));
    return () => { /* onValue uses persistent listener; nothing to detach here in this helper */ };
  }, []);

  const maskNum = (n: string) => n.replace(/\s+/g, '').replace(/(\d{4})(?=\d)/g, '$1 ').trim();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await addCard({ number, holder, exp, cvv, type });
      setHolder(''); setNumber(''); setExp(''); setCvv('');
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="container mx-auto px-4 pb-28">
      <h1 className="text-2xl font-semibold mt-8">Pagamentos</h1>
      <p className="text-sm opacity-70 mb-4">Meus métodos de pagamento</p>

      <div className="space-y-3 mb-6">
        {cards.length === 0 && <p className="text-sm opacity-70">Nenhum cartão cadastrado.</p>}
        {cards.map((card) => (
          <div key={card.id} className="rounded-2xl border border-gray-300 shadow-sm p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-8 rounded-lg border flex items-center justify-center">
                <CreditCard className="w-5 h-5" />
              </div>
              <div>
                <div className="font-medium">{card.holder.toUpperCase()}</div>
                <div className="text-sm opacity-70">
                  {card.brand} •••• •••• •••• {card.last4} · {card.exp} · {card.type}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {card.default ? (
                <span title="Padrão" className="text-xs px-3 py-1 rounded-full border">Padrão</span>
              ) : (
                <button onClick={() => setDefaultCard(card.id)} className="px-3 py-1 rounded-full border hover:bg-gray-50 text-sm">Tornar padrão</button>
              )}
              <button onClick={() => deleteCard(card.id)} className="p-2 rounded-full border hover:bg-gray-50" aria-label="Excluir cartão">
                <Trash2 className="w-4 h-4"/>
              </button>
            </div>
          </div>
        ))}
      </div>

      <form onSubmit={onSubmit} className="rounded-2xl border border-gray-300 shadow-sm p-5 space-y-4 max-w-3xl">
        <h2 className="font-semibold text-lg">Adicionar cartão</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <label className="block">
            <div className="text-xs font-medium opacity-70 mb-1">Nome impresso</div>
            <input className="input" value={holder} onChange={(e)=>setHolder(e.target.value)} placeholder="NOME COMPLETO" required/>
          </label>
          <label className="block">
            <div className="text-xs font-medium opacity-70 mb-1">Número</div>
            <input className="input" value={number} onChange={(e)=>setNumber(maskNum(e.target.value))} inputMode="numeric" placeholder="0000 0000 0000 0000" required/>
          </label>
          <label className="block">
            <div className="text-xs font-medium opacity-70 mb-1">Validade (MM/AA)</div>
            <input className="input" value={exp} onChange={(e)=>setExp(e.target.value)} placeholder="12/29" required/>
          </label>
          <label className="block">
            <div className="text-xs font-medium opacity-70 mb-1">CVV</div>
            <input className="input" value={cvv} onChange={(e)=>setCvv(e.target.value)} placeholder="***" required/>
          </label>
          <label className="block sm:col-span-2">
            <div className="text-xs font-medium opacity-70 mb-1">Tipo</div>
            <select className="input" value={type} onChange={(e)=>setType(e.target.value as any)}>
              <option>Crédito</option>
              <option>Débito</option>
            </select>
          </label>
        </div>
        <button type="submit" className="btn-primary px-5" disabled={saving}>
          {saving ? "Salvando..." : (<span className="inline-flex items-center gap-2"><Plus className="w-4 h-4"/> Adicionar cartão</span>)}
        </button>
      </form>

      <BottomNav active="perfil" />
    </main>
  );
}
