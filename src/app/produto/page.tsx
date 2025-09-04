import React, { Suspense } from "react";
import ProdutoClientPage from "./ProdutoClientPage";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function Page() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-[#fafafa] pb-24">
          <header className="sticky top-0 z-10 bg-white/80 backdrop-blur border-b">
            <div className="mx-auto max-w-5xl px-4 h-14 flex items-center gap-3">
              <div className="h-4 w-24 bg-zinc-200 rounded animate-pulse" />
            </div>
          </header>
          <div className="mx-auto max-w-5xl px-4 py-4">
            <div className="rounded-2xl bg-white border p-6 shadow-sm">
              <div className="h-5 w-40 bg-zinc-200 rounded animate-pulse" />
            </div>
          </div>
        </main>
      }
    >
      <ProdutoClientPage />
    </Suspense>
  );
}
