import { useEffect, useMemo, useState } from "react";
import { getApp } from "firebase/app";
import { getFunctions, httpsCallable } from "firebase/functions";

export type AcceptedPayments = {
  pix: boolean;
  credit: boolean;
  debit: boolean;
  voucher: boolean;
  other: boolean;
};

type CFResp = {
  ok: boolean;
  slug: string;
  source: string;
  path: string;
  exists: boolean;
  accepted: AcceptedPaymentsLike;
  raw: any;
  shoppingRaw: any;
};

type AcceptedPaymentsLike = {
  pix?: any;
  credit?: any;
  debit?: any;
  voucher?: any;
  other?: any;
  counter?: { credit?: any; debit?: any; voucher?: any; other?: any };
  bank?: { pix?: any };
  banking?: { pix?: any };
};

function normalizeAccepted(raw: any): AcceptedPayments {
  const bank = raw?.bank ?? raw?.banking ?? {};
  const counter = raw?.counter ?? {};
  return {
    pix: !!bank.pix,
    credit: !!counter.credit,
    debit: !!counter.debit,
    voucher: !!counter.voucher,
    other: !!counter.other,
  };
}

function normalizeAcceptedFromLike(like: AcceptedPaymentsLike): AcceptedPayments {
  if (!like) return { pix:false, credit:false, debit:false, voucher:false, other:false };
  const bank = (like as any).bank ?? (like as any).banking ?? {};
  const counter = (like as any).counter ?? {};
  const flatPix = (like as any).pix;
  const flatCredit = (like as any).credit;
  const flatDebit = (like as any).debit;
  const flatVoucher = (like as any).voucher;
  const flatOther = (like as any).other;
  return {
    pix: !!(bank.pix ?? flatPix),
    credit: !!(counter.credit ?? flatCredit),
    debit: !!(counter.debit ?? flatDebit),
    voucher: !!(counter.voucher ?? flatVoucher),
    other: !!(counter.other ?? flatOther),
  };
}

export function useShoppingPaymentsCF(opts: {
  slug: string | null;
  storeId?: string | null;
  bypass?: any | null;
}) {
  const { slug, storeId = null, bypass = null } = opts || {};
  const [accepted, setAccepted] = useState<AcceptedPayments>({ pix:false, credit:false, debit:false, voucher:false, other:false });
  const [raw, setRaw] = useState<any>({});
  const [shoppingRaw, setShoppingRaw] = useState<any>({});
  const [exists, setExists] = useState<boolean | null>(null);
  const [path, setPath] = useState<string>("");
  const [source, setSource] = useState<string>("init");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      setError(null);

      // 1) Prefer BYPASS payload if it already contains shopping.payments
      const bpShop = bypass?.shopping || bypass?.mall || null;
      const bpPayments = bpShop?.payments || bypass?.payments || null;
      if (bpPayments) {
        const norm = normalizeAcceptedFromLike(bpPayments);
        if (!cancelled) {
          setAccepted(norm);
          setRaw(bpPayments);
          setShoppingRaw(bpShop || {});
          setExists(true);
          setPath(`(bypass).shopping.payments`);
          setSource("bypass:payload");
          setLoading(false);
        }
        return;
      }

      // 2) Otherwise fetch from Cloud Functions
      const resolvedSlug = slug || bpShop?.slug || bpShop?.shoppingSlug || null;
      if (!resolvedSlug && !storeId) {
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
          setRaw(data?.raw ?? {});
          setShoppingRaw(data?.shoppingRaw ?? {});
          setExists(!!data?.exists);
          setPath(data?.path || "");
          setSource(data?.source || "cf:getShoppingPayments");
        }
      } catch (e: any) {
        if (!cancelled) setError(e?.message || String(e));
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
