import { useStores } from "@/hooks";
import { StoreCard } from "./store-card.component";

export const Stores = () => {
  const { stores, loading } = useStores();

  return (
    <div>
      {loading ? (
        <div className="flex justify-center items-center h-dvh">
          <p>Carregando</p>
        </div>
      ) : stores && stores.length ? (
        stores.map((store, index) => <StoreCard key={index} store={store} />)
      ) : (
        <div className="flex justify-center items-center h-dvh">
          <p>Nenhuma loja encontrada</p>
        </div>
      )}
    </div>
  );
};