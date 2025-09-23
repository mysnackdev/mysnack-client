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


export default function RegisterStep2() {
  const router = useRouter();
  const init = loadReg();
  const [password, setPassword] = useState(init.password||'');
  const [confirm, setConfirm] = useState(init.confirm||'');
  const [marketingOptIn, setMarketingOptIn] = useState(init.marketingOptIn ?? true);
  const [show, setShow] = useState(false);

  function next(){
    if(password.length<6 || password!==confirm) return;
    saveReg({ password, confirm, marketingOptIn });
    router.push('/auth/register/step-3');
  }

  return (
    <main className="max-w-xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-semibold mb-1">Criar conta</h1>
      <p className="opacity-70 mb-6 text-sm">Etapa 2 de 3</p>
      <div className="bg-white rounded-2xl shadow-sm border p-5">
        <StepHeader step={2} />
        <div className="space-y-3">
          <div>
            <label className="label">Senha</label>
            <div className="flex gap-2 items-center">
              <input className="input flex-1" type={show?'text':'password'} value={password} onChange={e=>setPassword(e.target.value)} />
              <button className="btn-secondary px-3" onClick={()=>setShow(s=>!s)} type="button">{show?'Ocultar':'Mostrar'}</button>
            </div>
          </div>
          <div>
            <label className="label">Confirmar senha</label>
            <input className="input" type="password" value={confirm} onChange={e=>setConfirm(e.target.value)} />
            {password && confirm && password!==confirm && <p className="error">As senhas não conferem</p>}
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" className="checkbox" checked={marketingOptIn} onChange={e=>setMarketingOptIn(e.target.checked)} />
            Quero receber promoções por e-mail.
          </label>
        </div>
        <div className="flex justify-between items-center mt-6">
          <Link className="underline text-sm" href="/auth/register/step-1">Voltar</Link>
          <button onClick={next} className="btn-primary w-auto px-5">Continuar</button>
        </div>
      </div>
    </main>
  );
}
