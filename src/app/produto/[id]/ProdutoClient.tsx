"use client";

import React from "react";
import {
  getFunctions,
  httpsCallable,
  type HttpsCallableResult,
} from "firebase/functions";

/** ===== Tipos compatíveis com a Cloud Function getFoodStores ===== */
interface CFContactInfo {
  phone?: string | null;
  website?: string | null;
}

interface CFBundle {
  id?: string;
  name: string;
  description?: string;
  price: number;
  image?: string;
}

interface CFFoodStore {
  id?: string;
  name: string;
  category?: string;
  contact: CFContactInfo;
  bundles?: CFBundle[]; // compat legado
}

interface GetFoodStoresResult {
  mall: string | null;
  city: string | null;
  state: string | null;
  food_stores: CFFoodStore[];
}

/** ===== Tipos locais do componente ===== */
interface ProdutoClientProps {
  id: string;
}

interface ProductViewModel {
  id: string;
  title: string;
  description?: string;
  price?: number;
  image?: string;
  storeName?: string;
}

/** ===== Utilitários ===== */
function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFD")
    // remove diacríticos
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function parseCompositeId(rawId: string): {
  source: "cf" | "unknown";
  storeSlug?: string;
  bundleKey?: string;
} {
  // Ex.: "cf::1::mcdonald-s::b3"
  if (rawId.startsWith("cf::")) {
    const parts = rawId.split("::"); // ["cf", "1", "mcdonald-s", "b3"]
    return {
      source: "cf",
      storeSlug: parts[2],
      bundleKey: parts[3],
    };
  }
  return { source: "unknown" };
}

async function fetchStores(): Promise<GetFoodStoresResult> {
  const region =
    process.env.NEXT_PUBLIC_FIREBASE_FUNCTIONS_REGION ?? undefined;
  const functions = getFunctions(undefined, region);
  const callable = httpsCallable<unknown, GetFoodStoresResult>(
    functions,
    "getFoodStores",
  );
  const res: HttpsCallableResult<GetFoodStoresResult> = await callable();
  return res.data;
}

function resolveProductFromStores(
  compositeId: string,
  data: GetFoodStoresResult,
): ProductViewModel | null {
  const parsed = parseCompositeId(compositeId);

  if (parsed.source === "cf") {
    const { storeSlug, bundleKey } = parsed;

    // Encontrar a loja por slug do nome
    const store =
      data.food_stores.find(
        (s) => slugify(s.name ?? "") === (storeSlug ?? ""),
      ) ?? null;

    if (!store) return null;

    // Se houver bundles, tentar mapear pelo bundleKey (ex.: "b3" -> índice 2)
    if (store.bundles && store.bundles.length > 0) {
      let bundle: CFBundle | undefined;

      if (bundleKey && /^b[0-9]+$/i.test(bundleKey)) {
        const index = Number(bundleKey.slice(1)) - 1; // b1 -> 0
        if (index >= 0 && index < store.bundles.length) {
          bundle = store.bundles[index];
        }
      }

      // fallback: tentar por id literal
      if (!bundle && bundleKey) {
        bundle = store.bundles.find((b) => b.id === bundleKey);
      }

      // último fallback: primeiro bundle
      if (!bundle) bundle = store.bundles[0];

      if (bundle) {
        return {
          id: compositeId,
          title: bundle.name,
          description: bundle.description,
          price: bundle.price,
          image: bundle.image,
          storeName: store.name,
        };
      }
    }

    // Sem bundles — ainda assim retornar uma visão básica da loja
    return {
      id: compositeId,
      title: store.name,
      storeName: store.name,
    };
  }

  // Source desconhecida: retornar apenas o ID
  return {
    id: compositeId,
    title: "Produto",
  };
}

/** ===== Componente ===== */
export default function ProdutoClient({ id }: ProdutoClientProps) {
  const [loading, setLoading] = React.useState<boolean>(true);
  const [error, setError] = React.useState<string | null>(null);
  const [product, setProduct] = React.useState<ProductViewModel | null>(null);

  React.useEffect(() => {
    let isMounted = true;

    async function run() {
      setLoading(true);
      setError(null);
      try {
        const stores = await fetchStores();
        if (!isMounted) return;

        const vm = resolveProductFromStores(id, stores);
        setProduct(vm);
      } catch {
        // antes era: catch (e) { ... } -> 'e' não era usado
        setError("Falha ao carregar o produto.");
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    run();
    return () => {
      isMounted = false;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="p-6">
        <div className="h-6 w-40 animate-pulse rounded bg-zinc-200" />
        <div className="mt-4 h-4 w-72 animate-pulse rounded bg-zinc-200" />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="p-6">
        <h1 className="text-xl font-semibold text-zinc-900">
          Produto não encontrado
        </h1>
        <p className="mt-1 text-sm text-zinc-600">
          {error ?? "Verifique o identificador do produto."}
        </p>
        <div className="mt-4 rounded-lg border bg-white p-4 text-sm text-zinc-700">
          ID: <code className="text-zinc-900">{id}</code>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-4 text-sm text-zinc-500">
        {product.storeName ? `Loja: ${product.storeName}` : "Produto"}
      </div>

      <h1 className="text-3xl font-bold tracking-tight text-zinc-900">
        {product.title}
      </h1>

      {product.description ? (
        <p className="mt-2 max-w-2xl text-zinc-700">{product.description}</p>
      ) : null}

      <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-[280px,1fr]">
        <div className="rounded-xl border bg-white p-4">
          <div className="aspect-square w-full rounded-lg bg-zinc-100 grid place-items-center">
            {product.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={product.image}
                alt={product.title}
                className="h-full w-full object-cover rounded-lg"
              />
            ) : (
              <span className="text-4xl">🍔</span>
            )}
          </div>
        </div>

        <div className="rounded-xl border bg-white p-4">
          <div className="text-xl font-semibold text-zinc-900">
            {product.title}
          </div>
          {typeof product.price === "number" ? (
            <div className="mt-2 text-2xl font-bold text-zinc-900">
              {product.price.toLocaleString("pt-BR", {
                style: "currency",
                currency: "BRL",
              })}
            </div>
          ) : null}

          <button
            type="button"
            className="mt-6 rounded-lg bg-rose-600 px-4 py-2 text-white hover:bg-rose-700"
            onClick={() => {
              // aqui você pode integrar ao carrinho
            }}
          >
            Adicionar ao carrinho
          </button>
        </div>
      </div>

      <div className="mt-8 text-xs text-zinc-400">
        ID: <code className="text-zinc-600">{product.id}</code>
      </div>
    </div>
  );
}
