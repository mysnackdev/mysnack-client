"use client";
import React from "react";

export default function ScanQRButton({onClick}:{onClick?:()=>void}){
  return (
    <button
      onClick={onClick}
      className="fixed bottom-20 right-4 z-40 px-4 py-3 rounded-full shadow-lg"
      style={{background:"#ef4444", color:"#fff"}}
    >
      Escanear QR
    </button>
  );
}