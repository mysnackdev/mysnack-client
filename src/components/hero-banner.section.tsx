"use client";
import React from "react";
import Image from "next/image";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStar, faClock, faUtensils } from "@fortawesome/free-solid-svg-icons";

export default function HeroBanner() {
  const bg = "linear-gradient(90deg, rgba(255,143,66,0.2), rgba(255,0,0,0.2))";

  return (
    <section className="relative overflow-hidden rounded-3xl elev-2" style={{ height: 220 }}>
      <div className="absolute inset-0" style={{ background: bg }} />

      <Image
        alt="Burgers background"
        src="https://images.unsplash.com/photo-1550547660-d9450f859349?q=80&w=1600&auto=format&fit=crop"
        fill
        priority
        sizes="(max-width: 768px) 100vw, 1200px"
        className="absolute inset-0 object-cover opacity-75"
      />

      <div className="relative z-10 p-6 text-white drop-shadow">
        <h2 className="text-2xl md:text-3xl font-extrabold mb-2">Peça pelo QR Code</h2>
        <p className="opacity-90">Cardápio digital, pedidos rápidos e entrega na mesa</p>
        <div className="flex gap-4 mt-4 text-sm">
          <span className="inline-flex items-center gap-1"><FontAwesomeIcon icon={faStar} /> 4.8</span>
          <span className="inline-flex items-center gap-1"><FontAwesomeIcon icon={faClock} /> 5–7 min</span>
          <span className="inline-flex items-center gap-1"><FontAwesomeIcon icon={faUtensils} /> Praça de Alimentação</span>
        </div>
      </div>
    </section>
  );
}
