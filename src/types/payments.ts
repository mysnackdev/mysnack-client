
// src/types/payments.ts
export type UserCard = {
  id: string;
  brand?: string;
  last4: string;
  expMonth?: number;
  expYear?: number;
  holder?: string;
  tokenRef?: string;
};
