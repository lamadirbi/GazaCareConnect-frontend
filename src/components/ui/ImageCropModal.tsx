"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Button } from "@/components/ui/Button";

type Props = {
  open: boolean;
  file: File | null;
  title?: string;
  onClose: () => void;
  onConfirm: (cropped: File) => void;
};

const VIEWPORT = 280;

export function ImageCropModal({
  open,
  file,
  title = "قص الصورة",
  onClose,
  onConfirm,
}: Props) {
  const [mounted, setMounted] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [natural, setNatural] = useState({ w: 0, h: 0 });
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const [imageReady, setImageReady] = useState(false);
  const dragStart = useRef({ x: 0, y: 0, ox: 0, oy: 0 });
  const imgRef = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open || !file) {
      setImageUrl(null);
      setImageReady(false);
      setNatural({ w: 0, h: 0 });
      return;
    }
    const url = URL.createObjectURL(file);
    setImageUrl(url);
    setImageReady(false);
    setNatural({ w: 0, h: 0 });
    setScale(1);
    setOffset({ x: 0, y: 0 });
    return () => URL.revokeObjectURL(url);
  }, [open, file]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  const onImageLoad = useCallback(() => {
    const img = imgRef.current;
    if (!img) return;
    const w = img.naturalWidth;
    const h = img.naturalHeight;
    if (!w || !h) return;
    setNatural({ w, h });
    const fit = Math.max(VIEWPORT / w, VIEWPORT / h);
    setScale(fit);
    setOffset({ x: (VIEWPORT - w * fit) / 2, y: (VIEWPORT - h * fit) / 2 });
    setImageReady(true);
  }, []);

  function onPointerDown(e: React.PointerEvent) {
    e.currentTarget.setPointerCapture(e.pointerId);
    setDragging(true);
    dragStart.current = { x: e.clientX, y: e.clientY, ox: offset.x, oy: offset.y };
  }

  function onPointerMove(e: React.PointerEvent) {
    if (!dragging) return;
    const dx = e.clientX - dragStart.current.x;
    const dy = e.clientY - dragStart.current.y;
    setOffset({ x: dragStart.current.ox + dx, y: dragStart.current.oy + dy });
  }

  function onPointerUp(e: React.PointerEvent) {
    setDragging(false);
    e.currentTarget.releasePointerCapture(e.pointerId);
  }

  function handleConfirm() {
    const img = imgRef.current;
    if (!img || !file || !imageReady) return;
    const w = img.naturalWidth;
    const h = img.naturalHeight;
    if (!w || !h) return;

    const drawW = w * scale;
    const drawH = h * scale;

    const canvas = document.createElement("canvas");
    canvas.width = VIEWPORT;
    canvas.height = VIEWPORT;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, VIEWPORT, VIEWPORT);
    ctx.drawImage(img, offset.x, offset.y, drawW, drawH);

    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        const base = file.name.replace(/\.[^.]+$/, "") || "photo";
        onConfirm(new File([blob], `${base}-cropped.jpg`, { type: "image/jpeg" }));
      },
      "image/jpeg",
      0.92,
    );
  }

  const minScale = natural.w && natural.h ? Math.max(VIEWPORT / natural.w, VIEWPORT / natural.h) * 0.5 : 0.2;

  if (!open || !file || !mounted) return null;

  return createPortal(
    <div
      className="gc-confirm-modal-backdrop"
      role="dialog"
      aria-modal="true"
      aria-label={title}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="gc-confirm-modal w-full max-w-md" onMouseDown={(e) => e.stopPropagation()}>
        <h2 className="gc-confirm-modal-title">{title}</h2>
        <p className="gc-confirm-modal-message">اسحب الصورة واضبط التكبير ثم احفظ.</p>

        <div
          className="relative mx-auto overflow-hidden rounded-2xl border-2 border-(--gc-accent) bg-zinc-100"
          style={{ width: VIEWPORT, height: VIEWPORT, touchAction: "none" }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
        >
          {imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              ref={imgRef}
              src={imageUrl}
              alt=""
              draggable={false}
              onLoad={onImageLoad}
              className="absolute max-w-none select-none"
              style={{
                width: natural.w ? natural.w * scale : "auto",
                height: natural.h ? natural.h * scale : "auto",
                left: offset.x,
                top: offset.y,
              }}
            />
          ) : null}
        </div>

        <label className="mt-4 grid gap-2">
          <span className="text-xs font-medium text-(--muted)">التكبير</span>
          <input
            type="range"
            min={minScale}
            max={Math.max(minScale * 4, 3)}
            step={0.02}
            value={scale}
            disabled={!imageReady}
            onChange={(e) => setScale(Number(e.target.value))}
            className="w-full"
          />
        </label>

        <div className="gc-confirm-modal-actions mt-4">
          <Button type="button" variant="secondary" onClick={onClose}>
            إلغاء
          </Button>
          <Button type="button" onClick={handleConfirm} disabled={!imageReady}>
            حفظ الصورة
          </Button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
