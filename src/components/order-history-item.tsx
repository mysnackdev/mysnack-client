"use client";

import React from "react";

type Props = {
  brand: string;
  statusDotColor?: string; // ex: "bg-emerald-500"
  statusText: string;      // ex: "Pedido concluído"
  orderNo: string;         // ex: "4883"
  dateLabel: string;       // ex: "Sex. 11 julho 2025"
  itemTitle: string;
  price: number;
  onReorder: () => void;
};

const brl = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  minimumFractionDigits: 2,
});

export default function OrderHistoryItem({
  brand,
  statusDotColor = "bg-emerald-500",
  statusText,
  orderNo,
  dateLabel,
  itemTitle,
  price,
  onReorder,
}: Props) {
  return (
    <div className="rounded-2xl border bg-white shadow-sm overflow-hidden">
      <div className="px-4 pt-4 text-sm text-muted-foreground">{dateLabel}</div>
      <div className="p-4 flex gap-3 items-start">
        <div className="w-10 h-10 rounded-full bg-gray-200 shrink-0" />
        <div className="flex-1">
          <div className="font-semibold">{brand}</div>

          <div className="mt-1 text-sm text-muted-foreground">
            <span
              className={`inline-block w-2 h-2 rounded-full mr-2 align-middle ${statusDotColor}`}
            />
            {statusText} · Nº {orderNo}
          </div>

          <div className="mt-2 text-sm">{itemTitle}</div>
        </div>

        <div className="flex flex-col items-end gap-2">
          <button
            onClick={onReorder}
            className="px-3 py-1.5 text-sm rounded-lg bg-rose-500 text-white font-semibold hover:opacity-90"
          >
            Pedir Novamente
          </button>
          <div className="text-sm text-muted-foreground">
            {brl.format(price)}
          </div>
        </div>
      </div>
    </div>
  );
}
