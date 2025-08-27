"use client";

import React from "react";

/**
 * OrderFloatButton foi desativado conforme solicitado:
 * deixar de exibir o botão flutuante "Fazer pedido".
 * Mantemos a assinatura para não quebrar imports existentes.
 */
type OrderFloatButtonProps = {
  isModalVisible: boolean;
  handleInitOrder: () => void;
};

export const OrderFloatButton: React.FC<OrderFloatButtonProps> = () => {
  return null;
};
