"use client";

import React from "react";
import dynamic from "next/dynamic";

const BottomNav = dynamic(() => import("@/components/bottom-nav"), { ssr: false });
const Hero = dynamic(() => import("@/components/home/Hero"), { ssr: false });
const CategoriesChips = dynamic(() => import("@/components/home/CategoriesChips"), { ssr: false });
const PromoGradientCard = dynamic(() => import("@/components/home/PromoGradientCard"), { ssr: false });
const MallStoresSection = dynamic(() => import("@/components/home/MallStoresSection"), { ssr: false });
const CheapDealsSection = dynamic(() => import("@/components/home/CheapDealsSection"), { ssr: false });
const RecentOrders = dynamic(() => import("@/components/home/RecentOrders"), { ssr: false });

export default function HomePage() {
  return (
    <main className="pb-24">
      <Hero />
      <CategoriesChips />
      <section className="px-4 mt-4"><PromoGradientCard /></section>
      <CheapDealsSection />
      <MallStoresSection />
      <RecentOrders />
      <BottomNav active="inicio" />
    </main>
  );
}
