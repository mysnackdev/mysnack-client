import { FoodStoreCombo } from "@/@types";

export const StoreComboRaw = ({ combo }: { combo: FoodStoreCombo }) => {
  const price = combo.preco.toLocaleString("pt-BR", {
    currency: "BRL",
    style: "currency",
  });

  return (
    <div className="border-t border-primary-100 pt-3 mb-3">
      <div className="flex justify-between">
        <p className="mb-1">{combo.nome}</p>
        <p className="font-bold">{price}</p>
      </div>
      <p className="text-xs">{combo.descricao}</p>
    </div>
  );
};