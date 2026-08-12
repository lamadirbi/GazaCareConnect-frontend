"use client";

import { getConsultationStatusLabel, useLang } from "@/lib/i18n";

type Props = {
  status: "pending" | "completed";
  physicianResponse?: string | null;
  className?: string;
};

export function consultationStatusLabel(
  status: Props["status"],
  physicianResponse: string | null | undefined,
  lang: "ar" | "en",
) {
  return getConsultationStatusLabel(lang, status, physicianResponse);
}

export function ConsultationStatusBadge({ status, physicianResponse, className }: Props) {
  const { lang } = useLang();
  const label = getConsultationStatusLabel(lang, status, physicianResponse);
  const base = "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold";

  const tone =
    status === "completed"
      ? "border-emerald-200 bg-emerald-50 text-emerald-900"
      : physicianResponse?.trim()
        ? "border-amber-200 bg-amber-50 text-amber-900"
        : "border-red-200 bg-red-50 text-red-800";

  return <span className={`${base} ${tone} ${className ?? ""}`}>{label}</span>;
}
