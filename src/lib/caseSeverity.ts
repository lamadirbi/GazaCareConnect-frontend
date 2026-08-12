import { getCaseSeverityLabel, type Lang } from "@/lib/i18n";

export const CASE_SEVERITIES = [
  { value: "mild" },
  { value: "moderate" },
  { value: "critical" },
] as const;

export type CaseSeverity = (typeof CASE_SEVERITIES)[number]["value"];

export function caseSeverityLabel(value: string | null | undefined, lang: Lang = "ar"): string | null {
  return getCaseSeverityLabel(lang, value);
}

export function caseSeverityBadgeClass(value: string | null | undefined): string {
  if (value === "critical") {
    return "border-red-200 bg-red-50 text-red-900";
  }
  if (value === "moderate") {
    return "border-amber-200 bg-amber-50 text-amber-900";
  }
  if (value === "mild") {
    return "border-emerald-200 bg-emerald-50 text-emerald-900";
  }
  return "border-(--border) bg-(--surface-2) text-(--muted)";
}
