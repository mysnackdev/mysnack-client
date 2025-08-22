"use client";
import React from "react";

import HeroBanner from "@/components/hero-banner.section";
import BrandHighlightsRow from "@/components/brand-row.section";
import PromoCarousel from "@/components/promo-carousel.section";
import CheapDealsHorizontal from "@/components/cheap-deals-horizontal.section";

import Highlights from "@/components/highlights.section";
import RecentOrders from "@/components/recent-orders.section";
import MallStores from "@/components/mall-stores.section";

import { Order } from "@/components/order.component";
import { OrderFloatButton } from "@/components/order-float-button.component";
import { useOrder } from "@/hooks";

export default function Page() {
  const { isModalVisible, handleInitOrder } = useOrder();

  return (
    <main className="max-w-5xl mx-auto px-4">
      {/* Hero */}
      <HeroBanner />

      {/* Seções */}
      <section className="pb-6">
        <BrandHighlightsRow />
      </section>
      <section className="pb-6">
        <PromoCarousel />
      </section>
      <section className="pb-6">
        <CheapDealsHorizontal />
      </section>

      <div className="space-y-10">
        <Highlights />
        <RecentOrders />
        <MallStores />
      </div>

      {/* Float Button + Modal */}
      <OrderFloatButton
        isModalVisible={isModalVisible}
        handleInitOrder={handleInitOrder}
      />
      {isModalVisible && <Order />}
    </main>
  );
}
