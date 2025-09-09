import { config } from "@fortawesome/fontawesome-svg-core";
import "@fortawesome/fontawesome-svg-core/styles.css";
import type { Metadata } from "next";
import { Nunito_Sans } from "next/font/google";
import "./globals.css";
config.autoAddCss = false;

const nunitoSans = Nunito_Sans({
  variable: "--font-nunito-sans",
  subsets: ["latin"],
});

import BottomNav from "@/components/BottomNav";
import HeaderBar from "@/components/HeaderBar";
import CartManager from "@/components/CartManager";

import { Suspense } from "react";
import Providers from "./providers";

export const metadata: Metadata = {
  title: "MySnack",
  icons: { icon: "/icon.png" },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body className={`${nunitoSans.variable} antialiased pb-24`}>
        <Providers>
          <HeaderBar />
          <main className="max-w-screen-xl mx-auto px-4"><Suspense fallback={<div className="py-8 text-sm text-zinc-500">Carregando…</div>}>{children}</Suspense></main>
          <BottomNav />
          {/* Cart Drawer Manager */}
          <CartManager />
        </Providers>
      </body>
    </html>
  );
}