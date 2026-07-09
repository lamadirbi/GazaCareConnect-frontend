"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Button } from "@/components/ui/Button";

type Props = {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onClose: () => void;
};

export function ConfirmModal({
  open,
  title,
  message,
  confirmLabel = "نعم، خروج",
  cancelLabel = "إلغاء",
  onConfirm,
  onClose,
}: Props) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!open || !mounted) return null;

  return createPortal(
    <div
      className="gc-confirm-modal-backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby="gc-confirm-modal-title"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="gc-confirm-modal" onMouseDown={(e) => e.stopPropagation()}>
        <h2 id="gc-confirm-modal-title" className="gc-confirm-modal-title">
          {title}
        </h2>
        <p className="gc-confirm-modal-message">{message}</p>
        <div className="gc-confirm-modal-actions">
          <Button type="button" variant="secondary" className="w-full sm:w-auto" onClick={onClose}>
            {cancelLabel}
          </Button>
          <Button type="button" variant="danger" className="w-full sm:w-auto" onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
