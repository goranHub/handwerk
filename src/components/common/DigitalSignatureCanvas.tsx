import React, { useRef, useState, useEffect } from 'react';
import { Eraser, Check, X } from 'lucide-react';

interface DigitalSignatureCanvasProps {
  title?: string;
  initialSignerName?: string;
  onSave: (signerName: string, signatureDataUrl: string) => void;
  onCancel: () => void;
}

export const DigitalSignatureCanvas: React.FC<DigitalSignatureCanvasProps> = ({
  title = 'Digitale Kundenabnahme',
  initialSignerName = '',
  onSave,
  onCancel,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [signerName, setSignerName] = useState(initialSignerName);
  const [hasDrawn, setHasDrawn] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // High DPI scaling
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = '#0f172a';
  }, []);

  const getCoordinates = (e: React.MouseEvent | React.TouchEvent): { x: number; y: number } | null => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();

    if ('touches' in e && e.touches.length > 0) {
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top,
      };
    } else if ('clientX' in e) {
      return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    }
    return null;
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    const coords = getCoordinates(e);
    if (!coords) return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx) return;

    setIsDrawing(true);
    setHasDrawn(true);
    ctx.beginPath();
    ctx.moveTo(coords.x, coords.y);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    e.preventDefault();
    const coords = getCoordinates(e);
    if (!coords) return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx) return;

    ctx.lineTo(coords.x, coords.y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx || !canvas) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawn(false);
  };

  const handleSave = () => {
    const canvas = canvasRef.current;
    if (!canvas || !signerName.trim() || !hasDrawn) return;
    const dataUrl = canvas.toDataURL('image/png');
    onSave(signerName.trim(), dataUrl);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
        <div>
          <h3 className="text-base font-semibold text-slate-900">{title}</h3>
          <p className="text-xs text-slate-500">Unterschrift des Kunden oder Bauleiters direkt auf dem Bildschirm</p>
        </div>
        <button
          onClick={onCancel}
          className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          type="button"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <div>
        <label className="mb-1 block text-xs font-semibold text-slate-700">Unterzeichnende Person (Name)</label>
        <input
          type="text"
          value={signerName}
          onChange={(e) => setSignerName(e.target.value)}
          placeholder="z. B. Anna Wagner oder Hr. Müller"
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
        />
      </div>

      <div>
        <div className="mb-1 flex items-center justify-between">
          <label className="text-xs font-semibold text-slate-700">Unterschriftsfeld</label>
          <button
            type="button"
            onClick={clearCanvas}
            className="flex items-center gap-1 text-xs text-slate-500 hover:text-red-600"
          >
            <Eraser className="h-3.5 w-3.5" />
            <span>Zurücksetzen</span>
          </button>
        </div>
        <div className="relative overflow-hidden rounded-xl border border-slate-300 bg-white shadow-inner">
          <canvas
            ref={canvasRef}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={stopDrawing}
            className="h-44 w-full touch-none cursor-crosshair bg-white"
          />
          <div className="pointer-events-none absolute bottom-4 left-6 right-6 border-b border-dashed border-slate-300 text-right">
            <span className="text-[10px] text-slate-400">Hier unterschreiben</span>
          </div>
        </div>
      </div>

      <label className="flex items-start gap-2 pt-1 text-xs text-slate-600">
        <input
          type="checkbox"
          checked={confirmed}
          onChange={(e) => setConfirmed(e.target.checked)}
          className="mt-0.5 rounded border-slate-300 text-amber-600 focus:ring-amber-500"
        />
        <span>Ich bestätige die mangelfreie Abnahme bzw. ordnungsgemäße Durchführung der aufgeführten Leistungen.</span>
      </label>

      <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg border border-slate-300 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
        >
          Abbrechen
        </button>
        <button
          type="button"
          onClick={handleSave}
          disabled={!signerName.trim() || !hasDrawn || !confirmed}
          className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-medium text-white shadow-sm hover:bg-emerald-700 disabled:opacity-50"
        >
          <Check className="h-4 w-4" />
          <span>Unterschrift übernehmen</span>
        </button>
      </div>
    </div>
  );
};
