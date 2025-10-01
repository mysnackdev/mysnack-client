"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import HelpCenter from "@/components/help/HelpCenter";
import OnboardingInitializer from "@/components/onboarding/OnboardingInitializer";
import type { CartItem } from "@/@types/cart";
import { CartDrawer } from "@/components/cart-drawer";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { subscribeUserOrders, type MirrorOrder } from "@/services/orders.mirror.service";
import { useRouter } from "next/navigation";

/** API para outros componentes adicionarem itens ao carrinho */
export function addItems(items: CartItem[]) {
  try {
    const raw = localStorage.getItem("mysnack_cart");
    const arr: CartItem[] = raw ? JSON.parse(raw) : [];
    // Merge por id; soma qty
    for (const it of items) {
      const id = String(it.id);
      const qty = Number(it.qty ?? it.quantity ?? 1);
      const price = Number(it.price ?? 0);
      const name = String(it.name ?? "");
      const found = arr.find((x) => x.id === id);
      if (found) {
        found.qty = Number(found.qty || 0) + qty;
        // mantém price/name existentes; não sobrescreve se vier vazio
        if (!found.name && name) found.name = name;
        if (!found.price && price) found.price = price;
      } else {
        arr.push({ id, name, price, qty });
      }
    }
    localStorage.setItem("mysnack_cart", JSON.stringify(arr));
    window.dispatchEvent(new Event("cart-updated"));
    window.dispatchEvent(new Event("open-cart"));
  } catch (e) {
    console.error("CartManager.addItems failed", e);
  }
}



/** Gerencia o carrinho via localStorage e escuta o evento custom "open-cart". */
export default function CartManager() {
  const [isOpen, setIsOpen] = useState(false);
  const [items, setItems] = useState<CartItem[]>([]);
    const mounted = useRef(false);
  const router = useRouter();
  const auth = getAuth();

  // Carrega itens do localStorage
  const load = useCallback(() => {
    try {
      const raw = localStorage.getItem("mysnack_cart");
      const arr: CartItem[] = raw ? JSON.parse(raw) : [];
      setItems(Array.isArray(arr) ? arr.filter(Boolean) : []);
    } catch {
      setItems([]);
    }
  }, []);

  // Salva itens no localStorage
  const save = useCallback((arr: CartItem[]) => {
    try {
      localStorage.setItem("mysnack_cart", JSON.stringify(arr));
    } catch {
      /* noop */
    }
  }, []);

  useEffect(() => {
    if (mounted.current) return;
    mounted.current = true;

    load();

    // Evento custom para abrir o carrinho
    const handleOpenCart = (_e: Event) => {
      console.log("CartManager: open-cart event received", _e);
      setIsOpen(true);
    };
    window.addEventListener("open-cart", handleOpenCart);

    // Evento para quando algum componente atualizar o carrinho
    const handleCartUpdated = () => {
      try {
        const raw = localStorage.getItem("mysnack_cart");
        const parsed = raw ? JSON.parse(raw) : [];
        setItems(Array.isArray(parsed) ? parsed : []);
        setIsOpen(true);
      } catch {}
    };
    window.addEventListener("cart-updated", handleCartUpdated);

    // Sincroniza com alterações do localStorage em outras abas
    const handleStorage = (e: StorageEvent) => {
      if (e.key === "mysnack_cart") load();
    };
    window.addEventListener("storage", handleStorage);

    return () => {
      window.removeEventListener("open-cart", handleOpenCart);
      window.removeEventListener("cart-updated", handleCartUpdated);
      window.removeEventListener("storage", handleStorage);
    };
  }, [load]);

  const onRemoveItem = useCallback(
    (id: string) => {
      setItems((prev) => {
        const next = prev.filter((x) => x.id !== id);
        save(next);
        return next;
      });
    },
    [save]
  );

  const onClose = useCallback(() => setIsOpen(false), []);

  // Altera a quantidade (remove se qty <= 0)
  const onChangeQty = useCallback(
    (id: string, qty: number) => {
      setItems((prev) => {
        const next = prev
          .map((it) => (it.id === id ? { ...it, qty } : it))
          .filter((it) => (it.qty || 0) > 0);
        save(next);
        return next;
      });
    },
    [save]
  );

  // Finaliza o pedido
  const onCheckout = useCallback(async () => {
    // Apenas navega para /checkout (fluxo multi-passos)
    const u = auth.currentUser;
    if (!u?.uid) {
      try { alert('Faça login para finalizar seu pedido.'); } catch {}
      router.push('/auth'); // aponta para sua área de login existente
      return;
    }
    setIsOpen(false);
    router.push('/checkout');
  }, [auth, router]);

  
  // --- Limpa o drawer quando um pedido for CONCLUÍDO (entregue) ou CANCELADO — apenas no front ---
  useEffect(() => {
    const auth = getAuth();
    let unsub: (() => void) | null = null;
    let offAuth: (() => void) | null = null;

    function clearCartFront(reason: string, orderKey: string) {
      try {
        setItems([]);
        save([]);
        setIsOpen(false);
        const seenRaw = localStorage.getItem("mysnack:cleared_orders") || "[]";
        const seen: string[] = JSON.parse(seenRaw);
        if (!seen.includes(orderKey)) {
          seen.push(orderKey);
          localStorage.setItem("mysnack:cleared_orders", JSON.stringify(seen));
        }
        console.debug("[Cart] cleared due to order:", reason, orderKey);
      } catch {}
    }

    function watch(uid: string) {
      (async () => {
        unsub = await subscribeUserOrders(uid, (orders) => {
          try {
            const seen: string[] = JSON.parse(localStorage.getItem("mysnack:cleared_orders") || "[]");
            const finals = orders.filter(o => {
              const s = String(o.status || "").toLowerCase();
              return s.includes("entregue") || s.includes("cancelado") || o.cancelled === true;
            });
            const target = finals.find(o => !seen.includes(o.key));
            if (target) clearCartFront(String(target.status || "final"), target.key);
          } catch (e) {
            console.warn("[Cart] watch orders failed:", e);
          }
        });
      })();
    }

    const u = auth.currentUser?.uid;
    if (u) watch(u);
    offAuth = onAuthStateChanged(auth, user => {
      if (user?.uid) watch(user.uid);
    });

    return () => { try { unsub?.(); offAuth?.(); } catch {} };
  }, [save]);
return (
    <>
      <OnboardingInitializer />
      <HelpCenter />
      <CartDrawer
      isOpen={isOpen}
      items={items}
      onClose={onClose}
      onRemoveItem={onRemoveItem}
      onChangeQty={onChangeQty}
      // CartDrawer tipa onCheckout como () => void; usamos um wrapper para a função async
      onCheckout={() => {
        void onCheckout();
      }}
    />
    </>
  );
}
