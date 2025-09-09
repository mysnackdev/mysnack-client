"use client";
import Image from "next/image";
import Link from "next/link";

export type LastOrderData = {
  id: string;
  storeName: string;
  storeLogoUrl?: string;
  itemsText: string;
  totalText?: string;
};

export default function LastOrderCard(props: { data: LastOrderData | null }) {
  const d = props.data;
  if (!d) return null;
  return (
    <section className="px-4 mt-4">
      <div className="rounded-2xl border border-rose-100 bg-white shadow-sm">
        <div className="flex items-center gap-3 p-4">
          <div className="relative w-10 h-10 rounded-full overflow-hidden ring-2 ring-zinc-200">
            <Image src={d.storeLogoUrl || "/placeholder-store.jpg"} alt={d.storeName} fill sizes="40px" className="object-cover" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-semibold">{d.storeName}</div>
            <div className="text-sm text-zinc-500">Último pedido • {d.itemsText}</div>
          </div>
          <Link href="#" className="hidden sm:block text-zinc-900 font-medium">{d.totalText ?? ""}</Link>
        </div>
        <div className="px-4 pb-4">
          <div className="flex items-center justify-between gap-4">
            <Link href="#" className="inline-flex items-center gap-2 bg-rose-500 text-white px-4 py-2 rounded-2xl shadow">
              ↻ Pedir Novamente
            </Link>
            {d.totalText && <span className="sm:hidden text-zinc-900 font-medium">{d.totalText}</span>}
          </div>
        </div>
      </div>
    </section>
  );
}
