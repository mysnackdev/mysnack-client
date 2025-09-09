import dynamic from "next/dynamic";
const Hero = dynamic(() => import("@/components/home/Hero"), { ssr: false });
const CategoriesStrip = dynamic(() => import("@/components/home/CategoriesStrip"), { ssr: false });
const PromoCarousel = dynamic(() => import("@/components/home/PromoCarousel"), { ssr: false });
const CheapDealsSection = dynamic(() => import("@/components/home/CheapDealsSection"), { ssr: false });
const RecentOrdersRow = dynamic(() => import("@/components/home/RecentOrdersRow"), { ssr: false });
const MallStoresList = dynamic(() => import("@/components/home/MallStoresList"), { ssr: false });

export default function HomePage() {
  return (
    <main className="pb-8">
      <Hero />
      <CategoriesStrip />
      <PromoCarousel />
      <CheapDealsSection />
      <RecentOrdersRow />
      <MallStoresList />
    </main>
  );
}
