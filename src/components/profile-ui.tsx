"use client";
import Image from "next/image";
import React from "react";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronRight } from "@fortawesome/free-solid-svg-icons";
import type { IconProp } from "@fortawesome/fontawesome-svg-core";

export function PromoAlert() {
  return (
    <div className="rounded-2xl p-4 elev-1 border" style={{ background: "#FEE2E2", borderColor: "#FCA5A5" }}>
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-red-500 text-white flex items-center justify-center font-bold">
          %
        </div>
        <div className="flex-1">
          <div className="font-semibold">Promoções disponíveis</div>
          <div className="text-sm text-red-700">Aproveite ofertas selecionadas no app</div>
        </div>
      </div>
    </div>
  );
}

export function ListItem({ icon, label, desc, href, onClick, badge }: { icon: IconProp; label: string; desc?: string; href?: string; onClick?: () => void; badge?: string; }) {
  const inner = (
    <div className="w-full flex items-center gap-3">
      <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center">
        <FontAwesomeIcon icon={icon} className="text-gray-600" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-medium truncate">{label}</div>
        {desc ? <div className="text-sm text-gray-500 truncate">{desc}</div> : null}
      </div>
      {badge ? <span className="badge-red">{badge}</span> : null}
      <FontAwesomeIcon icon={faChevronRight} className="muted" />
    </div>
  );
  if (href) {
    return <Link href={href} className="w-full block px-1 py-3">{inner}</Link>;
  }
  return <button type="button" className="w-full text-left px-1 py-3" onClick={onClick}>{inner}</button>;
}

export function ProfileHeader({ name, email, photoURL }: { name?: string | null; email?: string | null; photoURL?: string | null; }) {
  const display = name || (email ? email.split("@")[0] : ""); 
  return (
    <div className="flex items-center gap-3">
      <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-200">
        {photoURL ? (
          <Image src={photoURL} alt={display || "avatar"} width={48} height={48} />
        ) : (
          <div className="w-12 h-12 flex items-center justify-center text-gray-500">🙂</div>
        )}
      </div>
      <div className="flex-1">
        <h1 className="text-2xl font-bold leading-tight">Minha conta</h1>
        {display ? <p className="text-sm text-gray-600">Bem-vindo {display}</p> : null}
      </div>
    </div>
  );
}

export function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3">
      <h2 className="sr-only">{title}</h2>
      {children}
    </section>
  );
}
