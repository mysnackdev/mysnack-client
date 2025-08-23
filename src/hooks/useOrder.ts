"use client";

import * as React from "react";
import { auth } from "@/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { OrderService, type SnackOrder, type SnackOrderItem } from "@/services/order.service";

/** Rotas que o componente Order pode renderizar */
export type OrderRoute = "idle" | "login" | "send_password_reset_email" | "register" | "order";

export interface UseOrderApi {
  // estado geral (flutuante/modal)
  isModalVisible: boolean;
  handleInitOrder: () => void;
  handleCloseModal: () => void;

  // estado para o OrderForm
  showForm: boolean;            // true quando currentRoute === "order"
  userName: string;
  statusText: string;
  currentRoute: OrderRoute;

  // ações usadas nos formulários
  handleChangeName: (name: string) => void;
  handleCreateOrder: (e?: React.FormEvent<HTMLFormElement>) => Promise<void>;
  handleCurrentRoute: (route: OrderRoute) => void;
}

/** Mapeia rota -> texto de status mostrado no formulário */
function routeToStatus(r: OrderRoute): string {
  switch (r) {
    case "login": return "Entre para fazer seu pedido";
    case "register": return "Crie sua conta para continuar";
    case "send_password_reset_email": return "Recupere sua senha";
    case "order": return "Preencha os dados do pedido";
    case "idle":
    default: return "Pronto para começar";
  }
}

/** Lê itens a partir do 'reorder' salvo localmente (quando o usuário clica em Repetir) */
function readLastReorder(): SnackOrderItem[] {
  try {
    const raw = localStorage.getItem("mysnack_last_reorder");
    const arr = raw ? (JSON.parse(raw) as SnackOrderItem[]) : [];
    if (Array.isArray(arr)) return arr.filter(Boolean);
  } catch {
    /* noop */
  }
  return [];
}

/** Soma o total de itens */
function calcTotal(items: SnackOrderItem[]): number {
  return items.reduce((acc, it) => acc + Number(it.price || 0) * Number(it.qty || 0), 0);
}

export function useOrder(): UseOrderApi {
  const [isModalVisible, setIsModalVisible] = React.useState<boolean>(false);
  const [currentRoute, setCurrentRoute] = React.useState<OrderRoute>("idle");
  const [userName, setUserName] = React.useState<string>("");
  const [uid, setUid] = React.useState<string | null>(auth.currentUser?.uid ?? null);

  // Pré-carrega nome do usuário autenticado
  React.useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      setUid(user?.uid ?? null);
      if (user?.displayName) setUserName(user.displayName);
    });
    return () => unsub();
  }, []);

  const showForm = currentRoute === "order";
  const statusText = routeToStatus(currentRoute);

  /** Abre o modal e decide rota inicial (login ou order) */
  const handleInitOrder = React.useCallback(() => {
    setIsModalVisible(true);
    setCurrentRoute(uid ? "order" : "login");
  }, [uid]);

  const handleCloseModal = React.useCallback(() => {
    setIsModalVisible(false);
    setCurrentRoute("idle");
  }, []);

  const handleChangeName = React.useCallback((name: string) => {
    setUserName(name);
  }, []);

  const handleCurrentRoute = React.useCallback((route: OrderRoute) => {
    setCurrentRoute(route);
  }, []);

  /** Cria um pedido simples no RTDB (compatível com o OrderService atual) */
  const handleCreateOrder = React.useCallback(
    async (e?: React.FormEvent<HTMLFormElement>) => {
      if (e) e.preventDefault();
      const userId = uid;
      if (!userId) {
        setCurrentRoute("login");
        return;
      }

      // monta itens: usa "repetir" se existir; senão, um item simbólico
      const items = readLastReorder();
      const safeItems: SnackOrderItem[] =
        items.length > 0
          ? items
          : [{ name: "Pedido MySnack", qty: 1, price: 0 }];

      const order: Omit<SnackOrder, "key"> = {
        brand: "MySnack",
        items: safeItems,
        total: calcTotal(safeItems),
        status: "waiting for acceptance",
        createdAt: Date.now(),
      };

      try {
        await OrderService.createOrder(userId, order);
        // fecha modal e limpa “reorder”
        try {
          localStorage.removeItem("mysnack_last_reorder");
        } catch { /* noop */ }
        setIsModalVisible(false);
        setCurrentRoute("idle");
      } catch (err) {
        // mantém o modal aberto para o usuário tentar novamente
        console.error("Não foi possível criar o pedido:", err);
      }
    },
    [uid],
  );

  return {
    isModalVisible,
    handleInitOrder,
    handleCloseModal,

    showForm,
    userName,
    statusText,
    currentRoute,

    handleChangeName,
    handleCreateOrder,
    handleCurrentRoute,
  };
}
