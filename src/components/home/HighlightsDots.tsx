"use client";

import Image from "next/image";

type Cat = { name: string; color: string; img?: string };

const CATS: readonly Cat[] = [
  { name: "Lanches",  color: "#EF4444", img: "/cats/lanches.png" },
  { name: "Japonesa", color: "#22C55E", img: "/cats/japonesa.png" },
  { name: "Pizza",    color: "#FACC15", img: "/cats/pizza.png" },
  { name: "Doces",    color: "#EF4444", img: "/cats/doces.png" },
] as const;

export default function HighlightsDots() {
  return (
    <section className="mt-4">
      {/* -mx-4/px-4 mantém alinhado ao padding da página e evita “sangrar” */}
      <div className="no-scrollbar -mx-4 overflow-x-auto px-4">
        <ul className="flex snap-x snap-mandatory gap-4 pb-2">
          {CATS.map(({ name, color, img }, idx) => (
            <li key={`${name}-${idx}`} className="snap-start flex-none w-[140px] sm:w-[158px]">
              <div className="flex flex-col items-center">
                {/* CARD maior e sem borda */}
                <div className="relative h-[92px] sm:h-[100px] w-full overflow-hidden rounded-[24px] bg-white shadow-md">
                  {/* faixa colorida no topo */}
                  <div
                    className="absolute inset-x-0 top-0 h-[56px] sm:h-[60px] rounded-t-[24px]"
                    style={{ backgroundColor: color }}
                  >
                    <span className="pointer-events-none absolute inset-0 rounded-t-[24px] bg-gradient-to-b from-white/18 to-transparent" />
                  </div>

                  {/* imagem cruzando a linha cor/branco */}
                  {img && (
                    <span className="absolute left-1 right-1 top-[36px] sm:top-[40px] h-[56px] sm:h-[60px] z-10">
                      <Image
                        src={img}
                        alt={name}
                        fill
                        sizes="(max-width: 640px) 140px, 158px"
                        className="object-contain"
                        priority
                      />
                    </span>
                  )}
                </div>

                {/* título */}
                <span className="mt-2 block text-center text-[13px] font-medium leading-tight text-slate-700">
                  {name}
                </span>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* ocultar scrollbars (WebKit/Firefox/Edge) */}
      <style jsx>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
          width: 0;
          height: 0;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </section>
  );
}
