"use client";

import { Button } from "@/components/ui/Button";
import { CASE_SEVERITIES, type CaseSeverity } from "@/lib/caseSeverity";

type Props = {
  value: string;
  onChange: (next: string) => void;
  severity: CaseSeverity | "";
  onSeverityChange: (next: CaseSeverity) => void;
  saving: boolean;
  onSubmitReview: () => void;
  onSubmitComplete: () => void;
};

export function PhysicianResponseForm({
  value,
  onChange,
  severity,
  onSeverityChange,
  saving,
  onSubmitReview,
  onSubmitComplete,
}: Props) {
  const disabled = saving || value.trim().length < 5 || !severity;

  return (
    <div className="mt-6 grid gap-2">
      <div className="text-sm font-semibold text-zinc-900">رد الطبيب</div>
      <label className="sr-only" htmlFor="physician-response">
        رد الطبيب
      </label>
      <textarea
        id="physician-response"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={6}
        className="rounded-xl border border-(--border) bg-(--surface) px-3 py-2 text-sm text-zinc-900 outline-none focus:ring-2 focus:ring-(--ring)"
      />
      <div className="mt-1 grid gap-1.5">
        <label htmlFor="case-severity" className="text-xs font-medium text-(--muted)">
          مدى خطورة الحالة
        </label>
        <select
          id="case-severity"
          value={severity}
          onChange={(e) => onSeverityChange(e.target.value as CaseSeverity)}
          className="max-w-xs rounded-xl border border-(--border) bg-(--surface) px-3 py-2 text-sm"
          disabled={saving}
        >
          <option value="">اختر مستوى الحالة...</option>
          {CASE_SEVERITIES.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
      </div>
      <p className="text-xs text-(--muted)">
        «للمراجعة» تُبقي الاستشارة قيد المعالجة. «إنهاء» يحوّلها إلى مكتملة ويرسل الرد للمراجع.
      </p>
      <div className="flex flex-col gap-2 sm:flex-row">
        <Button
          type="button"
          variant="secondary"
          className="w-full sm:flex-1"
          onClick={onSubmitReview}
          disabled={disabled}
        >
          {saving ? "جاري الإرسال..." : "إرسال الرد للمراجعة"}
        </Button>
        <Button
          type="button"
          className="w-full sm:flex-1"
          onClick={onSubmitComplete}
          disabled={disabled}
        >
          {saving ? "جاري الإرسال..." : "إنهاء الاستشارة (مكتملة)"}
        </Button>
      </div>
    </div>
  );
}

