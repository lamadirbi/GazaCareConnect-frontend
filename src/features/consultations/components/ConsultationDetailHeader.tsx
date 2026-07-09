"use client";

import { ConsultationStatusBadge, consultationStatusLabel } from "./ConsultationStatusBadge";
import { QUEUE_ASSIGNMENT_LABEL_SHORT } from "../assignmentLabels";

type Props = {
  id: number;
  status: "pending" | "completed";
  physicianResponse?: string | null;
  questionText: string;
  submittedAt?: string;
  assignmentMode?: "queue" | "direct" | null;
  physicianName?: string | null;
  variant?: "patient" | "physician";
};

export function ConsultationDetailHeader({
  id,
  status,
  physicianResponse,
  questionText,
  submittedAt,
  assignmentMode,
  physicianName,
  variant = "patient",
}: Props) {
  const waiting = status === "pending" && !physicianResponse?.trim();
  const inReview = status === "pending" && Boolean(physicianResponse?.trim());
  const isPhysician = variant === "physician";
  const dateStr = submittedAt
    ? new Date(submittedAt).toLocaleDateString("ar", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : null;

  const accentClass =
    status === "completed"
      ? "from-emerald-400 to-emerald-600"
      : waiting
        ? "from-red-400 to-red-600"
        : "from-amber-300 to-amber-500";

  return (
    <div>
      <div className={`mb-5 h-1 rounded-full bg-gradient-to-l ${accentClass}`} />

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-lg bg-(--surface-2) px-2.5 py-1 text-sm font-bold text-foreground">
            #{id}
          </span>
          <ConsultationStatusBadge status={status} physicianResponse={physicianResponse} />
          {assignmentMode === "direct" ? (
            <span className="inline-flex items-center rounded-full border border-sky-200 bg-sky-50 px-2.5 py-1 text-xs font-semibold text-sky-900 dark:border-sky-900/40 dark:bg-sky-950/40 dark:text-sky-100">
              طبيب محدّد
            </span>
          ) : assignmentMode === "queue" ? (
            <span className="inline-flex items-center rounded-full border border-(--border) bg-(--surface-2) px-2.5 py-1 text-xs font-semibold text-(--muted)">
              {QUEUE_ASSIGNMENT_LABEL_SHORT}
            </span>
          ) : null}
        </div>
        {dateStr ? (
          <div className="text-xs text-(--muted)">أُرسلت {dateStr}</div>
        ) : null}
      </div>

      {assignmentMode === "direct" && physicianName && !isPhysician ? (
        <p className="mt-3 text-sm text-(--muted)">
          موجّهة إلى:{" "}
          <span className="font-semibold text-foreground">{physicianName}</span>
        </p>
      ) : null}

      <div className="mt-5">
        <div className="gc-section-label mb-2">سؤال الاستشارة</div>
        <div className="rounded-2xl border border-(--border) bg-(--surface-2) px-4 py-4">
          <p className="whitespace-pre-wrap text-sm leading-7 text-foreground">{questionText}</p>
        </div>
      </div>

      {waiting ? (
        <p className="mt-4 rounded-xl border border-red-200/80 bg-red-50/80 px-4 py-3 text-sm text-red-900 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-100">
          {isPhysician
            ? "لم تُرسل رداً بعد. اكتب توصياتك في النموذج أدناه."
            : "استشارتك بانتظار رد الطبيب. ستصلك التوصيات هنا عند الانتهاء."}
        </p>
      ) : null}

      {inReview ? (
        <p className="mt-4 rounded-xl border border-amber-200/80 bg-amber-50/80 px-4 py-3 text-sm text-amber-900 dark:border-amber-900/40 dark:bg-amber-950/30 dark:text-amber-100">
          {isPhysician
            ? "بدأت بكتابة الرد — يمكنك إكماله أو تعديله أدناه."
            : "الطبيب بدأ بمراجعة حالتك — تابع التحديثات هنا."}
        </p>
      ) : null}

      {status === "completed" ? (
        <p className="mt-4 text-xs text-(--muted)">
          الحالة: {consultationStatusLabel(status, physicianResponse)}
        </p>
      ) : null}
    </div>
  );
}
