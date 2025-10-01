"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { FAQ, type FaqItem } from "@/data/faq";

function normalize(s: string): string {
  return (s || "").toLowerCase().normalize("NFD").replace(/\p{Diacritic}/gu, "");
}

export default function AjudaPage() {
  const [query, setQuery] = useState<string>("");
  const [categoria, setCategoria] = useState<string>("todos");

  const filtered: FaqItem[] = useMemo(() => {
    const q = normalize(query);
    return FAQ.filter((it) => {
      const catOk = categoria === "todos" || it.categoria === categoria;
      if (!q) return catOk;
      return catOk && (normalize(it.pergunta).includes(q) || normalize(it.resposta).includes(q));
    });
  }, [query, categoria]);

  return (
    <div className="max-w-3xl mx-auto py-6">
      <h1 className="text-2xl font-bold">Ajuda</h1>
      <p className="text-zinc-600 mt-1">FAQ ilustrado e pesquisável.</p>

      <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-2 md:gap-3">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Pesquisar dúvidas..."
          className="md:col-span-2 rounded border px-3 py-2 outline-none focus:ring-2 focus:ring-zinc-300"
        />
        <select
          value={categoria}
          onChange={(e) => setCategoria(e.target.value)}
          className="rounded border px-3 py-2 outline-none focus:ring-2 focus:ring-zinc-300"
        >
          <option value="todos">Todas categorias</option>
          <option value="QR Code">QR Code</option>
          <option value="Pagamento">Pagamento</option>
          <option value="Acompanhamento">Acompanhamento</option>
          <option value="Conta">Conta</option>
          <option value="Outros">Outros</option>
        </select>
      </div>

      <div className="mt-4 space-y-3">
        {filtered.length === 0 && (
          <p className="text-sm text-zinc-600">Nenhum resultado para sua busca.</p>
        )}
        {filtered.map((it) => (
          <article key={it.id} className="border rounded-lg p-3 md:p-4">
            <h3 className="font-semibold flex items-center gap-2">
              <span aria-hidden>{it.icone}</span>{it.pergunta}
            </h3>
            <p className="text-sm text-zinc-700 mt-1">{it.resposta}</p>
          </article>
        ))}
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <Link
          href="https://wa.me/5511971900161?text=Ol%C3%A1!%20Preciso%20de%20ajuda%20no%20app%20MySnack."
          target="_blank"
          className="rounded-lg border px-4 py-2 hover:bg-zinc-50"
        >
          Atendimento no WhatsApp
        </Link>
        <button
          onClick={() => window.dispatchEvent(new CustomEvent("mysnack:open-tutorial"))}
          className="rounded-lg bg-zinc-900 text-white px-4 py-2 hover:bg-black"
        >
          Assistir tutorial (30s)
        </button>
      </div>
    </div>
  );
}
