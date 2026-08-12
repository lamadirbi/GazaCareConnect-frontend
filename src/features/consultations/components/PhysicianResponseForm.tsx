"use client";

import { Button } from "@/components/ui/Button";
import { CASE_SEVERITIES, type CaseSeverity } from "@/lib/caseSeverity";
import { caseSeverityLabel } from "@/lib/caseSeverity";
import { useLang } from "@/lib/i18n";

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
  const { t, lang } = useLang();
  const disabled = saving || value.trim().length < 5 || !severity;

  return (
    <div className="mt-6 grid gap-2">
      <div className="text-sm font-semibold text-zinc-900">{t("physicianReplyTitle")}</div>
      <label className="sr-only" htmlFor="physician-response">
        {t("physicianReplyTitle")}
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
          {t("caseSeverityLabel")}
        </label>
        <select
          id="case-severity"
          value={severity}
          onChange={(e) => onSeverityChange(e.target.value as CaseSeverity)}
          className="max-w-xs rounded-xl border border-(--border) bg-(--surface) px-3 py-2 text-sm"
          disabled={saving}
        >
          <option value="">{t("chooseSeverity")}</option>
          {CASE_SEVERITIES.map((s) => (
            <option key={s.value} value={s.value}>
              {caseSeverityLabel(s.value, lang)}
            </option>
          ))}
        </select>
      </div>
      <p className="text-xs text-(--muted)">{t("severityHint")}</p>
      <div className="flex flex-col gap-2 sm:flex-row">
        <Button
          type="button"
          variant="secondary"
          className="w-full sm:flex-1"
          onClick={onSubmitReview}
          disabled={disabled}
        >
          {saving ? t("sendingReply") : t("sendForReview")}
        </Button>
        <Button
          type="button"
          className="w-full sm:flex-1"
          onClick={onSubmitComplete}
          disabled={disabled}
        >
          {saving ? t("sendingReply") : t("completeConsultation")}
        </Button>
      </div>
    </div>
  );
}
