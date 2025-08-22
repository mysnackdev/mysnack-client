"use client";
import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import { onValue, ref, query, limitToLast } from "firebase/database";

type Pedido = { nome?: string; status?: string };

export default function RecentOrders() {
  const [pedidos, setPedidos] = useState<Record<string, Pedido>>({});
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const q = query(ref(db, "pedidos"), limitToLast(6));
      return onValue(q, (snap) => {
        setPedidos(snap.val() || {});
        setReady(true);
      });
    } catch {
      setReady(true);
    }
  }, []);

  const entries = Object.entries(pedidos).reverse();

  return (
    <section aria-labelledby="recent-title" className="space-y-3">
      <h2 id="recent-title" className="text-2xl font-bold">Pedidos recentes</h2>
      {!ready ? (
        <div className="card">Carregando…</div>
      ) : entries.length ? (
        <div className="grid md:grid-cols-3 gap-3">
          {entries.map(([id, p]) => (
            <div key={id} className="card">
              <p className="text-sm"><strong>Cliente:</strong> {p?.nome || "—"}</p>
              <p className="text-sm"><strong>Status:</strong> {p?.status || "—"}</p>
            </div>
          ))}
        </div>
      ) : (
        <div className="card">Nenhum pedido recente</div>
      )}
    </section>
  );
}