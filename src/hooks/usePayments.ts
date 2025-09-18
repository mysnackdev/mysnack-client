import { useEffect, useState } from "react";
import { PaymentsService, type PaymentsData, type Card } from "@/services/payments.service";
import { useAuth } from "@/hooks";

export const usePayments = () => {
  const { user } = useAuth();
  const [data, setData] = useState<PaymentsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.userId) { setData(null); setLoading(false); return; }
    setLoading(true);
    const unsub = PaymentsService.subscribe(user.uid, (x) => { setData(x); setLoading(false); });
    return () => unsub && unsub();
  }, [user?.userId]);

  const addCard = (card: Card) => {
    const next: PaymentsData = { balance: data?.balance ?? 0, cards: [...(data?.cards ?? []), card] };
    if (user?.userId) PaymentsService.replace(user.uid, next);
  };

  return { data, loading, addCard };
};