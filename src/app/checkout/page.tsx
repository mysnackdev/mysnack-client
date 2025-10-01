"use client";
import React, { useEffect, useMemo, useState } from "react";
import { useShoppingPaymentsCF } from "@/hooks/useShoppingPayments";
import { useRouter } from "next/navigation";
import { getDatabase, onValue, ref as r } from "firebase/database";
import { getFunctions, httpsCallable } from "firebase/functions";
import { getAuth } from "firebase/auth";
import app from "@/firebase";
import BottomNav from "@/components/BottomNav";
import QrScannerDialog, { QrResult } from "@/components/common/QrScannerDialog";
import { readUserSavedCards } from "@/services/user-cards.service";
import { mockSelectTableForCheckout } from "@/services/mockTable";

type PaymentMethod =
  | "pix"
  | "google_pay"
  | "credit_card"
  | "debit_card"
  | "wallet"
  | "cash_on_delivery";
type Step =
  | "itens"
  | "pagamento"
  | "revisao"
  | "aguardando"
  | "sucesso"
  | "falha"
  | "cancelado";

type CartItem = { id: string | number; name: string; price: number; qty?: number; storeId?: string };

type UserCard = {
  id: string;
  brand?: string;
  last4: string;
  expMonth?: number;
  expYear?: number;
  holder?: string;
  tokenRef?: string;
};

function currency(v: number) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}




export default function CheckoutPage() {
  const router = useRouter();
  const auth = getAuth();
  const db = getDatabase(app);
  const fns = getFunctions(
    app,
    process.env.NEXT_PUBLIC_FIREBASE_FUNCTIONS_REGION || "us-central1"
  );

  const [step, setStep] = useState<Step>("itens");
  // --- Bypass de QR: seleciona uma mesa de teste no shopping da loja ---
  // Usa backoffice/stores/{storeId}/shoppingSlug (leitura pública) e evita ler /backoffice/shoppings
  
  // --- Bypass de QR: usa service que resolve o shopping via backoffice/shoppings/{slug}/store/{id}
  async function handleBypassQr() {
    try {
      if (!storeId) {
        alert("Loja não identificada para mockar a mesa.");
        return;
      }
      const res = await mockSelectTableForCheckout(storeId);
      setTableInfo(res);
    } catch (err: unknown) {
      console.error("mockSelectTable error", err);
      alert(err instanceof Error ? err.message : "Falha ao mockar mesa.");
    }
  }


  const [items, setItems] = useState<CartItem[]>([]);
  const [storeId, setStoreId] = useState<string>("");
  const [shoppingSlug, setShoppingSlug] = useState<string>("");
  const paymentsCF = useShoppingPaymentsCF({ slug: shoppingSlug || null, storeId, bypass: shoppingSlug || null });
  const accepted = useMemo(() => ({
    pix: paymentsCF.accepted.pix,
    credit_card: paymentsCF.accepted.credit,
    debit_card: paymentsCF.accepted.debit,
    wallet: false,
    google_pay: false,
    cash_on_delivery: false,
  }), [paymentsCF.accepted]);

// replaced by hook:
// const [accepted, setAccepted] = useState<Record<string, boolean>>({});
// computed by hook: paymentsCF.empty
  // diagnostics for payments
  const [payment, setPayment] = useState<PaymentMethod | null>(null);
  const [cpf, setCpf] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [qrOpen, setQrOpen] = useState(false);
  const [tableInfo, setTableInfo] = useState<QrResult | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);

  // cartões do usuário (RTDB)
  const [cards, setCards] = useState<UserCard[]>([]);
  const [selectedCard, setSelectedCard] = useState<string | undefined>();
  const [loadingCards, setLoadingCards] = useState(false);
  const [cardsError, setCardsError] = useState<string | null>(null);

  // Load cart from localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem("mysnack_cart");
      const arr = raw ? JSON.parse(raw) : [];
      setItems(Array.isArray(arr) ? arr.filter(Boolean) : []);

      const meta = localStorage.getItem("mysnack_cart_meta");
      const m = meta ? JSON.parse(meta) : null;
      if (m?.storeId) setStoreId(String(m.storeId));
    } catch {}
  }, []);
