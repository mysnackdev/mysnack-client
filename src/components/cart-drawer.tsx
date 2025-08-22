"use client";
import React from "react";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes } from "@fortawesome/free-solid-svg-icons";
import { useOrder } from "@/hooks";

type Props = { open: boolean; onClose: () => void };
type CartItem = { id: string; name: string; qty: number; price?: number };

// Tipagem mínima do contexto de pedidos
type OrderContext = {
  items?: CartItem[];
  cart?: { items?: CartItem[] };
  state?: { items?: CartItem[] };
};

export default function CartDrawer({ open, onClose }: Props) {
  // Hook do pedido
  const orderCtx = (useOrder?.() ?? null) as OrderContext | null;

  // Fonte bruta do contexto (pode ser undefined)
  const itemsFromCtx =
    orderCtx?.items ?? orderCtx?.cart?.items ?? orderCtx?.state?.items;

  // ✅ Memoiza e normaliza para array estável
  const orderItems = React.useMemo<CartItem[]>(
    () => (Array.isArray(itemsFromCtx) ? itemsFromCtx : []),
    [itemsFromCtx]
  );

  const [items, setItems] = React.useState<CartItem[]>([]);

  // Atualiza itens quando abrir o drawer ou quando a fonte do contexto mudar
  React.useEffect(() => {
    if (orderItems.length) {
      setItems(orderItems);
      return;
    }
    // Fallback: localStorage quando o contexto ainda não populou
    try {
      if (typeof window !== "undefined") {
        const raw = localStorage.getItem("mysnack_cart");
        if (raw) setItems(JSON.parse(raw) as CartItem[]);
        else setItems([]);
      }
    } catch {
      setItems([]);
    }
  }, [open, orderItems]);

  const subtotal = items.reduce((sum, it) => sum + (it.price ?? 0) * it.qty, 0);

  return (
    <div
      aria-hidden={!open}
      className={
        "fixed inset-0 z-50 transition " +
        (open ? "pointer-events-auto" : "pointer-events-none")
      }
    >
      {/* backdrop */}
      <div
        className={
          "absolute inset-0 bg-black/30 transition-opacity " +
          (open ? "opacity-100" : "opacity-0")
        }
        onClick={onClose}
      />

      {/* panel */}
      <aside
        className={
          "absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-xl transition-transform " +
          (open ? "translate-x-0" : "translate-x-full")
        }
        role="dialog"
        aria-label="Seu Pedido"
      >
        <div className="p-4 border-b flex items-center justify-between">
          <h2 className="text-lg font-bold">Seu Pedido</h2>
          <button
            type="button"
            aria-label="Fechar"
            onClick={onClose}
            className="p-2 rounded hover:bg-gray-100"
          >
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>

        {/* Conteúdo rolável */}
        <div className="p-4 overflow-y-auto h-[calc(100%-120px)]">
          {items.length === 0 ? (
            <div className="text-center text-gray-500 py-16">
              <p className="text-sm">Seu carrinho está vazio</p>
              <p className="text-xs">Adicione alguns pratos deliciosos!</p>
            </div>
          ) : (
            <ul className="space-y-3">
              {items.map((it) => (
                <li
                  key={it.id}
                  className="flex items-center justify-between border-b pb-2"
                >
                  <div>
                    <p className="font-medium">{it.name}</p>
                    <p className="text-sm text-gray-500">Qtd: {it.qty}</p>
                  </div>
                  <div className="text-right">
                    {typeof it.price === "number" && (
                      <span className="font-semibold">
                        R$ {(it.price * it.qty).toFixed(2)}
                      </span>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Rodapé fixo */}
        <div className="sticky bottom-0 border-t bg-white p-4 flex items-center justify-between gap-3">
          <div className="text-sm">
            <span className="text-gray-500">Subtotal</span>
            <br />
            <span className="text-lg font-bold">R$ {subtotal.toFixed(2)}</span>
          </div>
          <Link
            href="/pedidos"
            className="px-4 py-2 rounded-full bg-black text-white font-semibold"
            onClick={onClose}
          >
            Ir para checkout
          </Link>
        </div>
      </aside>
    </div>
  );
}
