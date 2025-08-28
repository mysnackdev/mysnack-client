"use client";

import React from "react";
import BottomNav from "@/components/BottomNav";

import HeroQR from "@/components/home/HeroQR";
import HighlightsDots from "@/components/home/HighlightsDots";
import PromoGradientCard from "@/components/home/PromoGradientCard";

import CheapDealsHorizontalSection from "@/components/cheap-deals-horizontal.section";
import MallStoresSection from "@/components/mall-stores.section";
import RecentOrders from "@/components/home/RecentOrders";

import { Order } from "@/components/order.component";
import { OrderFloatButton } from "@/components/order-float-button.component";
import { useOrder } from "@/hooks";
import { useStores } from "@/hooks/useStores";

export default function Page() {
  const { isModalVisible, handleInitOrder } = useOrder();
  const { stores, loading, error } = useStores();

  return (
    <main className="mx-auto max-w-5xl px-4 pb-24">
      {/* HERO */}
      <HeroQR />

      {/* Destaques no MySnack (bolinhas) */}
      <HighlightsDots />

      {/* Card promocional 40% OFF */}
      <PromoGradientCard />

      {/* Baratinhos do dia */}
      <section className="mt-8">
        <h3 className="px-1 text-lg font-semibold">Baratinhos no MySnack</h3>
        {loading && <p className="mt-2 px-1 text-sm text-muted-foreground">Carregando lojas…</p>}
        {error && !loading && (
          <p className="mt-2 px-1 text-sm text-red-600">Erro ao carregar: {error}</p>
        )}

        {/* Escopo que oculta barras de rolagem do carrossel sem remover o scroll */}
        <div className="no-scrollbar-scope mt-2">
          <CheapDealsHorizontalSection stores={stores} title="" limit={10} />
        </div>
      </section>

      {/* Pedidos recentes */}
      <RecentOrders />

      {/* Lojas no Shopping */}
      <section className="mt-6">
        <h3 className="px-1 text-lg font-semibold">Lojas no Shopping</h3>
        <div className="mt-2">
          <MallStoresSection />
        </div>
      </section>

      {/* Pedido (modal/flutuante) */}
      <OrderFloatButton isModalVisible={isModalVisible} handleInitOrder={handleInitOrder} />
      {isModalVisible && <Order />}

      <BottomNav />

      {/* CSS global para ocultar scrollbars APENAS dentro do escopo acima */}
      <style jsx global>{`
        /* WebKit (Chrome/Safari/Edge Chromium) */
        .no-scrollbar-scope *::-webkit-scrollbar {
          display: none;
          width: 0;
          height: 0;
        }
        /* Firefox */
        .no-scrollbar-scope * {
          scrollbar-width: none;
        }
        /* IE/Legacy Edge */
        .no-scrollbar-scope * {
          -ms-overflow-style: none;
        }
      `}</style>
    </main>
  );
}