// carregar cartões quando o usuário escolher "Cartão de crédito"
  useEffect(() => {
    const shouldLoad = step === "pagamento" && payment === "credit_card";
    if (!shouldLoad) return;

    (async () => {
      try {
        setLoadingCards(true);
        setCardsError(null);
        const uid = auth.currentUser?.uid;
        if (!uid) {
          setCards([]);
          return;
        }
        const list = await readUserSavedCards(uid); // lê de client/payments/cards/{uid}/{cardId}
        setCards(list);
        // mantém seleção anterior se ainda existir
        if (list.length && selectedCard && !list.find((c) => c.id === selectedCard)) {
          setSelectedCard(undefined);
        }
      } catch (err: unknown) {
        console.error("mockSelectTable error", err);
        alert(err instanceof Error ? err.message : "Falha ao mockar mesa.");
      } finally {
        setLoadingCards(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, payment]);

  const subtotal = useMemo(
    () =>
      items.reduce(
        (s, it) => s + Number(it.price || 0) * Number(it.qty || 1),
        0
      ),
    [items]
  );
  const serviceFee = 0;
  const deliveryFee = 0;
  const discount = 0;
  const total = Math.max(0, subtotal + serviceFee + deliveryFee - discount);

  async function finalizeOrder() {
    const user = auth.currentUser;
    if (!user?.uid) {
      alert("Faça login para finalizar seu pedido.");
      router.push("/auth");
      return;
    }
    if (!storeId || !payment) return;

    // se for cartão, exigir um cartão selecionado (quando houver cartões)
    if (payment === "credit_card" && cards.length > 0 && !selectedCard) {
      alert("Selecione um cartão para continuar.");
      setStep("pagamento");
      return;
    }

    const call = httpsCallable(fns, "createOrder");
    const payload: Record<string, unknown> = {
      storeId,
      items: items.map((i) => ({
        id: i.id,
        name: i.name,
        price: i.price,
        qty: i.qty || 1,
      })),
      totals: { serviceFee, deliveryFee, discounts: discount },
      pickup: {
        type: "entrega",
        table: tableInfo
          ? {
              mallId: tableInfo.mallId || null,
              table: tableInfo.table || null,
              raw: tableInfo.raw,
            }
          : null,
      },
      payment: {
        method: payment,
        intent: payment === "cash_on_delivery" ? "on_delivery" : "online",
        cardId: payment === "credit_card" ? selectedCard || null : null,
      },
      meta: { cpfOnInvoice: cpf || null, notes: notes || null },
    };
    try {
      const res: unknown = await call(payload);
      const id: string = ((typeof res === "object" && res && "data" in res ? (res as { data?: { orderId?: string } }).data?.orderId : undefined) as string);
      setOrderId(id || null);

      // limpa carrinho só após sucesso
      if (typeof res === "object" && res && "data" in res && ((res as { data?: { payment?: { intent?: string } } }).data?.payment?.intent === "online")) {
        setStep("aguardando");
        const payRef = r(db, `orders/${id}/payment/status`);
        const off = onValue(payRef, (s) => {
          const st = s.val();
          if (st === "approved") {
            localStorage.setItem("mysnack_cart", JSON.stringify([]));
            setStep("sucesso");
            setTimeout(() => router.push("/orders"), 600);
            off();
          } else if (st === "declined") {
            setStep("falha");
            off();
          }
        });
      } else {
        localStorage.setItem("mysnack_cart", JSON.stringify([]));
        setStep("sucesso");
        setTimeout(() => router.push("/orders"), 400);
      }
    } catch (e) {
      console.error(e);
      alert("Não foi possível criar o pedido.");
    }
  }

  return (
    <div className="min-h-screen pb-20">

      <main className="mx-auto max-w-2xl p-4 space-y-6">
        <Stepper step={step} />

        {step === "itens" && (
          <section className="rounded-2xl border p-4 space-y-4">
            <CartReview items={items} />
            <div className="space-y-2">
              <div className="font-medium">Local de entrega</div>
              <button
                className="w-full rounded-xl px-4 py-3 bg-indigo-600 text-white font-medium"
                onClick={() => setQrOpen(true)}
              >
                Ler QR da mesa
              </button>
              {tableInfo && (
                <div className="text-sm text-neutral-700">
                  Mesa: <strong>{tableInfo.table || "?"}</strong>
                  {tableInfo.mallId && (
                    <>
                      {" "}
                      · Shopping: <strong>{tableInfo.mallId}</strong>
                    </>
                  )}
                </div>
              )}
              <p className="text-xs text-neutral-500">
                A câmera será aberta para leitura do QR da mesa. Também é possível
                colar o conteúdo do QR no diálogo.
              </p>
              {(<button className="btn-secondary w-full mt-2" onClick={handleBypassQr}>Usar mesa de teste (bypass QR)</button>)}
            </div>
            <Summary
              subtotal={subtotal}
              serviceFee={serviceFee}
              deliveryFee={deliveryFee}
              discount={discount}
              total={total}
            />
            <div className="flex gap-3">
              <button className="btn-secondary flex-1" onClick={() => router.back()}>
                Voltar
              </button>
              <button
                className="btn-primary flex-1"
                disabled={!items.length || !tableInfo}
                onClick={() => setStep("pagamento")}
              >
                Continuar
              </button>
            </div>
            <QrScannerDialog
              open={qrOpen}
              onClose={() => setQrOpen(false)}
              onScan={(res) => {
                setTableInfo(res);
                setQrOpen(false);
              }}
            />
          </section>
        )}

        {step === "pagamento" && (
          <section className="rounded-2xl border p-4 space-y-4">
            {paymentsCF.empty && (
              <div className="rounded-xl border p-3 text-sm space-y-2 bg-neutral-50">
                <div className="font-medium">🔍 Diagnóstico dos meios de pagamento</div>
                <ul className="list-disc pl-5 space-y-1">
                  <li><strong>Path consultado:</strong> {paymentsCF.path || "(desconhecido)"}</li>
                  <li><strong>Nó payments existe?</strong> {paymentsCF.exists === null ? "desconhecido" : (paymentsCF.exists ? "sim" : "não")}</li>
                  <li><strong>Erro de leitura:</strong> {paymentsCF.error ? String(paymentsCF.error) : "nenhum erro retornado"}</li>
                  <li><strong>Mapa normalizado (accepted):</strong> {JSON.stringify(accepted)}</li>
                  <li><strong>RAW payments:</strong> <pre className="whitespace-pre-wrap break-words">{JSON.stringify(paymentsCF.raw ?? {}, null, 2)}</pre></li>
                  <li><strong>RAW shopping:</strong> <pre className="whitespace-pre-wrap break-words">{JSON.stringify(paymentsCF.shoppingRaw ?? {}, null, 2)}</pre></li>
                </ul>
              </div>
            )}
            <PaymentOptions
              accepted={accepted}
              value={payment}
              onChange={setPayment}
              cards={cards}
              selectedCard={selectedCard}
              onSelectCard={setSelectedCard}
              loadingCards={loadingCards}
              cardsError={cardsError}
            />
            <div className="flex gap-3">
              <button className="btn-secondary flex-1" onClick={() => setStep("itens")}>
                Voltar
              </button>
              <button
                className="btn-primary flex-1"
                disabled={
                  !payment ||
                  (payment === "credit_card" && cards.length > 0 && !selectedCard)
                }
                onClick={() => setStep("revisao")}
              >
                Revisar pedido
              </button>
            </div>
          </section>
        )}

        {step === "revisao" && (
          <section className="rounded-2xl border p-4 space-y-4">
            <Summary
              subtotal={subtotal}
              serviceFee={serviceFee}
              deliveryFee={deliveryFee}
              discount={discount}
              total={total}
            />
            <div className="grid gap-2">
              <input
                className="input"
                placeholder="CPF na nota (opcional)"
                value={cpf}
                onChange={(e) => setCpf(e.target.value)}
              />
              <textarea
                className="input"
                placeholder="Observações ao estabelecimento"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
            <div className="flex gap-3">
              <button className="btn-secondary flex-1" onClick={() => setStep("pagamento")}>
                Voltar
              </button>
              <button className="btn-primary flex-1" onClick={finalizeOrder}>
                Finalizar pedido • {currency(total)}
              </button>
            </div>
          </section>
        )}

        {step === "aguardando" && (
          <div className="rounded-2xl border p-6 text-center">
            <div className="text-lg font-medium">Aguardando confirmação do pagamento…</div>
            <div className="mt-2 text-sm text-neutral-600">Pedido #{orderId}</div>
            <div className="py-8 animate-pulse">⏳</div>
            <button className="btn-secondary" onClick={() => setStep("pagamento")}>
              Trocar forma de pagamento
            </button>
          </div>
        )}

        {step === "sucesso" && <Result ok onSeeOrders={() => router.push("/orders")} />}
        {step === "falha" && <Result ok={false} onRetry={() => setStep("pagamento")} />}
        {step === "cancelado" && (
          <Result ok={false} cancelled onRetry={() => setStep("pagamento")} />
        )}
      </main>

      <BottomNav />
    </div>
  );
}

function Stepper({ step }: { step: string }) {
  const steps = ["itens", "pagamento", "revisao", "aguardando"];
  const idx = steps.indexOf(step);
  const labels = ["Sacola", "Pagamento", "Revisão", "Status"];
  return (
    <div className="grid grid-cols-4 gap-2 text-sm">
      {labels.map((label, i) => (
        <div
          key={label}
          className={`p-2 rounded-xl text-center ${
            i <= idx ? "bg-pink-100 font-medium" : "bg-neutral-100"
          }`}
        >
          {label}
        </div>
      ))}
    </div>
  );
}

function CartReview({ items }: { items: CartItem[] }) {
  return (
    <ul className="divide-y rounded-2xl border">
      {items.map((it) => (
        <li key={String(it.id)} className="flex items-center justify-between p-3">
          <div>
            <div className="font-medium">{it.name}</div>
            <div className="text-sm text-neutral-600">
              {Number(it.qty || 1)} × {currency(Number(it.price || 0))}
            </div>
          </div>
          <div className="font-semibold">
            {currency(Number(it.price || 0) * Number(it.qty || 1))}
          </div>
        </li>
      ))}
    </ul>
  );
}

function PaymentOptions({
  accepted,
  value,
  onChange,
  cards,
  selectedCard,
  onSelectCard,
  loadingCards,
  cardsError,
}: {
  accepted: Record<string, boolean>;
  value: PaymentMethod | null;
  onChange: (m: PaymentMethod) => void;
  cards: UserCard[];
  selectedCard?: string;
  onSelectCard: (id: string) => void;
  loadingCards: boolean;
  cardsError: string | null;
}) {
  const options = [
    { key: "pix", label: "Pix" },
    { key: "google_pay", label: "Google Pay" },
    { key: "credit_card", label: "Cartão de crédito" },
    { key: "debit_card", label: "Cartão de débito" },
    { key: "wallet", label: "Carteira" },
    { key: "cash_on_delivery", label: "Pagar na retirada" },
  ].filter((o) => accepted?.[o.key]);

  return (
    <div className="space-y-3">
      <div className="font-medium">Formas de pagamento</div>
      {options.length === 0 && (
        <div className="text-sm text-neutral-600">
          Nenhum método disponível nesta loja.
        </div>
      )}
      <div className="space-y-2">
        {options.map((o) => (
          <label key={o.key} className="flex items-center justify-between rounded-xl border p-3">
            <div>{o.label}</div>
            <input
              type="radio"
              name="pay"
              checked={value === (o.key as PaymentMethod)}
              onChange={() => onChange(o.key as PaymentMethod)}
            />
          </label>
        ))}
      </div>

      {/* Lista real de cartões (sem mock) */}
      {value === "credit_card" && (
        <div className="rounded-xl bg-neutral-50 p-3">
          <div className="text-sm font-medium mb-2">Seus cartões</div>

          {loadingCards && (
            <div className="text-sm text-neutral-500">Carregando cartões…</div>
          )}
          {cardsError && <div className="text-sm text-red-600">{cardsError}</div>}

          {!loadingCards && !cardsError && cards.length === 0 && (
            <div className="text-sm text-neutral-500">
              Nenhum cartão salvo no seu cadastro.
            </div>
          )}

          {cards.length > 0 && (
            <ul className="space-y-2">
              {cards.map((c) => (
                <li key={c.id}>
                  <label className="flex items-center gap-3 rounded-lg border border-neutral-300 px-3 py-2 cursor-pointer hover:border-neutral-400">
                    <input
                      type="radio"
                      name="card"
                      className="mt-0.5"
                      checked={selectedCard === c.id}
                      onChange={() => onSelectCard(c.id)}
                    />
                    <div className="flex-1">
                      <div className="text-sm font-medium">
                        {c.brand ?? "Cartão"} •••• {c.last4}
                      </div>
                      <div className="text-xs text-neutral-500">
                        {c.holder ? `${c.holder} · ` : ""}Venc.{" "}
                        {c.expMonth?.toString().padStart(2, "0")}/{c.expYear}
                      </div>
                    </div>
                  </label>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

function Summary({
  subtotal,
  serviceFee,
  deliveryFee,
  discount,
  total,
}: {
  subtotal: number;
  serviceFee: number;
  deliveryFee: number;
  discount: number;
  total: number;
}) {
  return (
    <div className="text-sm space-y-1">
      <div className="flex justify-between py-1">
        <span>Subtotal</span>
        <span>{currency(subtotal)}</span>
      </div>
      {serviceFee > 0 && (
        <div className="flex justify-between py-1">
          <span>Taxa de serviço</span>
          <span>{currency(serviceFee)}</span>
        </div>
      )}
      {deliveryFee > 0 && (
        <div className="flex justify-between py-1">
          <span>Entrega</span>
          <span>{currency(deliveryFee)}</span>
        </div>
      )}
      {discount > 0 && (
        <div className="flex justify-between py-1 text-green-600">
          <span>Descontos</span>
          <span>-{currency(discount)}</span>
        </div>
      )}
      <div className="flex justify-between py-2 border-t mt-2 font-medium">
        <span>Total</span>
        <span>{currency(total)}</span>
      </div>
    </div>
  );
}

function Result({
  ok,
  cancelled,
  onRetry,
  onSeeOrders,
}: {
  ok?: boolean;
  cancelled?: boolean;
  onRetry?: () => void;
  onSeeOrders?: () => void;
}) {
  return (
    <div className="rounded-2xl border p-6 text-center space-y-3">
      <div className="text-lg font-medium">
        {ok ? "Pedido confirmado!" : cancelled ? "Pagamento cancelado" : "Pagamento recusado"}
      </div>
      <div className="flex gap-3 justify-center">
        {!ok && <button className="btn-secondary" onClick={onRetry}>Trocar pagamento</button>}
        <button className="btn-primary" onClick={onSeeOrders}>Ver meus pedidos</button>
      </div>
    </div>
  );
}