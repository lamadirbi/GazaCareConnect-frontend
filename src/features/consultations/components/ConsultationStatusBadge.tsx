"use client";

type Props = {
  status: "pending" | "completed";
  physicianResponse?: string | null;
  className?: string;
};

export function consultationStatusLabel(status: Props["status"], physicianResponse?: string | null) {
  if (status === "completed") return "مكتملة";
  if (physicianResponse?.trim()) return "قيد المراجعة";
  return "قيد الانتظار";
}

export function ConsultationStatusBadge({ status, physicianResponse, className }: Props) {
  const label = consultationStatusLabel(status, physicianResponse);
  const base = "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold";

  const tone =
    label === "مكتملة"
      ? "border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-900/40 dark:bg-emerald-950/40 dark:text-emerald-100"
      : label === "قيد المراجعة"
        ? "border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-900/40 dark:bg-amber-950/30 dark:text-amber-100"
        : "border-red-200 bg-red-50 text-red-800 dark:border-red-900/40 dark:bg-red-950/40 dark:text-red-100";

  return <span className={`${base} ${tone} ${className ?? ""}`}>{label}</span>;
}

