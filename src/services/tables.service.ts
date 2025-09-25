import { getShoppingForStore } from "./shopping.service";

export type DeliveryPlace = {
  mode: "inhouse";
  type: "table";
  shoppingSlug: string;
  shoppingName?: string;
  tableId: string;
  tableName?: string;
  mocked?: boolean;
};

export async function mockSelectTable(storeId: string): Promise<DeliveryPlace> {
  const { shoppingSlug, shoppingName } = await getShoppingForStore(storeId);
  return {
    mode: "inhouse",
    type: "table",
    shoppingSlug,
    shoppingName,
    tableId: "MESA-TESTE-01",
    tableName: "Mesa de teste",
    mocked: true,
  };
}
