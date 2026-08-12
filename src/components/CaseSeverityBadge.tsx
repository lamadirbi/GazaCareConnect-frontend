"use client";

import { caseSeverityBadgeClass } from "@/lib/caseSeverity";
import { useLang } from "@/lib/i18n";

type Props = {
  severity: string | null | undefined;
  className?: string;
};

export function CaseSeverityBadge({ severity, className = "" }: Props) {
  const { t } = useLang();
  const label =
    severity === "mild"
      ? t("severityMild")
      : severity === "moderate"
        ? t("severityModerate")
        : severity === "critical"
          ? t("severityCritical")
          : null;

  if (!label) return null;

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${caseSeverityBadgeClass(severity)} ${className}`}
    >
      {t("caseSeverityPrefix")} {label}
    </span>
  );
}
