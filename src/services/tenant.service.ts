"use client";
import { get, getDatabase, ref } from "firebase/database";

export type DeliveryArea =
  | { id: string; type: "radius"; center: { lat: number; lng: number }; radiusKm: number; name?: string; etaMin?: number; etaMax?: number; feeBase?: number; feePerKm?: number; minOrder?: number }
  | { id: string; type: "polygon"; points: Array<{ lat: number; lng: number }>; name?: string; etaMin?: number; etaMax?: number; feeBase?: number; feePerKm?: number; minOrder?: number };

export type TenantDelivery = {
  enabled?: boolean;
  modes?: { delivery?: boolean; pickup?: boolean; inhouse?: boolean };
  areas?: Record<string, unknown>;
  updatedAt?: number;
};

export const Geo = {
  haversineKm(a: { lat: number; lng: number }, b: { lat: number; lng: number }): number {
    const R = 6371; // km
    const dLat = ((b.lat - a.lat) * Math.PI) / 180;
    const dLon = ((b.lng - a.lng) * Math.PI) / 180;
    const lat1 = (a.lat * Math.PI) / 180;
    const lat2 = (b.lat * Math.PI) / 180;
    const sinDLat = Math.sin(dLat / 2);
    const sinDLon = Math.sin(dLon / 2);
    const c = 2 * Math.asin(Math.sqrt(sinDLat ** 2 + Math.cos(lat1) * Math.cos(lat2) * sinDLon ** 2));
    return R * c;
  },
  pointInRadius(point: { lat: number; lng: number }, center: { lat: number; lng: number }, radiusKm: number): boolean {
    return this.haversineKm(point, center) <= radiusKm;
  },
};

function asNumber(v: unknown, d = 0): number {
  return typeof v === "number" && isFinite(v) ? v : d;
}
function asBool(v: unknown, d = false): boolean {
  return typeof v === "boolean" ? v : d;
}

export async function getTenantDelivery(tenantId: string): Promise<TenantDelivery | null> {
  try {
    const db = getDatabase();
    const snap = await get(ref(db, `client/stores/${tenantId}/delivery`));
    if (!snap.exists()) return null;
    const raw = snap.val() || {};
    const areas: Record<string, unknown> = raw.areas || {};
    const normAreas: Record<string, DeliveryArea> = {};
    for (const [id, a] of Object.entries(areas as Record<string, unknown>)) {
      const area = a as Record<string, unknown>;
      const type = String(area.type || "radius");
      if (type === "radius") {
        normAreas[id] = {
          id,
          type: "radius",
          center: { lat: asNumber(area.center && (area.center as Record<string, unknown>).lat), lng: asNumber(area.center && (area.center as Record<string, unknown>).lng) },
          radiusKm: asNumber(area.radiusKm),
          name: area.name as string | undefined,
          etaMin: asNumber(area.etaMin),
          etaMax: asNumber(area.etaMax),
          feeBase: asNumber(area.feeBase),
          feePerKm: asNumber(area.feePerKm),
          minOrder: asNumber(area.minOrder),
        };
      } else if (Array.isArray(area.points)) {
        normAreas[id] = {
          id,
          type: "polygon",
          points: Array.isArray(area["points"]) ? area["points"].map((p: unknown) => {
            const point = p as Record<string, unknown>;
            return { lat: asNumber(point['lat']), lng: asNumber(point['lng']) };
          }) : [],
          name: area.name as string | undefined,
          etaMin: asNumber(area.etaMin),
          etaMax: asNumber(area.etaMax),
          feeBase: asNumber(area.feeBase),
          feePerKm: asNumber(area.feePerKm),
          minOrder: asNumber(area.minOrder),
        } as DeliveryArea;
      }
    }
    return {
      enabled: asBool(raw.enabled, false),
      modes: {
        delivery: asBool(raw.modes?.delivery),
        pickup: asBool(raw.modes?.pickup),
        inhouse: asBool(raw.modes?.inhouse),
      },
      areas: normAreas,
      updatedAt: asNumber(raw.updatedAt),
    };
  } catch (e) {
    console.error("getTenantDelivery failed", e);
    return null;
  }
}

/** Verifica se o ponto está coberto por pelo menos uma área do tenant */
export function coversPoint(delivery: TenantDelivery | null, point: { lat: number; lng: number }): { ok: boolean; etaMin?: number; etaMax?: number } {
  if (!delivery || delivery.enabled === false) return { ok: false };
  const areas = delivery.areas || {};
  for (const a of Object.values(areas) as DeliveryArea[]) {
    if (!a) continue;
    if (a.type === "radius") {
      if (Geo.pointInRadius(point, a.center, a.radiusKm)) {
        return { ok: true, etaMin: typeof a.etaMin === "number" ? a.etaMin : undefined, etaMax: typeof a.etaMax === "number" ? a.etaMax : undefined };
      }
    } else if (a.type === "polygon") {
      const pts = a.points;
      if (pts.length) {
        const cx = pts.reduce((s, p) => s + p.lat, 0) / pts.length;
        const cy = pts.reduce((s, p) => s + p.lng, 0) / pts.length;
        const maxR = Math.max(...pts.map((p) => Geo.haversineKm({ lat: cx, lng: cy }, p)));
        if (Geo.pointInRadius(point, { lat: cx, lng: cy }, maxR)) {
          return { ok: true };
        }
      }
    }
  }
  return { ok: false };
}
