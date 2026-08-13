"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Button } from "@/components/ui/Button";
import { CAREGIVER_RELATIONSHIPS, type CaregiverRelationship } from "@/lib/caregiver";
import { getCaregiverRelationshipLabel, useLang } from "@/lib/i18n";
import { useBodyScrollLock } from "@/lib/useBodyScrollLock";

type Props = {
  open: boolean;
  initialRelationship?: string | null;
  saving?: boolean;
  onConfirm: (relationship: CaregiverRelationship) => void;
  onClose: () => void;
};

export function CaregiverModeModal({
  open,
  initialRelationship,
  saving = false,
  onConfirm,
  onClose,
}: Props) {
  const { t, lang } = useLang();
  const [mounted, setMounted] = useState(false);
  const [relationship, setRelationship] = useState<CaregiverRelationship | "">("");

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    const valid = CAREGIVER_RELATIONSHIPS.some((r) => r.value === initialRelationship);
    setRelationship(valid ? (initialRelationship as CaregiverRelationship) : "");
  }, [open, initialRelationship]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  useBodyScrollLock(open);

  if (!open || !mounted) return null;

  return createPortal(
    <div
      className="gc-confirm-modal-backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby="gc-caregiver-modal-title"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="gc-confirm-modal w-full max-w-sm" onMouseDown={(e) => e.stopPropagation()}>
        <h2 id="gc-caregiver-modal-title" className="gc-confirm-modal-title">
          {t("caregiverModalTitle")}
        </h2>
        <p className="gc-confirm-modal-message">{t("caregiverModalDesc")}</p>
        <label className="mt-4 block text-sm font-medium text-foreground" htmlFor="caregiver-relationship">
          {t("caregiverRelationshipLabel")}
        </label>
        <select
          id="caregiver-relationship"
          value={relationship}
          onChange={(e) => setRelationship(e.target.value as CaregiverRelationship)}
          className="mt-2 w-full rounded-xl border border-(--border) bg-(--surface) px-3 py-2.5 text-sm"
          disabled={saving}
        >
          <option value="">{t("caregiverRelationshipPlaceholder")}</option>
          {CAREGIVER_RELATIONSHIPS.map((r) => (
            <option key={r.value} value={r.value}>
              {getCaregiverRelationshipLabel(lang, r.value)}
            </option>
          ))}
        </select>
        <div className="gc-confirm-modal-actions mt-5">
          <Button type="button" variant="secondary" className="w-full sm:w-auto" onClick={onClose} disabled={saving}>
            {t("cancel")}
          </Button>
          <Button
            type="button"
            className="w-full sm:w-auto"
            disabled={!relationship || saving}
            onClick={() => {
              if (relationship) onConfirm(relationship);
            }}
          >
            {saving ? t("saving") : t("caregiverActivate")}
          </Button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
