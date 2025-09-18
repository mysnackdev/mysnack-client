"use client";

import React from "react";
import BottomNav from "@/components/BottomNav";

import dynamic from "next/dynamic";
const CheapDealsSection = dynamic(() => import("@/components/home/CheapDealsSection"), { ssr: false });
const MallStoresSection = dynamic(() => import("@/components/home/MallStoresSection"), { ssr: false });
const RecentOrders = dynamic(() => import("@/components/home/RecentOrders"), { ssr: false });

import HeroQR from "@/components/home/HeroQR";
import HighlightsDots from "@/components/home/HighlightsDots";
import PromoGradientCard from "@/components/home/PromoGradientCard";

import CheapDealsHorizontalSection from "@/components/cheap-deals-horizontal.section";

import { Order } from "@/components/order.component";
import { OrderFloatButton } from "@/components/order-float-button.component";
import { useOrder } from "@/hooks";
import { useStores } from "@/hooks/useStores";

export default function Page() {
  const { isModalVisible, handleInitOrder } = useOrder();
  const { stores, loading, error } = useStores();
void stores; void loading; void error;
void CheapDealsHorizontalSection;


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
    
        {/* Escopo que oculta barras de rolagem do carrossel sem remover o scroll */}
        <div className="no-scrollbar-scope mt-2">
          <CheapDealsSection />
        </div>
      </section>


      {/* Últimos Pedidos */}      <RecentOrders />      {/* Lojas no Shopping */}
      <section className="mt-6">
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
