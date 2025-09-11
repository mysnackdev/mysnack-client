"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { CartDrawer, type CartItem } from "@/components/cart-drawer";
import { getAuth } from "firebase/auth";
import { useRouter } from "next/navigation";
import { OrderService } from "@/services/order.service";

/** Gerencia o carrinho via localStorage e escuta o evento custom "open-cart". */
export default function CartManager() {
  const [isOpen, setIsOpen] = useState(false);
  const [items, setItems] = useState<CartItem[]>([]);
  const [checkingOut, setCheckingOut] = useState(false);
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
    if (checkingOut || items.length === 0) return;
    setCheckingOut(true);
    try {
      const user = auth.currentUser;
      if (!user) {
        console.warn("User not authenticated");
        router.push("/login");
        return;
      }

      // Lê storeId do meta salvo pelo botão de adicionar
      let storeId = "";
      try {
        const metaRaw = localStorage.getItem("mysnack_cart_meta");
        const meta = metaRaw ? JSON.parse(metaRaw) : null;
        storeId = String(meta?.storeId || "");
      } catch {}

      // Monta payload
      const payloadItems = items.map((it) => ({
        id: String(it.id),
        name: String(it.name),
        price: Number(it.price),
        qty: Number(it.qty || 1),
      }));

      const { orderId } = await OrderService.createOrder({
        storeId,
        items: payloadItems,
      });

      // Limpa carrinho e abre página de pedidos
      localStorage.removeItem("mysnack_cart");
      localStorage.removeItem("mysnack_cart_meta");
      window.dispatchEvent(new Event("cart-updated"));
      setItems([]);
      setIsOpen(false);
      router.push("/orders#" + orderId);
    } catch (e) {
      console.error("Checkout error", e);
      alert("Não foi possível finalizar seu pedido. Tente novamente.");
    } finally {
      setCheckingOut(false);
    }
  }, [auth, checkingOut, items, router]);

  return (
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
  );
}
