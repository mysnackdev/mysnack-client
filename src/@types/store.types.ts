export type Store = {
  cidade: string;
  estado: string;
  shopping: string;
  lojas_de_alimentacao: FoodStore[];
};

export type FoodStore = {
  categoria: string;
  localizacao: string;
  nome: string;
  contato: StoreContact;
  pacotes: FoodStoreCombo[];
  online?: boolean;
};

export type StoreContact = {
  site: string;
  telefone: string;
};

export type FoodStoreCombo = {
  descricao: string;
  nome: string;
  preco: number;
};