"use client";
import React, { useState } from "react";
import Link from "next/link";
import { useNotificationsRTDB } from "@/hooks/useNotificationsRTDB";

function formatTime(ts: number) {
  try {
    return new Date(ts).toLocaleString("pt-BR", {
      hour: "2-digit", minute: "2-digit", day: "2-digit", month: "2-digit"
    });
  } catch { return ""; }
}

export default function NotificationsBellRTDB() {
  const { items, unreadCount, enabled, activate, markRead, mute, unmute, clear } = useNotificationsRTDB();
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        aria-label="Notificações"
        className="relative rounded-full p-2 hover:bg-black/5"
        onClick={() => setOpen(v => !v)}
      >
        <span className="inline-block">🔔</span>
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 text-xs px-1.5 py-0.5 rounded-full bg-red-600 text-white">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-[360px] rounded-2xl shadow-xl border border-black/10 bg-white z-50">
          <div className="p-3 border-b border-black/10 flex items-center justify-between">
            <strong className="text-sm">Notificações</strong>
            <div className="flex items-center gap-2">
              {!enabled && (
                <button
                  className="text-xs px-2 py-1 rounded-md border border-black/20 hover:bg-black/5"
                  onClick={activate}
                >
                  Ativar push
                </button>
              )}
              {items.length > 0 && (
                <button
                  className="text-xs px-2 py-1 rounded-md border border-black/20 hover:bg-black/5"
                  onClick={clear}
                >
                  Limpar
                </button>
              )}
            </div>
          </div>
          <ul className="max-h-[420px] overflow-auto divide-y divide-black/5">
            {items.length === 0 ? (
              <li className="p-3 text-sm text-black/60">Nenhuma notificação.</li>
            ) : (
              items.map(n => (
                <li key={n.id} className="p-3 text-sm">
                  <div className="flex items-start gap-2">
                    <div className="mt-0.5">{n.read ? "🟢" : "🔔"}</div>
                    <div className="flex-1">
                      <div className="font-medium">{n.title}</div>
                      <div className="text-black/80">{n.body}</div>
                      <div className="text-[11px] text-black/50 mt-1">{formatTime(n.ts)}</div>
                      <div className="flex items-center gap-3 mt-1">
                        {!n.read && (
                          <button
                            className="text-[12px] text-blue-700 hover:underline"
                            onClick={() => markRead(n.id)}
                          >
                            Marcar como lida
                          </button>
                        )}
                        {n.data?.orderId && (
                          <Link
                            href={`/orders?o=${encodeURIComponent(n.data.orderId)}`}
                            className="text-[12px] text-blue-700 hover:underline"
                            onClick={() => setOpen(false)}
                          >
                            Ver pedido #{n.data.orderId}
                          </Link>
                        )}
                        {n.data?.orderId && !n.muted && (
                          <button
                            className="text-[12px] text-amber-700 hover:underline"
                            onClick={() => mute(n.data!.orderId!)}
                          >
                            Silenciar este pedido
                          </button>
                        )}
                        {n.data?.orderId && n.muted && (
                          <button
                            className="text-[12px] text-green-700 hover:underline"
                            onClick={() => unmute(n.data!.orderId!)}
                          >
                            Reativar este pedido
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
