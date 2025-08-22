"use client";

import { faTimes } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React from "react";

type OrderFloatButtonProps = {
  isModalVisible: boolean;
  handleInitOrder: () => void;
};

export const OrderFloatButton: React.FC<OrderFloatButtonProps> = ({
  isModalVisible,
  handleInitOrder,
}) => {
  return (
    <button
      type="button"
      aria-label={isModalVisible ? "Fechar pedido" : "Fazer pedido"}
      className="fixed bottom-4 right-4 bg-primary px-4 py-3 rounded-3xl shadow-lg hover:opacity-90"
      onClick={handleInitOrder}
    >
      {isModalVisible ? (
        <FontAwesomeIcon icon={faTimes} className="text-secondary fa-xl" />
      ) : (
        <span className="font-bold text-secondary">Fazer pedido</span>
      )}
    </button>
  );
};