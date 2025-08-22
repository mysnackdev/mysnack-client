"use client";

import React from "react";
import { useOrder } from "@/hooks/useOrder";
import { LoginForm } from "./login-form";
import { OrderForm } from "./order-form.component";
import { RegisterForm } from "./register-form";
import { SendPasswordResetEmailForm } from "./send-password-reset-email-form";
import { getAuth, signOut, sendPasswordResetEmail } from "firebase/auth";

// As mesmas rotas do useOrder
type AllowedRoute = "login" | "send_password_reset_email" | "register" | "order";

function isAllowedRoute(r: string): r is AllowedRoute {
  return r === "login" || r === "send_password_reset_email" || r === "register" || r === "order";
}

export const Order: React.FC = () => {
  const {
    showForm,
    userName,
    statusText,
    currentRoute,
    handleChangeName,
    handleCreateOrder,
    handleCurrentRoute,
    handleCloseModal,
  } = useOrder();

  // Estado local para "Esqueci minha senha"
  const [resetEmail, setResetEmail] = React.useState<string>("");
  const [resetError, setResetError] = React.useState<string | null>(null);

  // OrderForm espera FormEventHandler
  const onLogoutForm: React.FormEventHandler = async (e) => {
    e.preventDefault();
    try {
      await signOut(getAuth());
      handleCurrentRoute("login");
    } catch (error) {
      console.error(error);
    }
  };

  const onResetPassword = async (value: string) => {
    try {
      setResetError(null);
      await sendPasswordResetEmail(getAuth(), value);
      handleCurrentRoute("login");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Não foi possível enviar o e-mail.";
      setResetError(message);
    }
  };

  // Ponte: SendPasswordResetEmailForm pede (route: string) => void
  const handleCurrentRouteBridge = (route: string) => {
    if (isAllowedRoute(route)) handleCurrentRoute(route);
  };

  const routes: Record<AllowedRoute, { title: string; component: React.ReactNode }> = {
    login: {
      title: "Login",
      component: <LoginForm />,
    },
    send_password_reset_email: {
      title: "Recuperar senha",
      component: (
        <SendPasswordResetEmailForm
          errorMessage={resetError}
          email={resetEmail}
          setEmail={setResetEmail}
          handleSendPasswordResetEmail={onResetPassword}
          handleCurrentRoute={handleCurrentRouteBridge}
        />
      ),
    },
    register: {
      title: "Cadastrar",
      component: <RegisterForm />,
    },
    order: {
      title: "Fazer pedido",
      component: (
        <OrderForm
          onLogout={onLogoutForm}
          statusText={statusText}
          showForm={showForm}
          userName={userName}
          handleChangeName={handleChangeName}
          handleCreateOrder={handleCreateOrder}
        />
      ),
    },
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 flex justify-end items-end"
      role="dialog"
      aria-modal="true"
      onClick={handleCloseModal}
    >
      <div
        className="bg-secondary rounded-xl mb-20 h-[500px] w-[360px] max-w-full mr-4 flex flex-col shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-3 border-b">
          <h1 className="text-2xl font-bold">{routes[currentRoute].title}</h1>
          <button
            type="button"
            aria-label="Fechar"
            className="px-2 py-1 rounded hover:bg-black/10"
            onClick={handleCloseModal}
          >
            ×
          </button>
        </div>
        <div className="overflow-auto p-3">{routes[currentRoute].component}</div>
      </div>
    </div>
  );
};
