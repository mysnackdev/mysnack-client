"use client";

import React from "react";
import { useOrder } from "@/hooks/useOrder"; // = o hook refatorado que te enviei
import { Order } from "@/components/order.component";
import { OrderFloatButton } from "@/components/order-float-button.component";
import  ScanBanner  from "@/components/scan-banner";
import  ReorderCard  from "@/components/reorder-card";
import  OrderHistoryItem  from "@/components/order-history-item";
import  BottomNav  from "@/components/bottom-nav";

// Simule dados de “peça de novo” e histórico.
// Troque por sua fonte real (ex: Firestore / Realtime DB) quando quiser.
const lastOrder = {
  brand: "Pizza Caesar",
  itemTitle: "1 **Super Promo** – Pizza 1/2 Calabresa 1/2 Marguerita – Grande 35cm",
  total: 45.9,
  lastDate: "Sex. 11 julho 2025",
  orderNo: "4883",
  logoUrl: "/brand-pizza.png", // opcional
};

export default function PedidosPage() {
  const { isModalVisible, handleInitOrder } = useOrder();

  return (
    <main className="max-w-5xl mx-auto px-4 pb-28">
      <header className="py-6">
        <h1 className="text-center text-sm font-semibold tracking-wide text-muted-foreground">
          MEUS PEDIDOS
        </h1>
      </header>

      {/* Banner principal com CTA para escanear */}
      <section className="mb-6">
        <ScanBanner onScan={handleInitOrder} />
      </section>

      {/* Peça de novo */}
      <section className="mb-6">
        <h2 className="text-[17px] font-semibold mb-3">Peça de novo</h2>
        <ReorderCard
          brand={lastOrder.brand}
          itemTitle={lastOrder.itemTitle}
          onAddToBag={() => handleInitOrder()}
        />
      </section>

      {/* Histórico */}
      <section className="mb-8">
        <h2 className="text-[17px] font-semibold mb-3">Histórico</h2>
        <OrderHistoryItem
          brand={lastOrder.brand}
          statusDotColor="bg-emerald-500"
          statusText="Pedido concluído"
          orderNo={lastOrder.orderNo}
          dateLabel={lastOrder.lastDate}
          itemTitle={lastOrder.itemTitle}
          price={lastOrder.total}
          onReorder={() => handleInitOrder()}
        />
      </section>

      {/* Float action (mantido do seu fluxo) */}
      <OrderFloatButton
        isModalVisible={isModalVisible}
        handleInitOrder={handleInitOrder}
      />

      {/* Modal com login/registro/pedido */}
      {isModalVisible && <Order />}

      {/* Navbar inferior fixa */}
      <BottomNav active="orders" />
    </main>
  );
}