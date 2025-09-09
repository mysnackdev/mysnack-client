"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import type { ChangeEvent } from "react";

export type QrResult = { raw: string; mallId?: string; table?: string };

function parseMall(text: string): QrResult {
  let mallId: string | undefined;
  let table: string | undefined;
  try {
    const j = JSON.parse(text);
    mallId =
      typeof j.mallId === "string"
        ? j.mallId
        : typeof j.mall === "string"
        ? j.mall
        : undefined;
    table =
      typeof j.table === "string"
        ? j.table
        : typeof j.t === "string"
        ? j.t
        : undefined;
  } catch {}
  if (!mallId) {
    try {
      const u = new URL(text);
      mallId =
        u.searchParams.get("mallId") ||
        u.searchParams.get("mall") ||
        undefined;
      table =
        u.searchParams.get("table") || u.searchParams.get("t") || undefined;
    } catch {}
  }
  if (!mallId) {
    const m = text.match(/mall[:=]([a-zA-Z0-9_-]+)/);
    if (m) mallId = m[1];
    const t = text.match(/table[:=]([a-zA-Z0-9_-]+)/);
    if (t) table = t[1];
  }
  if (!mallId && /^[a-zA-Z0-9_-]{6,}$/.test(text)) mallId = text;
  return { raw: text, mallId, table };
}

type Props = {
  open: boolean;
  onClose: () => void;
  onResult: (res: QrResult) => void;
};

/** Tipos locais para uso do BarcodeDetector sem `any` */
type DetectedBarcode = { rawValue?: string; rawData?: string };
type BarcodeDetectorInstance = {
  detect: (source: HTMLVideoElement) => Promise<DetectedBarcode[]>;
};
type BarcodeDetectorCtor = new (options?: {
  formats?: string[];
}) => BarcodeDetectorInstance;

export default function QrScannerDialog({ open, onClose, onResult }: Props) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [error, setError] = useState<string | null>(null);

  const stop = useCallback(() => {
    const v = videoRef.current;
    const stream = (v?.srcObject as MediaStream | null) ?? null;
    stream?.getTracks().forEach((t) => t.stop());
    if (v) v.srcObject = null;
  }, []);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;

    const start = async () => {
      setError(null);
      if (!("mediaDevices" in navigator)) {
        setError("Câmera não suportada");
        return;
      }
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" },
        });
        if (cancelled) return;

        const v = videoRef.current;
        if (!v) return;

        v.srcObject = stream;
        await v.play();

        const Detector =
          (globalThis as unknown as {
            BarcodeDetector?: BarcodeDetectorCtor;
          }).BarcodeDetector;

        if (Detector) {
          const detector = new Detector({ formats: ["qr_code"] });

          const tick = async () => {
            if (cancelled) return;
            try {
              const barcodes = await detector.detect(v);
              const first = barcodes?.[0];
              if (first) {
                const raw = first.rawValue || first.rawData || "";
                const parsed = parseMall(String(raw));
                stop();
                onResult(parsed);
                onClose();
                return;
              }
            } catch {
              // silencioso: continua tentando
            }
            requestAnimationFrame(tick);
          };

          requestAnimationFrame(tick);
        } else {
          setError("Scanner nativo indisponível. Digite o código manualmente.");
        }
      } catch (e: unknown) {
        const message =
          e instanceof Error ? e.message : "Falha ao abrir câmera";
        setError(message);
      }
    };

    void start();

    return () => {
      cancelled = true;
      stop();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, onClose, onResult, stop]);

  const [manual, setManual] = useState("");

  return !open ? null : (
    <div className="fixed inset-0 z-[100] bg-black/70 flex items-center justify-center">
      <div className="bg-white w-[92vw] max-w-[520px] rounded-2xl overflow-hidden shadow-2xl">
        <div className="p-4 border-b font-medium">Escanear QR Code</div>
        <div className="p-4 space-y-3">
          <div className="relative bg-black rounded-xl overflow-hidden aspect-[3/4]">
            <video
              ref={videoRef}
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 border-4 border-white/20 m-8 rounded-xl pointer-events-none" />
          </div>

          {error && <div className="text-sm text-red-600">{error}</div>}

          <div className="flex items-center gap-2">
            <input
              value={manual}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setManual(e.target.value)
              }
              placeholder="Cole o conteúdo do QR aqui (opcional)"
              className="flex-1 border rounded-lg px-3 py-2"
            />
            <button
              onClick={() => {
                const trimmed = manual.trim();
                if (trimmed) {
                  onResult(parseMall(trimmed));
                  onClose();
                }
              }}
              className="px-3 py-2 border rounded-lg"
            >
              OK
            </button>
          </div>

          <div className="flex justify-end">
            <button
              onClick={() => {
                onClose();
              }}
              className="text-sm text-zinc-600"
            >
              Fechar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
