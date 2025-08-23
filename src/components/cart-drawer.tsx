"use client";

import React from "react";

export interface CartItem {
  id: string;
  name: string;
  qty: number;
  price: number;
}

export interface CartDrawerProps {
  isOpen: boolean;
  items: CartItem[];
  onClose: () => void;
  onRemoveItem: (id: string) => void;
  onChangeQty: (id: string, qty: number) => void;
  onCheckout: () => void;
}

export function CartDrawer({
  isOpen,
  items,
  onClose,
  onRemoveItem,
  onChangeQty,
  onCheckout,
}: CartDrawerProps) {
  const subtotal = items.reduce((sum, it) => sum + it.qty * it.price, 0);

  return (
    <aside
      aria-hidden={!isOpen}
      className={`fixed right-0 top-0 z-50 h-full w-[360px] transform border-l bg-white shadow-xl transition ${
        isOpen ? "translate-x-0" : "translate-x-full"
      }`}
    >
      <div className="flex items-center justify-between border-b p-4">
        <h2 className="text-lg font-semibold">Sua sacola</h2>
        <button onClick={onClose} className="rounded-md border px-3 py-1 text-sm hover:bg-gray-50">
          Fechar
        </button>
      </div>

      <div className="max-h-[calc(100%-160px)] overflow-auto p-4">
        {items.length === 0 && <p className="text-sm text-muted-foreground">Sua sacola está vazia.</p>}

        <ul className="space-y-3">
          {items.map((it) => (
            <li key={it.id} className="rounded-lg border p-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-medium">{it.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {it.qty} x R$ {it.price.toFixed(2)}
                  </p>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    className="rounded border px-2"
                    onClick={() => onChangeQty(it.id, Math.max(1, it.qty - 1))}
                  >
                    −
                  </button>
                  <span className="px-2">{it.qty}</span>
                  <button className="rounded border px-2" onClick={() => onChangeQty(it.id, it.qty + 1)}>
                    +
                  </button>
                </div>
              </div>

              <div className="mt-2 flex items-center justify-between">
                <span className="text-sm">
                  Total: <strong>R$ {(it.qty * it.price).toFixed(2)}</strong>
                </span>
                <button className="text-sm text-red-600 hover:underline" onClick={() => onRemoveItem(it.id)}>
                  Remover
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div className="border-t p-4">
        <div className="mb-3 flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Subtotal</span>
          <span className="text-base font-semibold">R$ {subtotal.toFixed(2)}</span>
        </div>
        <button
          disabled={items.length === 0}
          onClick={onCheckout}
          className="w-full rounded-md bg-black px-4 py-2 font-semibold text-white disabled:opacity-50"
        >
          Finalizar pedido
        </button>
      </div>
    </aside>
  );
}
