export const ORDER_STATUS_FLOW = [
  "pedido realizado",
  "pedido confirmado",
  "pedido sendo preparado",
  "pedido pronto",
  "pedido indo até você",
  "pedido entregue",
] as const;

export type OrderStatus = (typeof ORDER_STATUS_FLOW)[number];

export const FINAL_ORDER_STATUS = ORDER_STATUS_FLOW[ORDER_STATUS_FLOW.length - 1];

function normalize(s: string): string {
  try {
    return String(s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").trim();
  } catch {
    return String(s || "").toLowerCase().trim();
  }
}

export function isFinalStatus(status: string): boolean {
  const n = normalize(status);
  return n === "pedido entregue" || n === "pedido concluido";
}

export function isCanceledStatus(status: string): boolean {
  const n = normalize(status);
  return n.includes("cancel"); // cobre "pedido cancelado", "cancelada", etc.
}

export function statusIndex(status: string): number {
  const i = (ORDER_STATUS_FLOW as readonly string[]).indexOf(status);
  if (i >= 0) return i;
  // tentativa com normalização simples
  const n = normalize(status);
  const map: Record<string, number> = {
    "pedido realizado": 0,
    "pedido confirmado": 1,
    "pedido sendo preparado": 2,
    "pedido pronto": 3,
    "pedido indo ate voce": 4,
    "pedido entregue": 5,
  };
  return typeof map[n] === "number" ? map[n] : 0;
}
