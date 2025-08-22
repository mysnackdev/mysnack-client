"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "Início" },
  { href: "/categorias", label: "Categorias" },
  { href: "/pedidos", label: "Pedidos" },
  { href: "/perfil", label: "Perfil" },
];

export default function Navbar() {
  const pathname = usePathname();
  return (
    <nav className="w-full border-b bg-white/70 backdrop-blur sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-4 py-3 flex gap-3">
        <span className="font-semibold mr-2">MySnack</span>
        {links.map(l => (
          <Link
            key={l.href}
            href={l.href}
            className={
              "px-3 py-1 rounded-full hover:bg-gray-100 " +
              (pathname === l.href ? "bg-black text-white" : "text-gray-700")
            }>
            {l.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}