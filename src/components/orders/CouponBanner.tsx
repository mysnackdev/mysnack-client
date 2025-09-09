"use client";

export default function CouponBanner() {
  return (
    <section className="px-4 mt-6">
      <div className="rounded-2xl bg-purple-50 text-purple-700 px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span>🎁</span>
          <span className="font-medium">Você ganhou cupons grátis aqui</span>
        </div>
        <span>›</span>
      </div>
    </section>
  );
}
