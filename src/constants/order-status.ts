export const ORDER_STATUS_FLOW = [
  "pedido realizado",
  "pedido confirmado",
  "pedido sendo preparado",
  "pedido pronto",
  "pedido indo até você",
  "pedido entregue",
] as const;

export type OrderStatus = typeof ORDER_STATUS_FLOW[number];

export function statusIndex(status: string): number {
  return ORDER_STATUS_FLOW.indexOf(status as any);
}

export function isFinalStatus(status: string): boolean {
  return status === ORDER_STATUS_FLOW[ORDER_STATUS_FLOW.length - 1];
}
