
"use client";
import React, { useCallback, useEffect, useRef, useState, type ChangeEvent } from "react";

/** Payload lido no QR. Aceita URL (?mallId=...&table=...) ou JSON {"mallId":"...","table":"..."} */
export type QrResult = { raw: string; mallId?: string; table?: string };

/** Interface mínima do detector de QR (para browsers que suportam BarcodeDetector). */
type BarcodeDetectorLike = {
  detect(source: CanvasImageSource): Promise<Array<{ rawValue: string }>>;
};

/** Construtor do detector. */
type BDConstructor = new (init?: { formats?: string[] }) => BarcodeDetectorLike;

/** Obtém o construtor do BarcodeDetector (quando disponível no runtime). */
function getBD(): BDConstructor | undefined {
  if (typeof window === "undefined") return undefined;
  const w = window as unknown as { BarcodeDetector?: BDConstructor };
  return w.BarcodeDetector;
}

/** Faz o parse de URL ou JSON do QR para QrResult seguro. */
function parseQrText(text: string): QrResult {
  let mallId: string | undefined;
  let table: string | undefined;
  try {
    const j = JSON.parse(text);
    mallId = typeof j.mallId === "string" ? j.mallId : (typeof j.mall === "string" ? j.mall : undefined);
    table = typeof j.table === "string" ? j.table : undefined;
  } catch {
    try {
      const u = new URL(text);
      mallId = u.searchParams.get("mallId") ?? u.searchParams.get("mall") ?? undefined;
      table = u.searchParams.get("table") ?? undefined;
    } catch {
      const m = /mall(Id)?[:=]\s*([a-zA-Z0-9_-]+)/i.exec(text);
      const t = /table[:=]\s*([a-zA-Z0-9_-]+)/i.exec(text);
      mallId = m?.[2];
      table = t?.[1];
    }
  }
  return { raw: text, mallId, table };
}

export interface QrScannerDialogProps {
  open: boolean;
  onClose: () => void;
  onScan: (result: QrResult) => void;
}

/**
 * Dialog de leitura de QR Code com 2 estratégias:
 * 1) BarcodeDetector (quando suportado)
 * 2) Fallback: upload de imagem / colar texto do QR
 */
export default function QrScannerDialog({ open, onClose, onScan }: QrScannerDialogProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [supported, setSupported] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let canceled = false;
    function checkSupport() {
      try {
        const BD = getBD();
        setSupported(!!BD);
      } catch {
        setSupported(false);
      }
      if (canceled) return;
    }
    if (open) checkSupport();
    return () => { canceled = true; };
  }, [open]);

  // Loop de detecção quando supported === true
  useEffect(() => {
    let stream: MediaStream | undefined;
    let raf = 0;
    let running = false;

    async function start() {
      if (!open || !supported) return;
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
        if (!videoRef.current) return;
        videoRef.current.srcObject = stream;
        await videoRef.current.play();

        running = true;
        const BD = getBD();
        if (!BD) throw new Error("BarcodeDetector indisponível");
        const detector = new BD({ formats: ["qr_code"] });

        const tick = async () => {
          if (!running) return;
          try {
            const video = videoRef.current!;
            const canvas = canvasRef.current!;
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const ctx = canvas.getContext("2d");
            if (ctx) {
              ctx.drawImage(video, 0, 0);
              const results = await detector.detect(canvas);
              if (results && results[0]?.rawValue) {
                const res = parseQrText(results[0].rawValue);
                onScan(res);
                onClose();
                return;
              }
            }
          } catch (_e: unknown) {
            console.log(_e);
            // mantém silencioso para não interromper o loop
            // console.warn("qr tick error", e);
          }
          raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
      } catch (_e: unknown) {
        const msg = _e instanceof Error ? _e.message : "Não foi possível acessar a câmera.";
        setError(msg);
      }
    }

    void start();
    return () => {
      running = false;
      if (raf) cancelAnimationFrame(raf);
      if (stream) stream.getTracks().forEach(t => t.stop());
    };
  }, [open, supported, onScan, onClose]);

  const onPasteText = useCallback((e: ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.currentTarget.value.trim();
    if (val.length === 0) return;
    onScan(parseQrText(val));
    onClose();
  }, [onClose, onScan]);

  const onPickImage = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.currentTarget.files?.[0];
    if (!file) return;
    try {
      const img = new Image();
      img.src = URL.createObjectURL(file);
      await img.decode();
      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(img, 0, 0);
        const BD = getBD();
        if (BD) {
          const detector = new BD({ formats: ["qr_code"] });
          const results = await detector.detect(canvas);
          const raw = results?.[0]?.rawValue;
          if (raw) {
            onScan(parseQrText(raw));
            onClose();
            return;
          }
        }
      }
      setError("Não foi possível ler o QR desta imagem.");
    } catch (_e: unknown) {
      console.log(_e);
      const msg = _e instanceof Error ? _e.message : "Falha ao processar a imagem.";
      setError(msg);
    }
  }, [onScan, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center">
      <div className="w-[92%] max-w-md rounded-2xl bg-white shadow-lg p-4">
        <div className="text-lg font-semibold">Escanear QR Code</div>
        <p className="text-sm text-zinc-600 mt-1">Aponte a câmera para o QR da mesa ou cole/importe o conteúdo.</p>

        {error && <div className="mt-2 rounded-md bg-red-50 text-red-700 px-3 py-2 text-sm">{error}</div>}

        {supported ? (
          <div className="mt-3 rounded-xl overflow-hidden bg-black">
            <video ref={videoRef} className="w-full h-56 object-cover" muted playsInline />
            <canvas ref={canvasRef} className="hidden" />
          </div>
        ) : (
          <div className="mt-3 text-sm text-zinc-700">
            <p>Seu navegador não suporta leitura de QR em tempo real. Use uma das opções abaixo:</p>
          </div>
        )}

        <div className="mt-3">
          <label className="block text-sm font-medium">Importar imagem com QR</label>
          <input type="file" accept="image/*" onChange={onPickImage} className="mt-1 block w-full text-sm" />
        </div>

        <div className="mt-3">
          <label className="block text-sm font-medium">Ou cole o conteúdo (URL/JSON)</label>
          <textarea className="mt-1 w-full min-h-[80px] rounded-xl border border-zinc-200 p-3 text-sm" onChange={onPasteText} placeholder='{"mallId":"...","table":"..."} ou https://...?mallId=...&table=...' />
        </div>

        <div className="mt-4 flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 rounded-xl border border-zinc-200">Cancelar</button>
        </div>
      </div>
    </div>
  );
}
