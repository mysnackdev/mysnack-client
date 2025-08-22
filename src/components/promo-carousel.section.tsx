"use client";
import React, { useEffect, useState, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronLeft, faChevronRight } from "@fortawesome/free-solid-svg-icons";

const slides = [
  { title: "Aproveite Até", percent: "50% Off", brand: "Burger King" },
  { title: "Somente Hoje", percent: "40% Off", brand: "Giuseppe Grill" },
  { title: "Semana Sushi", percent: "60% Off", brand: "Sushi House" },
];

export default function PromoCarousel(){
  const [i, setI] = useState(0);
  const pausedRef = useRef(false);

  useEffect(()=>{
    const tick = () => {
      if (!pausedRef.current) setI(prev => (prev+1)%slides.length);
    };
    const t = setInterval(tick, 4000);
    return ()=> clearInterval(t);
  },[]);

  function pause(ms:number = 6000){
    pausedRef.current = true;
    setTimeout(()=>{ pausedRef.current = false; }, ms);
  }

  const s = slides[i];

  return (
    <section className="relative elev-2 rounded-3xl overflow-hidden p-6 text-white" style={{background:"linear-gradient(90deg, #f97316, #ef4444)"}}
             onMouseEnter={()=>{pausedRef.current = true;}}
             onMouseLeave={()=>{pausedRef.current = false;}}>
      <button aria-label="Slide anterior" onClick={()=>{ setI((i-1+slides.length)%slides.length); pause(); }} className="hidden md:flex absolute left-2 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-white/20 hover:bg-white/30">
        <FontAwesomeIcon icon={faChevronLeft} />
      </button>
      <button aria-label="Próximo slide" onClick={()=>{ setI((i+1)%slides.length); pause(); }} className="hidden md:flex absolute right-2 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-white/20 hover:bg-white/30">
        <FontAwesomeIcon icon={faChevronRight} />
      </button>
      <div className="relative z-10">
        <p className="opacity-90">{s.title}</p>
        <h3 className="text-4xl font-extrabold leading-tight">{s.percent}</h3>
        <p className="opacity-90">em {s.brand}</p>
        <span className="mt-3 inline-block bg-white/15 border border-white/30 px-3 py-1 rounded-full text-sm">
          Somente no MySnack
        </span>
      </div>
      <div className="absolute left-0 right-0 bottom-3 flex justify-center gap-2">
        {slides.map((_, idx)=>(
          <span key={idx} className={"w-2 h-2 rounded-full " + (i===idx?"bg-white":"bg-white/40")}></span>
        ))}
      </div>
    </section>
  );
}