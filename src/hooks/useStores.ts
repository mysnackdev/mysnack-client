"use client";

/** Item de combo/pacote oferecido por uma loja (como o app consome) */
export interface ComboItem {
  id: string;
  nome: string;
  preco: number;
  itens?: Array<{ nome: string; qtd: number }>;
  imagemUrl?: string;
}

import { useCallback, useEffect, useRef, useState } from "react";
import { StoreService, type GetFoodStoresResult } from "@/services/store.service";

/** Loja de alimentação (fonte de verdade para o app) */
export interface FoodStore {
  id: string;
  nome: string;
  categoria?: string;
  localizacao?: string;
  telefone?: string;
  contato?: string;
  /** combos/pacotes */
  pacotes?: ComboItem[];
  /** novos campos do backoffice/CF */
  pedidoMinimo?: number;
  horarios?: Record<string, { enabled: boolean; open: string; close: string }>;
  pagamentos?: {
    onDelivery?: string[];
    appSite?: string[];
    mysnackAwards?: string[];
    banking?: string[];
  };
  menus?: unknown;
  abertoAgora?: boolean;
  atualizadoEm?: number;
}

export interface UseStoresReturn {
  stores: FoodStore[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

type UnknownRecord = Record<string, unknown>;

function toStringOr<T extends string>(v: unknown, fallback: T): string {
  return typeof v === "string" ? v : fallback;
}
function toNumberOr(v: unknown, fallback = 0): number {
  return typeof v === "number" ? v : Number(v ?? fallback) || fallback;
}

/** ---- Type guard para o resultado do Cloud Functions ---- */
function isCFResult(p: unknown): p is GetFoodStoresResult {
  return !!p && typeof p === "object" && Array.isArray((p as { food_stores?: unknown }).food_stores);
}

/** utilitário: pega array de uma propriedade sem usar `any` */
function getArrayProp(obj: unknown, key: string): unknown[] {
  if (!obj || typeof obj !== "object") return [];
  const v = (obj as Record<string, unknown>)[key];
  return Array.isArray(v) ? v : [];
}

/** utilitário: pega string de uma propriedade sem usar `any` */
function getStringProp(obj: unknown, ...keys: string[]): string | undefined {
  if (!obj || typeof obj !== "object") return undefined;
  const rec = obj as Record<string, unknown>;
  for (const k of keys) {
    const v = rec[k];
    if (typeof v === "string") return v;
  }
  return undefined;
}

/** Gera um id estável quando o backend não manda id */
function makeIdFromName(name: string, idx: number): string {
  const slug = name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return `cf::${idx}::${slug || "loja"}`;
}

/** Converte **GetFoodStoresResult** (oficial do CF) -> modelo do app */
function normalizeFromCF(cf: GetFoodStoresResult): FoodStore[] {
  const stores: FoodStore[] = (cf.food_stores ?? []).map((raw, idx) => {
    const id = raw.id ?? makeIdFromName(raw.name, idx);
    const nome = raw.name || "Loja";
    const categoria = raw.category || undefined;

    // 'location' pode não existir no tipo; tenta alternativas conhecidas
    const localizacao =
      getStringProp(raw as unknown, "location") ??
      getStringProp(raw as unknown, "endereco") ??
      getStringProp(raw as unknown, "address");

    const telefone = raw.contact?.phone || undefined;
    const website = raw.contact?.website || undefined;

    // Combos podem vir como 'bundles' (novo) ou 'packages'/'pacotes'/'combos' em payloads antigos
    const srcCandidates: unknown[][] = [
      getArrayProp(raw as unknown, "bundles"),
      getArrayProp(raw as unknown, "packages"),
      getArrayProp(raw as unknown, "pacotes"),
      getArrayProp(raw as unknown, "combos"),
    ];
    const src =
      srcCandidates.find((arr) => arr.length > 0) ?? [];

    const pacotes: ComboItem[] = src.map((b, i) => {
      const rec = (b ?? {}) as UnknownRecord;
      return {
        id: toStringOr(rec["id"], `${id}::b${i}`),
        nome: toStringOr(rec["name"] ?? rec["nome"], "Combo"),
        preco: toNumberOr(rec["price"] ?? rec["preco"], 0),
        imagemUrl:
          typeof rec["image"] === "string"
            ? (rec["image"] as string)
            : typeof rec["imagemUrl"] === "string"
            ? (rec["imagemUrl"] as string)
            : undefined,
      };
    });

    return {
      id,
      nome,
      categoria,
      localizacao,
      telefone,
      contato: website,
      pacotes: pacotes.length ? pacotes : undefined,
    };
  });

  return stores.sort((a, b) => (a?.nome ?? "").localeCompare(b?.nome ?? ""));
}

/** Fallback robusto para formatos antigos (quando não vier GetFoodStoresResult) */
function normalizeLegacy(payload: unknown): FoodStore[] {
  const p = payload as UnknownRecord;

  const candidates = [
    (p["data"] as UnknownRecord | undefined)?.["food_stores"],
    p["food_stores"],
    p["lojas_de_alimentacao"],
    p["stores"],
  ];

  const arr = candidates.find((c) => Array.isArray(c)) as UnknownRecord[] | undefined;
  const list = Array.isArray(arr) ? arr : [];

  const stores = list.map((r, idx) => {
    const id = toStringOr(r["id"], makeIdFromName(toStringOr(r["nome"] ?? r["name"], "Loja"), idx));
    const nome = toStringOr(r["nome"] ?? r["name"], "Loja");
    const categoria =
      typeof r["categoria"] === "string"
        ? (r["categoria"] as string)
        : typeof r["category"] === "string"
        ? (r["category"] as string)
        : undefined;
    const localizacao =
      typeof r["localizacao"] === "string"
        ? (r["localizacao"] as string)
        : typeof r["location"] === "string"
        ? (r["location"] as string)
        : undefined;

    const contact = (r["contact"] ?? r["contato"]) as UnknownRecord | undefined;
    const telefone =
      typeof r["telefone"] === "string"
        ? (r["telefone"] as string)
        : contact && typeof contact["phone"] === "string"
        ? (contact["phone"] as string)
        : undefined;
    const website =
      contact && typeof contact["website"] === "string" ? (contact["website"] as string) : undefined;

    const src =
      (Array.isArray(r["pacotes"]) && (r["pacotes"] as UnknownRecord[])) ||
      (Array.isArray(r["packages"]) && (r["packages"] as UnknownRecord[])) ||
      (Array.isArray(r["bundles"]) && (r["bundles"] as UnknownRecord[])) ||
      (Array.isArray(r["combos"]) && (r["combos"] as UnknownRecord[])) ||
      [];

    const pacotes: ComboItem[] = src.map((b, i) => ({
      id: toStringOr(b["id"], `${id}::p${i}`),
      nome: toStringOr(b["nome"] ?? b["name"], "Combo"),
      preco: toNumberOr(b["preco"] ?? b["price"], 0),
      imagemUrl: typeof b["image"] === "string" ? (b["image"] as string) : undefined,
    }));

    return {
      id,
      nome,
      categoria,
      localizacao,
      telefone,
      contato: website,
      pacotes: pacotes.length ? pacotes : undefined,
    };
  });

  return stores.sort((a, b) => (a?.nome ?? "").localeCompare(b?.nome ?? ""));
}

/** Função de normalização pública — prioriza **GetFoodStoresResult** */
function normalizeStores(payload: GetFoodStoresResult | unknown): FoodStore[] {
  if (isCFResult(payload)) return normalizeFromCF(payload);
  return normalizeLegacy(payload);
}

export function useStores(): UseStoresReturn {
  const [stores, setStores] = useState<FoodStore[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const controllerRef = useRef<AbortController | null>(null);

  const doLoad = useCallback(async () => {
    controllerRef.current?.abort();
    controllerRef.current = new AbortController();

    try {
      setLoading(true);
      setError(null);

      // getStores() sem argumentos (compatível com sua service atual)
      const raw = await StoreService.getStores();

      setStores(normalizeStores(raw));
    } catch (e) {
      if (e instanceof Error && e.name === "AbortError") return;
      setError(e instanceof Error ? e.message : "Erro ao carregar lojas");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void doLoad();
    return () => controllerRef.current?.abort();
  }, [doLoad]);

  const refetch = useCallback(async () => {
    await doLoad();
  }, [doLoad]);

  return { stores, loading, error, refetch };
}
