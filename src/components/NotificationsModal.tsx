"use client";
import React, { useEffect, useMemo } from "react";
import { useNotificationsRTDB } from "@/hooks/useNotificationsRTDB";
import { useRouter } from "next/navigation";

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function NotificationsModal({ open, onClose }: Props) {
  const { items, markRead, markAllAsRead } = useNotificationsRTDB();
  const router = useRouter();

  const sorted = useMemo(() => {
    const unread = items.filter((n) => !n.read);
    const read = items.filter((n) => !!n.read);
    return [...unread, ...read];
  }, [items]);

  useEffect(() => {
    if (open) { markAllAsRead(); }
  }, [open, markAllAsRead]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[1000] flex items-start justify-center bg-black/40 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className="mt-16 w-full max-w-md rounded-2xl bg-white shadow-xl ring-1 ring-black/10"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b px-4 py-3">
          <h2 className="text-sm font-semibold">Notificações</h2>
          <button className="rounded p-1 hover:bg-black/5" aria-label="Fechar" onClick={onClose}>
            ✕
          </button>
        </div>

        <ul className="max-h-[70vh] overflow-auto divide-y">
          {sorted.length === 0 && (
            <li className="p-4 text-sm text-gray-500">Sem notificações.</li>
          )}

          {sorted.map((n) => {
            const created = n.createdAt ?? n.ts ?? 0;
            const d = new Date(created);
            const hh = String(d.getHours()).padStart(2, "0");
            const mm = String(d.getMinutes()).padStart(2, "0");
            const time = `${hh}:${mm}`;

            const go = () => {
              // marca lida e navega
              markRead(n.id);
              const orderId: string | undefined = n.data?.orderId; // sem 'any'
              if (orderId) {
                router.push(`/orders?o=${orderId}`);
              } else {
                router.push("/perfil/notificacoes");
              }
              onClose();
            };

            return (
              <li key={n.id} className="flex items-start gap-3 p-4">
                <div className={`mt-1 h-2 w-2 rounded-full ${!n.read ? "bg-pink-600" : "bg-gray-300"}`} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-3">
                    <p className="truncate text-sm font-medium">{n.title}</p>
                    <span className="shrink-0 text-xs text-gray-500">{time}</span>
                  </div>
                  {n.body && <p className="mt-0.5 line-clamp-2 text-sm text-gray-600">{n.body}</p>}
                  <div className="mt-2">
                    <button className="text-xs font-medium text-pink-700 hover:underline" onClick={go}>
                      Ver detalhes
                    </button>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>

        <div className="flex items-center justify-end gap-2 border-t px-4 py-3">
          <button className="rounded-md border px-3 py-1.5 text-sm hover:bg-black/5" onClick={onClose}>
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}
