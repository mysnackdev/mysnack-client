"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { loadReg, saveReg } from '@/lib/registrationStore';
function StepHeader({ step }:{ step:number }){
  const labels = ['Dados','Segurança','Endereço'];
  return (
    <div className="flex items-center gap-2 mb-6">
      {labels.map((l,i)=> (
        <div key={l} className="flex items-center gap-2">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${i<step?'bg-indigo-600 text-white':'bg-indigo-100 text-indigo-700'}`}>{i+1}</div>
          <span className="text-sm hidden sm:inline">{l}</span>
          {i<2 && <div className="w-6 sm:w-12 h-px bg-gray-300"/>}
        </div>
      ))}
    </div>
  );
}


export default function RegisterStep1() {
  const router = useRouter();
  const init = loadReg();
  const [displayName, setDisplayName] = useState(init.displayName||'');
  const [email, setEmail] = useState(init.email||'');
  const [phone, setPhone] = useState(init.phone||'');
  const [document, setDocument] = useState(init.document||'');
  const [birthDate, setBirthDate] = useState(init.birthDate||'');

  function next(){
    saveReg({ displayName, email, phone, document, birthDate });
    router.push('/auth/register/step-2');
  }

  return (
    <main className="max-w-xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-semibold mb-1">Criar conta</h1>
      <p className="opacity-70 mb-6 text-sm">Etapa 1 de 3</p>
      <div className="bg-white rounded-2xl shadow-sm border p-5">
        <StepHeader step={1} />
        <div className="space-y-3">
          <div>
            <label className="label">Nome completo</label>
            <input className="input" value={displayName} onChange={e=>setDisplayName(e.target.value)} autoComplete="name" />
          </div>
          <div>
            <label className="label">E-mail</label>
            <input className="input" type="email" value={email} onChange={e=>setEmail(e.target.value)} autoComplete="email" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Telefone</label>
              <input className="input" value={phone} onChange={e=>setPhone(e.target.value)} autoComplete="tel" placeholder="(11) 99999-9999" />
            </div>
            <div>
              <label className="label">CPF/CNPJ</label>
              <input className="input" value={document} onChange={e=>setDocument(e.target.value)} placeholder="Somente números" />
            </div>
          </div>
          <div>
            <label className="label">Data de nascimento</label>
            <input className="input" type="date" value={birthDate} onChange={e=>setBirthDate(e.target.value)} />
          </div>
        </div>
        <div className="flex justify-between items-center mt-6">
          <Link className="underline text-sm" href="/auth/login">Já tenho conta</Link>
          <button onClick={next} className="btn-primary w-auto px-5">Continuar</button>
        </div>
      </div>
    </main>
  );
}
