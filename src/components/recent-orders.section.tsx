"use client";
import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import { onValue, ref, query, limitToLast } from "firebase/database";

type OrderLite = { nome?: string; status?: string };

export default function RecentOrders() {
  const [pedidos, setPedidos] = useState<Record<string, OrderLite>>({});
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const q = query(ref(db, "orders"), limitToLast(6));
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
        <div className="card">Loading…</div>
      ) : entries.length ? (
        <div className="grid md:grid-cols-3 gap-3">
          {entries.map(([id, p]) => (
            <div key={id} className="card">
              <p className="text-sm"><strong>Customer:</strong> {p?.nome || "—"}</p>
              <p className="text-sm"><strong>Status:</strong> {p?.status || "—"}</p>
            </div>
          ))}
        </div>
      ) : (
        <div className="card">No recent orders</div>
      )}
    </section>
  );
}