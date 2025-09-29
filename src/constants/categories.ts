export const CATEGORY_SLUGS = [
  "lanches",
  "japonesa",
  "pizza",
  "doces",
  "salgados",
  "saudavel",
  "bebidas"
] as const;

export type CategorySlug = typeof CATEGORY_SLUGS[number];

export const CATEGORY_LABELS: Record<CategorySlug, string> = {
  lanches: "Lanches",
  japonesa: "Japonesa",
  pizza: "Pizza",
  doces: "Doces",
  salgados: "Salgados",
  saudavel: "Saudável",
  bebidas: "Bebidas",
};
