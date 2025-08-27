export const ORDER_STATUS_FLOW = [
  "pedido realizado",
  "pedido confirmado",
  "pedido sendo preparado",
  "pedido pronto",
  "pedido indo até você",
  "pedido entregue",
] as const;

export type OrderStatus = (typeof ORDER_STATUS_FLOW)[number];

// Último status como constante reutilizável
export const FINAL_ORDER_STATUS = ORDER_STATUS_FLOW[ORDER_STATUS_FLOW.length - 1];
export type FinalOrderStatus = typeof FINAL_ORDER_STATUS;

// Type guard opcional (útil ao ler do DB)
export function isOrderStatus(value: string): value is OrderStatus {
  return (ORDER_STATUS_FLOW as readonly string[]).includes(value);
}

// Sobrecarga: aceita OrderStatus (estrito) ou string (retorna -1 se não existir)
export function statusIndex(status: OrderStatus): number;
export function statusIndex(status: string): number;
export function statusIndex(status: string): number {
  // Evita 'any' ampliando o array para readonly string[]
  return (ORDER_STATUS_FLOW as readonly string[]).indexOf(status);
}

export function isFinalStatus(status: string): boolean {
  return status === FINAL_ORDER_STATUS;
}
