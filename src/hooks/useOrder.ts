"use client";

import { useCallback, useEffect, useState } from "react";
import { OrderService } from "@/services";
import { auth } from "@/firebase";
import { onAuthStateChanged, type User } from "firebase/auth";
import type { DataSnapshot } from "firebase/database";

export type RouteKey = "login" | "send_password_reset_email" | "register" | "order";

export type UseOrderReturn = {
  isModalVisible: boolean;
  handleInitOrder: () => void;
  handleCloseModal: () => void;

  userName: string;
  statusText: string;
  showForm: boolean;
  handleChangeName: (value: string) => void;
  handleCreateOrder: (event: React.FormEvent<Element>) => void;

  currentRoute: RouteKey;
  handleCurrentRoute: (route: RouteKey) => void;
};

export const useOrder = (): UseOrderReturn => {
  const [statusText, setStatusText] = useState<string>("");
  const [userName, setUserName] = useState<string>("");
  const [showForm, setShowForm] = useState<boolean>(true);

  // visibilidade do modal
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);

  // rota inicial baseada no auth atual
  const [currentRoute, setCurrentRoute] = useState<RouteKey>(
    auth.currentUser ? "order" : "login"
  );

  // Observa mudanças de autenticação e ajusta rota
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user: User | null) => {
      setCurrentRoute(user ? "order" : "login");
    });
    return () => unsub();
  }, []);

  const handleCurrentRoute = (route: RouteKey) => setCurrentRoute(route);

  // Assinatura que o OrderForm espera: (event: FormEvent<Element>) => void
  const handleCreateOrder = (event: React.FormEvent<Element>) => {
    event.preventDefault();

    // roda a parte assíncrona mas mantém retorno void
    void (async () => {
      try {
        if (!userName.trim()) {
          setStatusText("Digite seu nome para fazer o pedido.");
          return;
        }

        const orderKey = await OrderService.createOrder(userName);
        setStatusText("Status do seu pedido: AGUARDANDO ACEITE");

        if (orderKey) {
          setShowForm(false);
          handleTrackOrder(orderKey);
          setUserName("");
        }
      } catch (error: unknown) {
        const message =
          error instanceof Error ? error.message : "Erro ao criar pedido.";
        setStatusText(message);
      }
    })();
  };

  const handleChangeName = (value: string) => setUserName(value);

  const handleTrackOrder = (key: string) => {
    // Tipagem correta do snapshot
    OrderService.trackOrder(key, (snapshot: DataSnapshot) => {
      const data = snapshot.val() as { status?: string } | null;
      const status = (data?.status ?? "").toString();
      if (status) {
        setStatusText(`Status do seu pedido: ${status.toUpperCase()}`);
      }
    });
  };

  // abre/fecha modal
  const handleInitOrder = useCallback(() => {
    setIsModalVisible((v) => !v);
  }, []);

  const handleCloseModal = useCallback(() => {
    setIsModalVisible(false);
  }, []);

  return {
    isModalVisible,
    handleInitOrder,
    handleCloseModal,

    userName,
    statusText,
    showForm,
    handleChangeName,
    handleCreateOrder,

    currentRoute,
    handleCurrentRoute,
  };
};
