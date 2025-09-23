
"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { loadReg, clearReg } from '@/lib/registrationStore';
import { useAuth } from '@/hooks';
import { ProfileService } from '@/services/profile.service';
import type { RegData } from '@/lib/registrationStore';
import { updateProfile } from 'firebase/auth';

type Address = NonNullable<RegData['address']>;

function StepHeader({ step }:{ step:number }){
  const labels = ['Dados','Segurança','Endereço'];
  return (
    <div className="flex items-center gap-2 mb-6">
      {labels.map((l,i)=> (
        <div key={l} className="flex items-center gap-2">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${i+1<=step?'bg-indigo-600 text-white':'bg-indigo-100 text-indigo-700'}`}>{i+1}</div>
          <span className="text-sm hidden sm:inline">{l}</span>
          {i<2 && <div className="w-6 sm:w-12 h-px bg-gray-300"/>}
        </div>
      ))}
    </div>
  );
}

export default function RegisterStep3Page(){
  const router = useRouter();
  const { registerWithEmail } = useAuth();

  const init = loadReg();
  const [address, setAddress] = useState<Address>(init.address ?? ({} as Address));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string|null>(null);

  function setField<K extends keyof Address>(k: K, v: Address[K]) {
    setAddress(prev => ({ ...prev, [k]: v }));
  }

  async function finish(){
    setError(null); setLoading(true);
    try {
      const data = { ...init, address } as const;
      const displayName = data.displayName ?? '';
      const email = data.email ?? '';
      const phone = data.phone ?? '';
      const document = data.document ?? '';
      const birthDate = data.birthDate ?? '';
      if (!email || !data.password) throw new Error('E-mail e senha são obrigatórios.');
      if (!displayName) throw new Error('Informe seu nome completo.');
      if (!data.email || !data.password) throw new Error('E-mail e senha são obrigatórios.');
      const user = await registerWithEmail(data.email, data.password);
      // atualizar displayName no auth
      if (user && data.displayName) {
        await updateProfile(user, { displayName: data.displayName });
      }
      // salvar perfil do cliente
      await ProfileService.upsertClientProfile({
        uid: user?.uid ?? undefined,
        displayName,
        email,
        phone,
        document,
        birthDate,
        marketingOptIn: Boolean(data.marketingOptIn ?? true),
        address: address || undefined,
      });
      clearReg();
      router.push('/orders');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao finalizar cadastro';
      setError(message);
    } finally { setLoading(false); }
  }

  return (
    <div className="max-w-3xl mx-auto p-4">
      <StepHeader step={3} />
      <h1 className="text-xl font-semibold mb-2">Endereço</h1>
      <p className="text-sm text-zinc-600 mb-4">Informe seu endereço para entregas e notas fiscais.</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="label">CEP</label>
          <input className="input" value={address.zip ?? ''} onChange={e=>setField('zip', e.target.value)} />
        </div>
        <div>
          <label className="label">Rua</label>
          <input className="input" value={address.street ?? ''} onChange={e=>setField('street', e.target.value)} />
        </div>
        <div>
          <label className="label">Número</label>
          <input className="input" value={address.number ?? ''} onChange={e=>setField('number', e.target.value)} />
        </div>
        <div>
          <label className="label">Complemento</label>
          <input className="input" value={address.complement ?? ''} onChange={e=>setField('complement', e.target.value)} />
        </div>
        <div>
          <label className="label">Bairro</label>
          <input className="input" value={address.neighborhood ?? ''} onChange={e=>setField('neighborhood', e.target.value)} />
        </div>
        <div>
          <label className="label">Cidade</label>
          <input className="input" value={address.city ?? ''} onChange={e=>setField('city', e.target.value)} />
        </div>
        <div>
          <label className="label">UF</label>
          <input className="input" maxLength={2} value={address.state ?? ''} onChange={e=>setField('state', e.target.value)} />
        </div>
      </div>

      {error && <p className="text-sm text-red-600 mt-3">{error}</p>}

      <div className="mt-6 flex items-center gap-3">
        <Link className="btn-secondary" href="/auth/register/step-2">Voltar</Link>
        <button disabled={loading} className="btn-primary" onClick={finish}>
          {loading ? 'Salvando…' : 'Concluir cadastro'}
        </button>
      </div>
    </div>
  );
}
