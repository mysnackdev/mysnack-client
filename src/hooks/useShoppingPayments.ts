import { useEffect, useMemo, useState } from "react";
import { getApp } from "firebase/app";
import { getFunctions, httpsCallable } from "firebase/functions";

/** ==== Domain classes with sane defaults ==== **/

export class BankSettings {
  pix: boolean;
  banks: Record<string, boolean>;
  constructor(init?: Partial<BankSettings> | null | undefined) {
    const i = (init ?? {}) as Record<string, unknown>;
    this.pix = Boolean(i.pix);
    this.banks = (i.banks && typeof i.banks === "object") ? (i.banks as Record<string, boolean>) : {};
  }
}

export class CounterSettings {
  credit: boolean;
  debit: boolean;
  voucher: boolean;
  other: boolean;
  constructor(init?: Partial<CounterSettings> | null | undefined) {
    const i = (init ?? {}) as Record<string, unknown>;
    this.credit = Boolean(i.credit);
    this.debit = Boolean(i.debit);
    this.voucher = Boolean(i.voucher);
    this.other = Boolean(i.other);
  }
}

export class PaymentsNode {
  bank: BankSettings;
  counter: CounterSettings;
  updatedAt?: number;
  updatedBy?: string;
  constructor(raw?: unknown) {
    const r = (raw && typeof raw === "object") ? (raw as Record<string, unknown>) : {};
    // Accept both "bank" and legacy "banking"
    const bankRaw = (r.bank ?? r.banking) as unknown;
    this.bank = new BankSettings((bankRaw && typeof bankRaw === "object") ? (bankRaw as Record<string, unknown>) : {});
    this.counter = new CounterSettings((r.counter && typeof r.counter === "object") ? (r.counter as Record<string, unknown>) : {});
    this.updatedAt = typeof r.updatedAt === "number" ? r.updatedAt : undefined;
    this.updatedBy = typeof r.updatedBy === "string" ? r.updatedBy : undefined;
  }
}

/** API/Hook types **/

export type AcceptedPayments = {
  pix: boolean;
  credit: boolean;
  debit: boolean;
  voucher: boolean;
  other: boolean;
};

type CFResp = {
  ok?: boolean;
  slug?: string;
  source?: string;
  // Node found at backoffice/shoppings/{slug}/payments
  raw?: unknown;
  // Entire shopping node (optional)
  shoppingRaw?: unknown;
  // Optional derived info
  exists?: boolean;
  path?: string;
  error?: unknown;
};

/** Normalizers **/

function normalizeAccepted(raw: unknown): AcceptedPayments {
  const node = new PaymentsNode(raw);
  return {
    pix: !!node.bank.pix,
    credit: !!node.counter.credit,
    debit: !!node.counter.debit,
    voucher: !!node.counter.voucher,
    other: !!node.counter.other,
  };
}

/** Public hook that fetches via CF and exposes a simple shape **/
export function useShoppingPaymentsCF(opts: { slug: string | null; storeId?: string | null; bypass?: unknown | null }) {
  const { slug, storeId = null, bypass = null } = opts || {};
  const [accepted, setAccepted] = useState<AcceptedPayments>({ pix: false, credit: false, debit: false, voucher: false, other: false });
  const [raw, setRaw] = useState<Record<string, unknown>>({});
  const [shoppingRaw, setShoppingRaw] = useState<Record<string, unknown>>({});
  const [exists, setExists] = useState<boolean | null>(null);
  const [path, setPath] = useState<string>("");
  const [source, setSource] = useState<string>("init");
  const [error, setError] = useState<unknown>(null);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    let cancelled = false;
    async function run() {
      const resolvedSlug = (slug || (typeof bypass === "string" ? bypass : null) || "").toString();
      if (!resolvedSlug) {
        setAccepted({ pix: false, credit: false, debit: false, voucher: false, other: false });
        setRaw({});
        setShoppingRaw({});
        setExists(null);
        setPath("");
        setSource("missing-slug");
        return;
      }
      setLoading(true);
      try {
        const app = getApp();
        const region = process.env.NEXT_PUBLIC_FIREBASE_FUNCTIONS_REGION || "us-central1";
        const fns = getFunctions(app, region);
        const call = httpsCallable(fns, "getShoppingPayments");
        const resp = await call({ slug: resolvedSlug, storeId });
        const data = (resp?.data || {}) as CFResp;
        const norm = normalizeAccepted(data?.raw);
        if (!cancelled) {
          setAccepted(norm);
          setRaw((data?.raw && typeof data.raw === "object") ? (data.raw as Record<string, unknown>) : {});
          setShoppingRaw((data?.shoppingRaw && typeof data.shoppingRaw === "object") ? (data.shoppingRaw as Record<string, unknown>) : {});
          setExists(typeof data?.exists === "boolean" ? data.exists : null);
          setPath(typeof data?.path === "string" ? data.path : "");
          setSource(typeof data?.source === "string" ? data.source : "cf");
          setError(null);
        }
      } catch (err) {
        if (!cancelled) {
          setAccepted({ pix: false, credit: false, debit: false, voucher: false, other: false });
          setRaw({});
          setShoppingRaw({});
          setExists(false);
          setPath("");
          setSource("error");
          setError(err);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    run();
    return () => { cancelled = true; };
  }, [slug, storeId, bypass]);

  const empty = useMemo(
    () => !accepted.pix && !accepted.credit && !accepted.debit && !accepted.voucher && !accepted.other,
    [accepted]
  );

  return { accepted, raw, shoppingRaw, exists, path, source, error, loading, empty };
}
