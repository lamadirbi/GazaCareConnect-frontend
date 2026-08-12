"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Button } from "@/components/ui/Button";
import { useLang } from "@/lib/i18n";

type Props = {
  open: boolean;
  physicianName?: string | null;
  busy?: boolean;
  onConfirm: (reason: string) => void;
  onClose: () => void;
};

export function RejectReasonModal({
  open,
  physicianName,
  busy = false,
  onConfirm,
  onClose,
}: Props) {
  const { t } = useLang();
  const [mounted, setMounted] = useState(false);
  const [reason, setReason] = useState("");

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (open) setReason("");
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !busy) onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, busy, onClose]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!open || !mounted) return null;

  const message = physicianName
    ? `${t("rejectModalMessagePrefix")} «${physicianName}». ${t("rejectModalMessageSuffix")}`
    : t("rejectModalMessageGeneric");

  return createPortal(
    <div
      className="gc-confirm-modal-backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby="gc-reject-modal-title"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget && !busy) onClose();
      }}
    >
      <div className="gc-confirm-modal gc-reject-modal" onMouseDown={(e) => e.stopPropagation()}>
        <h2 id="gc-reject-modal-title" className="gc-confirm-modal-title">
          {t("rejectModalTitle")}
        </h2>
        <p className="gc-confirm-modal-message">{message}</p>

        <label className="gc-reject-modal-field">
          <span>{t("rejectReasonLabel")}</span>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={4}
            placeholder={t("rejectReasonPlaceholder")}
            className="gc-reject-modal-textarea"
            autoFocus
            disabled={busy}
          />
        </label>

        <div className="gc-confirm-modal-actions">
          <Button
            type="button"
            variant="secondary"
            className="w-full sm:w-auto"
            onClick={onClose}
            disabled={busy}
          >
            {t("cancel")}
          </Button>
          <Button
            type="button"
            variant="danger"
            className="w-full sm:w-auto"
            disabled={busy || reason.trim().length < 3}
            onClick={() => onConfirm(reason.trim())}
          >
            {busy ? t("rejectConfirming") : t("rejectConfirm")}
          </Button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
