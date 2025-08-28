"use client";

import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronLeft, faChevronRight } from "@fortawesome/free-solid-svg-icons";

const slides = [
  { title: "Aproveite Até", percent: "50% Off", brand: "Burger King" },
  { title: "Somente Hoje", percent: "40% Off", brand: "Giuseppe Grill" },
  { title: "Semana Sushi",  percent: "60% Off", brand: "Sushi House" },
];

const AUTOPLAY_MS = 400;
const PAUSE_AFTER_INTERACTION_MS = 600;

export default function PromoCarousel() {
  const [i, setI] = React.useState(0);

  // refs p/ controle
  const pausedRef = React.useRef(false);
  const timerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const resumeRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearAll = React.useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (resumeRef.current) clearTimeout(resumeRef.current);
    timerRef.current = null;
    resumeRef.current = null;
  }, []);

  const startTimer = React.useCallback(() => {
    if (pausedRef.current) return;
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setI((prev) => (prev + 1) % slides.length);
    }, AUTOPLAY_MS);
  }, []);

  // (re)agenda autoplay sempre que o índice muda
  React.useEffect(() => {
    startTimer();
    return clearAll;
  }, [i, startTimer, clearAll]);

  // pausa temporária após interação
  const pause = (ms = PAUSE_AFTER_INTERACTION_MS) => {
    pausedRef.current = true;
    clearAll();
    resumeRef.current = setTimeout(() => {
      pausedRef.current = false;
      startTimer();
    }, ms);
  };

  // handlers
  const prev = () => {
    setI((prev) => (prev - 1 + slides.length) % slides.length);
    pause();
  };
  const next = () => {
    setI((prev) => (prev + 1) % slides.length);
    pause();
  };
  const goto = (idx: number) => {
    setI(idx);
    pause();
  };

  const s = slides[i];

  return (
    <section
      className="relative overflow-hidden rounded-3xl p-6 text-white"
      style={{ background: "linear-gradient(90deg,#f97316,#ef4444)" }}
      onMouseEnter={() => {
        pausedRef.current = true;
        clearAll();
      }}
      onMouseLeave={() => {
        pausedRef.current = false;
        startTimer();
      }}
    >
      {/* setas (visíveis a partir de md) */}
      <button
        aria-label="Slide anterior"
        onClick={prev}
        className="hidden md:flex absolute left-2 top-1/2 -translate-y-1/2 z-20 rounded-full bg-white/20 p-2 hover:bg-white/30"
      >
        <FontAwesomeIcon icon={faChevronLeft} />
      </button>
      <button
        aria-label="Próximo slide"
        onClick={next}
        className="hidden md:flex absolute right-2 top-1/2 -translate-y-1/2 z-20 rounded-full bg-white/20 p-2 hover:bg-white/30"
      >
        <FontAwesomeIcon icon={faChevronRight} />
      </button>

      {/* conteúdo */}
      <div className="relative z-10 select-none">
        <p className="opacity-90">{s.title}</p>
        <h3 className="text-4xl font-extrabold leading-tight">{s.percent}</h3>
        <p className="opacity-90">em {s.brand}</p>
        <span className="mt-3 inline-block rounded-full border border-white/30 bg-white/15 px-3 py-1 text-sm">
          Somente no MySnack
        </span>
      </div>

      {/* dots clicáveis */}
      <div className="absolute inset-x-0 bottom-3 z-20 flex justify-center gap-2">
        {slides.map((_, idx) => (
          <button
            key={idx}
            aria-label={`Ir para slide ${idx + 1}`}
            onClick={() => goto(idx)}
            className={
              "h-2 w-2 rounded-full transition-colors " +
              (i === idx ? "bg-white" : "bg-white/40")
            }
          />
        ))}
      </div>
    </section>
  );
}
