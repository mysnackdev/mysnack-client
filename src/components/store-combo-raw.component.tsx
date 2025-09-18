import { FoodStoreCombo } from "@/@types";

export const StoreComboRaw = ({ combo }: { combo: FoodStoreCombo }) => {
  const price = combo.preco.toLocaleString("pt-BR", {
    currency: "BRL",
    style: "currency",
  });


  const onOrderNow = async () => {
    try {
      const { getAuth } = await import("firebase/auth");
      const { OrderService } = await import("@/services/order.service");
      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) { console.warn('User not authenticated'); return; }
      const uid = user?.userId as string;
      await OrderService.createOrder({
        uid,
        nome: user?.displayName || `Cliente ${uid.slice(-5)}`,
        items: [{ id: combo.nome, name: combo.nome, qty: 1, price: combo.preco, subtotal: combo.preco }],
        subtotal: combo.preco,
        total: combo.preco,
        status: "pedido realizado",
      });
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("toast", { detail: { title: "Pedido realizado!", body: combo.nome } }));
      }
    } catch {
      alert("Não foi possível criar seu pedido agora.");
    }
  };

  return (
    <div className="border-t border-primary-100 pt-3 mb-3">
      <div className="flex justify-between">
        <p className="mb-1">{combo.nome}</p>
        <p className="font-bold">{price}</p>
      </div>
      <p className="text-xs">{combo.descricao}</p>
      <button onClick={onOrderNow} className="mt-2 w-full rounded-md bg-black px-4 py-2 text-white font-semibold">Pedir agora</button>
    </div>
  );
};