"use client";
import Image from "next/image";
import React from "react";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronRight } from "@fortawesome/free-solid-svg-icons";
import type { IconProp } from "@fortawesome/fontawesome-svg-core";

export function PromoAlert() {
  return (
    <div
      className="rounded-2xl p-4 elev-1 border"
      style={{ background: "#FEE2E2", borderColor: "#FCA5A5" }}
    >
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-red-500 text-white flex items-center justify-center font-bold">
          C
        </div>
        <div className="flex-1">
          <p className="font-semibold">Chegou a Comunidade MySnack</p>
          <p className="muted -mt-0.5 text-sm">Faça parte você também!</p>
        </div>
        <span className="badge-red">NOVO!</span>
        <FontAwesomeIcon icon={faChevronRight} className="muted" />
      </div>
    </div>
  );
}

type ListItemProps = {
  icon: IconProp;          // ✅ tipagem correta para FontAwesome
  label: string;
  desc: string;
  badge?: string;
  href?: string;
  onClick?: () => void;
};

export function ListItem({ icon, label, desc, badge, href, onClick }: ListItemProps) {
  const inner = (
    <div className="flex items-center gap-3">
      <div className="w-9 h-9 rounded-full bg-gray-100 text-gray-700 flex items-center justify-center">
        <FontAwesomeIcon icon={icon} />
      </div>
      <div className="flex-1">
        <p className="font-semibold">{label}</p>
        <p className="muted text-sm">{desc}</p>
      </div>
      {badge ? <span className="badge-red">{badge}</span> : null}
      <FontAwesomeIcon icon={faChevronRight} className="muted" />
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="w-full block px-1 py-3">
        {inner}
      </Link>
    );
  }

  return (
    <button type="button" className="w-full text-left px-1 py-3" onClick={onClick}>
      {inner}
    </button>
  );
}

export function ProfileHeader({
  name,
  email,
  photoURL,
}: {
  name?: string | null;
  email?: string | null;
  photoURL?: string | null;
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-200">
        {photoURL ? (
          <Image
            src={photoURL}
            alt={name || "avatar"}
            width={48}                  // ✅ evita erro do next/image
            height={48}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center font-bold text-lg">
            {(name || email || "U").slice(0, 1).toUpperCase()}
          </div>
        )}
      </div>
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">
          {name || "Minha conta"}
        </h1>
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
