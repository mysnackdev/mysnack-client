// src/services/mockTable.ts
"use client";

import type { ShoppingInfo } from "./shoppings";
import { getShoppingByStoreId } from "./shoppings";

export type QrResult = {
  kind: "table";
  shoppingSlug: string;
  shoppingName?: string;
  tableId: string;
  tableLabel?: string;
  source: "mock";
  ts: number;
};

export async function mockSelectTable(storeId: string): Promise<QrResult> {
  const shopping: ShoppingInfo | null = await getShoppingByStoreId(storeId);

  if (!shopping?.slug) {
    throw new Error("Não foi possível identificar o shopping desta loja para mockar a mesa.");
  }

  const tableId = `BYPASS-${storeId.slice(0, 6).toUpperCase()}`;
  const result: QrResult = {
    kind: "table",
    shoppingSlug: shopping.slug,
    shoppingName: shopping.name,
    tableId,
    tableLabel: "Mesa de Teste",
    source: "mock",
    ts: Date.now(),
  };

  try {
    localStorage.setItem("mysnack:lastQr", JSON.stringify(result));
  } catch {
    // SSR ou storage indisponível
  }

  return result;
}


export type CheckoutQr = { raw: string; mallId?: string; table?: string };

/** Versão compatível com o QrScannerDialog/QrResult do checkout */
export async function mockSelectTableForCheckout(storeId: string): Promise<CheckoutQr> {
  const shopping = await getShoppingByStoreId(storeId);
  if (!shopping?.slug) {
    throw new Error("Não foi possível identificar o shopping desta loja para mockar a mesa.");
  }
  const tableId = `BYPASS-${storeId.slice(0, 6).toUpperCase()}`;
  const res: CheckoutQr = {
    raw: `mock:m=${shopping.slug};t=${tableId}`,
    mallId: shopping.slug,
    table: tableId,
  };
  try {
    localStorage.setItem("mysnack:lastQr", JSON.stringify(res));
  } catch {}
  return res;
}
