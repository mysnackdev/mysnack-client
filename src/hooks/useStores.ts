"use client";
import { FoodStore } from "@/@types";
import { StoresService } from "@/services";
import { useCallback, useEffect, useRef, useState } from "react";

function normalizeStores(payload: any): FoodStore[] {
  if (!payload) return [];
  const candidates = [
    payload.lojas_de_alimentacao,
    payload.food_stores,
    payload.stores,
    payload.data?.lojas_de_alimentacao,
    payload.data?.food_stores,
    payload.data?.stores,
  ];
  const arr = candidates.find((c) => Array.isArray(c)) ?? [];
  const list: FoodStore[] = Array.isArray(arr) ? arr : [];
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
      } as any);

      const list = normalizeStores(data);
      if (mounted.current) setStores(list);
    } catch (e: any) {
      // ignorar abort
      if (e?.name === "AbortError") return;
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
