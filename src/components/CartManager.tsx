"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { CartDrawer, type CartItem } from "@/components/cart-drawer";
import { OrderService } from "@/services/order.service";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";

/** Simple, localStorage-backed cart manager that also listens for `open-cart` events */
export default function CartManager() {
  const [isOpen, setIsOpen] = useState(false);
  const [items, setItems] = useState<CartItem[]>([]);
  const [checkingOut, setCheckingOut] = useState(false);
  const mounted = useRef(false);
  const router = useRouter();
  const auth = getAuth();

  // Load items from localStorage
  const load = useCallback(() => {
    try {
      const raw = localStorage.getItem("mysnack_cart");
      const arr: CartItem[] = raw ? JSON.parse(raw) : [];
      setItems(arr.filter(Boolean));
    } catch {
      setItems([]);
    }
  }, []);

  const save = useCallback((arr: CartItem[]) => {
    try {
      localStorage.setItem("mysnack_cart", JSON.stringify(arr));
    } catch {}
  }, []);

  useEffect(() => {
    if (mounted.current) return;
    mounted.current = true;
    load();
    const open = () => setIsOpen(true);
    window.addEventListener("open-cart", open as any);
    const storageListener = (e: StorageEvent) => {
      if (e.key === "mysnack_cart") load();
    };
    window.addEventListener("storage", storageListener);
    return () => {
      window.removeEventListener("open-cart", open as any);
      window.removeEventListener("storage", storageListener);
    };
  }, [load]);

  const onRemoveItem = useCallback((id: string) => {
    const next = items.filter((x) => x.id !== id);
    setItems(next);
    save(next);
  }, [items, save]);

  const onClose = useCallback(() => setIsOpen(false), []);

  const onCheckout = useCallback(async () => {
    if (items.length === 0 || checkingOut) return;
    setCheckingOut(true);
    try {
      // Ensure we have a user (anonymous is fine)
      const user = auth.currentUser;
      if (!user) { console.warn('User not authenticated'); return; }
      const uid = user?.uid;
      if (!uid) throw new Error("Falha na autenticação anônima");

      // Build order payload
      const orderItems = items.map((it) => ({
        id: it.id,
        name: it.name,
        qty: it.qty,
        price: it.price,
        subtotal: (it.qty ?? 1) * (it.price ?? 0),
      }));

      const total = orderItems.reduce((sum, it) => sum + (it.subtotal ?? 0), 0);

      const orderId = await OrderService.createOrder({
        uid,
        nome: user.displayName || `Cliente ${uid.slice(-5)}`,
        items: orderItems,
        subtotal: total,
        total,
        status: "pedido realizado",
      });

      // Clear cart
      setItems([]);
      save([]);
      setIsOpen(false);

      // Take user to orders screen
      router.push("/orders");
    } catch (err) {
      console.error(err);
      alert("Não foi possível finalizar seu pedido. Tente novamente.");
    } finally {
      setCheckingOut(false);
    }
  }, [items, auth, checkingOut, save, router]);

  return (
    <CartDrawer
      isOpen={isOpen}
      items={items}
      onClose={onClose}
      onRemoveItem={onRemoveItem}
      onCheckout={onCheckout}
    />
  );
}
