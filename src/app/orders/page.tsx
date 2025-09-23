"use client";

import React, { useCallback, useState } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import QrScannerDialog, { type QrResult } from "@/components/common/QrScannerDialog";
import { useMall } from "@/context/MallContext";

const BottomNav = dynamic(() => import("@/components/bottom-nav"), { ssr: false });
const OrdersHeader = dynamic(() => import("@/components/orders/OrdersHeader"), { ssr: false });
const ScanTableBanner = dynamic(() => import("@/components/orders/ScanTableBanner"), { ssr: false });
const OrderAgain = dynamic(() => import("@/components/orders/OrderAgain"), { ssr: false });
const HistoryList = dynamic(() => import("@/components/orders/HistoryList"), { ssr: false });
const LoginNotice = dynamic(() => import("@/components/LoginNotice"), { ssr: false });

export default function OrdersPage() {
  const { user } = useAuth();
  const { setMallById } = useMall();
  const router = useRouter();
  const [scanOpen, setScanOpen] = useState(false);

  const handleScan = useCallback(async (res: QrResult) => {
    // seta o shopping lido
    if (res.mallId) {
      try { await setMallById(res.mallId); } catch {}
    }
    // persiste o código da mesa (se existir)
    if (res.table) {
      try { localStorage.setItem("mysnack.table", res.table); } catch {}
    }
    setScanOpen(false);
    // navega para a home (ou outra tela que usa o mall selecionado)
    router.push("/");
  }, [router, setMallById]);

  return (
    <main className="max-w-3xl mx-auto pb-24">
      <OrdersHeader />

      {/* Banner de escaneamento */}
      <ScanTableBanner onClick={() => setScanOpen(true)} />

      {user ? (
        <>
          <section className="px-4 mt-6">
            <h3 className="text-lg font-semibold mb-3">Pedir de novo</h3>
          </section>
          <OrderAgain />
          
          <section className="px-4 mt-6">
            <h3 className="text-lg font-semibold mb-3">Histórico</h3>
          </section>
          <HistoryList />
        </>
      ) : (
        <LoginNotice />
      )}

      {/* Dialog do leitor de QR */}
      <QrScannerDialog open={scanOpen} onClose={() => setScanOpen(false)} onScan={handleScan} />

      <BottomNav active="orders" />
    </main>
  );
}
