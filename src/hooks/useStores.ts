"use client";
import { FoodStore } from "@/@types";
import { StoresService } from "@/services";
import { useCallback, useEffect, useRef, useState } from "react";

function normalizeStores(payload: unknown): FoodStore[] {
  if (!payload) return [];
  const p = payload as {
    lojas_de_alimentacao?: unknown;
    food_stores?: unknown;
    stores?: unknown;
    data?: {
      lojas_de_alimentacao?: unknown;
      food_stores?: unknown;
      stores?: unknown;
    };
  };

  const candidates: Array<unknown | undefined> = [
    p.lojas_de_alimentacao,
    p.food_stores,
    p.stores,
    p.data?.lojas_de_alimentacao,
    p.data?.food_stores,
    p.data?.stores,
  ];

  const arr = candidates.find((c): c is unknown[] => Array.isArray(c)) ?? [];
  const list: FoodStore[] = Array.isArray(arr) ? (arr as FoodStore[]) : [];

  // opcional: ordenação por nome para UI consistente
  return [...list].sort((a, b) => (a?.nome ?? "").localeCompare(b?.nome ?? ""));
}

export const useStores = () => {
  const [stores, setStores] = useState<FoodStore[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const mounted = useRef(true);
  const controllerRef = useRef<AbortController | null>(null);

  const fetchStores = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      controllerRef.current?.abort();
      controllerRef.current = new AbortController();

      const data = await StoresService.getStores({
        signal: controllerRef.current.signal, // se o service aceitar signal
      } as { signal?: AbortSignal });

      const list = normalizeStores(data);
      if (mounted.current) setStores(list);
    } catch (e: unknown) {
      // ignorar abort
      const isAbort =
        (e instanceof DOMException && e.name === "AbortError") ||
        (typeof e === "object" && e !== null && "name" in e && (e as { name?: string }).name === "AbortError");

      if (isAbort) return;

      console.error(e);
      if (mounted.current) setError("Erro ao carregar informações");
    } finally {
      if (mounted.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    mounted.current = true;
    fetchStores();
    return () => {
      mounted.current = false;
      controllerRef.current?.abort();
    };
  }, [fetchStores]);

  return { stores, loading, error, refetch: fetchStores };
};
