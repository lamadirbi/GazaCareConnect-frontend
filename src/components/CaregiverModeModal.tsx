"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Button } from "@/components/ui/Button";
import { CAREGIVER_RELATIONSHIPS, type CaregiverRelationship } from "@/lib/caregiver";

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
      aria-labelledby="gc-caregiver-modal-title"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="gc-confirm-modal" onMouseDown={(e) => e.stopPropagation()}>
        <h2 id="gc-caregiver-modal-title" className="gc-confirm-modal-title">
          تفعيل وضع مرافق المريض
        </h2>
        <p className="gc-confirm-modal-message">
          حدّد صلة قرابتك بالمريض الذي ترافقه. ستظهر هذه المعلومة للطبيب والإدارة عند
          إرسال الاستشارات.
        </p>
        <label className="mt-4 block text-sm font-medium text-foreground" htmlFor="caregiver-relationship">
          صلة القرابة
        </label>
        <select
          id="caregiver-relationship"
          value={relationship}
          onChange={(e) => setRelationship(e.target.value as CaregiverRelationship)}
          className="mt-2 w-full rounded-xl border border-(--border) bg-(--surface) px-3 py-2.5 text-sm"
          disabled={saving}
        >
          <option value="">اختر صلة القرابة...</option>
          {CAREGIVER_RELATIONSHIPS.map((r) => (
            <option key={r.value} value={r.value}>
              {r.label}
            </option>
          ))}
        </select>
        <div className="gc-confirm-modal-actions mt-5">
          <Button type="button" variant="secondary" className="w-full sm:w-auto" onClick={onClose} disabled={saving}>
            إلغاء
          </Button>
          <Button
            type="button"
            className="w-full sm:w-auto"
            disabled={!relationship || saving}
            onClick={() => {
              if (relationship) onConfirm(relationship);
            }}
          >
            {saving ? "جاري الحفظ..." : "تفعيل"}
          </Button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
