"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { FAQ, type FaqItem } from "@/data/faq";

type HelpCenterProps = {
  defaultOpen?: boolean;
};

function normalize(s: string): string {
  return (s || "").toLowerCase().normalize("NFD").replace(/\p{Diacritic}/gu, "");
}

export default function HelpCenter({ defaultOpen = false }: HelpCenterProps) {
  const [open, setOpen] = useState<boolean>(defaultOpen);
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
    <>
      {/* Floating Action Button (FAB) */}
      <button
        aria-label="Abrir ajuda"
        onClick={() => setOpen(true)}
        className="fixed z-40 bottom-24 right-4 md:right-6 rounded-full shadow-lg border bg-white/95 backdrop-blur px-4 py-3 hover:bg-white transition"
      >
        <span className="sr-only">Ajuda</span>
        <span className="font-semibold">?</span>
      </button>

      {/* Modal */}
      {open && (
        <div className="fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setOpen(false)}
            aria-hidden
          />
          <div
            role="dialog"
            aria-modal="true"
            className="absolute inset-x-0 bottom-0 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-[720px] rounded-t-2xl md:rounded-2xl bg-white shadow-xl"
          >
            <div className="p-4 md:p-6 border-b">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-lg md:text-xl font-bold">Central de Ajuda</h2>
                <button onClick={() => setOpen(false)} className="text-zinc-500 hover:text-zinc-800">Fechar</button>
              </div>
              <p className="text-sm text-zinc-600 mt-1">
                Busque no FAQ, fale no WhatsApp ou assista ao tutorial.
              </p>
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
            </div>

            <div className="p-4 md:p-6 max-h-[60vh] overflow-y-auto space-y-3">
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

            <div className="p-4 md:p-6 border-t flex flex-wrap items-center justify-between gap-2">
              <Link
                href="https://wa.me/5511971900161?text=Ol%C3%A1!%20Preciso%20de%20ajuda%20no%20app%20MySnack."
                target="_blank"
                className="rounded-lg border px-4 py-2 hover:bg-zinc-50"
              >
                Atendimento no WhatsApp
              </Link>
              <button
                onClick={() => {
                  // Dispara evento global para abrir o tutorial, ouvido pelo OnboardingInitializer
                  window.dispatchEvent(new CustomEvent("mysnack:open-tutorial"));
                  setOpen(false);
                }}
                className="rounded-lg bg-zinc-900 text-white px-4 py-2 hover:bg-black"
              >
                Assistir tutorial
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
