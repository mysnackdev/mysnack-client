"use client";

import React from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";

type Slide = {
  id: string;
  titleTop: string;
  titleBig: string;
  subtitle: string;
  badge?: string;
  img: string;
  logo?: string;
};

const SLIDES: Slide[] = [
  {
    id: "bk",
    titleTop: "Aproveite Até",
    titleBig: "50% Off",
    subtitle: "em Burger King",
    badge: "Somente no MySnack",
    img: "/promo-bk.jpg",
    logo: "/bk-logo.png",
  },
  {
    id: "gg",
    titleTop: "Somente Hoje",
    titleBig: "40% Off",
    subtitle: "em Giuseppe Grill",
    badge: "Exclusivo",
    img: "/promo-gg.jpg",   // ajuste o caminho se necessário
  },
  {
    id: "sh",
    titleTop: "Semana Sushi",
    titleBig: "60% Off",
    subtitle: "em Sushi House",
    badge: "Clube MySnack",
    img: "/promo-sushi.jpg", // ajuste o caminho se necessário
  },
];

const AUTOPLAY_MS = 4000;
const PAUSE_AFTER_INTERACTION_MS = 6000;

export default function PromoGradientCard() {
  const [i, setI] = React.useState(0);

  const pausedRef = React.useRef(false);
  const timerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const resumeRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTimers = React.useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (resumeRef.current) clearTimeout(resumeRef.current);
    timerRef.current = null;
    resumeRef.current = null;
  }, []);

  const schedule = React.useCallback(() => {
    if (pausedRef.current) return;
    clearTimers();
    timerRef.current = setTimeout(
      () => setI((prev) => (prev + 1) % SLIDES.length),
      AUTOPLAY_MS
    );
  }, [clearTimers]);

  // Reagenda sempre que o índice muda
  React.useEffect(() => {
    schedule();
    return clearTimers;
  }, [i, schedule, clearTimers]);

  const pauseAfterInteraction = React.useCallback((ms = PAUSE_AFTER_INTERACTION_MS) => {
    pausedRef.current = true;
    clearTimers();
    resumeRef.current = setTimeout(() => {
      pausedRef.current = false;
      schedule();
    }, ms);
  }, [clearTimers, schedule]);

  const prev = () => {
    setI((p) => (p - 1 + SLIDES.length) % SLIDES.length);
    pauseAfterInteraction();
  };
  const next = () => {
    setI((p) => (p + 1) % SLIDES.length);
    pauseAfterInteraction();
  };
  const goto = (idx: number) => {
    setI(idx);
    pauseAfterInteraction();
  };

  const s = SLIDES[i];

  return (
    <section
      className="mt-4"
      onMouseEnter={() => { pausedRef.current = true; clearTimers(); }}
      onMouseLeave={() => { pausedRef.current = false; schedule(); }}
    >
      <div className="relative overflow-hidden rounded-3xl bg-amber-50 shadow-sm">
        {/* setas */}
        <button
          aria-label="Anterior"
          onClick={prev}
          className="absolute left-2 top-1/2 z-20 hidden -translate-y-1/2 rounded-full bg-black/10 p-2 backdrop-blur hover:bg-black/20 md:inline-flex"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <button
          aria-label="Próximo"
          onClick={next}
          className="absolute right-2 top-1/2 z-20 hidden -translate-y-1/2 rounded-full bg-black/10 p-2 backdrop-blur hover:bg-black/20 md:inline-flex"
        >
          <ChevronRight className="h-5 w-5" />
        </button>

        {/* slide atual */}
        <article
          key={s.id}
          className="grid h-[184px] grid-cols-[1fr,0.9fr] items-center gap-2 px-5 sm:h-[160px] sm:grid-cols-[1fr,1fr] sm:gap-4"
        >
          <div className="relative z-10">
            <p className="text-[13px] font-medium text-amber-800">{s.titleTop}</p>
            <p className="text-3xl font-extrabold leading-tight text-amber-900 sm:text-4xl">
              {s.titleBig}
            </p>
            <p className="text-sm text-amber-900/90">{s.subtitle}</p>

            {s.badge && (
              <span className="mt-3 inline-block rounded-lg bg-[#E53935] px-3 py-1 text-xs font-semibold text-white">
                {s.badge}
              </span>
            )}
          </div>

          <div className="relative h-full">
            <Image
              src={s.img}
              alt={s.subtitle}
              fill
              sizes="(max-width: 640px) 50vw, 40vw"
              className="object-cover"
              priority
            />
          </div>
        </article>

        {/* dots */}
        <div className="mb-3 mt-1 flex items-center justify-center gap-1.5">
          {SLIDES.map((_, idx) => (
            <button
              key={idx}
              aria-label={`Ir para slide ${idx + 1}`}
              onClick={() => goto(idx)}
              className={
                "h-2 w-2 rounded-full transition-colors " +
                (i === idx ? "bg-black/80" : "bg-black/25")
              }
            />
          ))}
        </div>
      </div>
    </section>
  );
}
