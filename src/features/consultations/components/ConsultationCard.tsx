"use client";

import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { ConsultationStatusBadge } from "./ConsultationStatusBadge";
import { useLang } from "@/lib/i18n";

type Props = {
  id: number;
  questionText: string;
  submittedAt: string;
  status: "pending" | "completed";
  physicianResponse?: string | null;
  physicianName?: string | null;
  physicianId?: number | null;
  href: string;
  ctaLabel: string;
  variant?: "patient" | "physician";
  patientName?: string | null;
  assignmentMode?: "queue" | "direct" | null;
};

function formatSubmittedAt(submittedAt: string, locale: string) {
  return new Date(submittedAt).toLocaleDateString(locale === "ar" ? "ar" : "en", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function ConsultationCard({
  id,
  questionText,
  submittedAt,
  status,
  physicianResponse,
  physicianName,
  href,
  ctaLabel,
  variant = "patient",
  patientName,
  assignmentMode,
  physicianId,
}: Props) {
  const { t, lang } = useLang();
  const dateStr = formatSubmittedAt(submittedAt, lang);
  const waiting = status === "pending" && !physicianResponse?.trim();
  const inReview = status === "pending" && Boolean(physicianResponse?.trim());
  const hasResponse = Boolean(physicianResponse?.trim());
  const claimedByPhysician = Boolean(physicianId || physicianName?.trim());

  const accentClass =
    status === "completed"
      ? "from-emerald-400 to-emerald-600"
      : waiting
        ? "from-red-400 to-red-600"
        : "from-amber-300 to-amber-500";

  const statusHint =
    variant === "patient" && waiting
      ? t("consultWaitingPatient")
      : variant === "patient" && inReview
        ? t("consultInReviewPatient")
        : variant === "physician" && waiting
          ? t("consultWaitingPhysician")
          : null;

  function assignmentTag() {
    if (!assignmentMode) return null;

    if (variant === "physician") {
      if (assignmentMode === "direct") {
        return (
          <span className="gc-consult-card-tag gc-consult-card-tag-direct">{t("consultTagDirectToYou")}</span>
        );
      }
      return <span className="gc-consult-card-tag gc-consult-card-tag-claimed">{t("consultTagClaimed")}</span>;
    }

    if (assignmentMode === "direct") {
      return (
        <span className="gc-consult-card-tag gc-consult-card-tag-direct">{t("consultTagDirect")}</span>
      );
    }

    if (status === "completed") {
      return <span className="gc-consult-card-tag">{t("consultTagGeneral")}</span>;
    }

    if (claimedByPhysician) {
      return null;
    }

    if (waiting) {
      return <span className="gc-consult-card-tag">{t("queueAssignmentShort")}</span>;
    }

    return null;
  }

  return (
    <Card className="gc-consult-card overflow-hidden">
      <div className={`h-1 bg-gradient-to-l ${accentClass}`} />

      <div className="p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="gc-consult-card-id">#{id}</span>
            <ConsultationStatusBadge status={status} physicianResponse={physicianResponse} />
            {assignmentTag()}
          </div>

          <time className="gc-consult-card-date" dateTime={submittedAt}>
            {t("consultSubmitted")} {dateStr}
          </time>
        </div>

        {variant === "physician" && patientName ? (
          <div className="gc-consult-card-patient mt-3">
            <span className="gc-consult-card-patient-icon" aria-hidden>
              {lang === "ar" ? "ر" : "P"}
            </span>
            <span>
              {t("consultPatient")} <strong>{patientName}</strong>
            </span>
          </div>
        ) : null}

        <div className="mt-4">
          <div className="gc-section-label mb-2">{t("consultQuestion")}</div>
          <div className="gc-consult-card-question">
            <p className="line-clamp-3 whitespace-pre-wrap">{questionText}</p>
          </div>
        </div>

        {variant === "patient" && hasResponse ? (
          <div className="gc-consult-card-response mt-4">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm font-semibold">
              <span>{t("consultDoctorReply")}</span>
              {physicianName?.trim() ? (
                <>
                  <span className="font-normal opacity-60">—</span>
                  <span>{physicianName}</span>
                </>
              ) : null}
            </div>
            <p className="mt-2 line-clamp-2 text-sm leading-6 opacity-90">{physicianResponse}</p>
          </div>
        ) : null}

        <div className="gc-consult-card-footer mt-5">
          {statusHint ? (
            <p className={`gc-consult-card-hint ${waiting ? "gc-consult-card-hint-waiting" : ""}`}>
              {statusHint}
            </p>
          ) : (
            <span />
          )}

          <Link href={href} className="gc-consult-card-cta">
            {ctaLabel}
            <span aria-hidden className="gc-consult-card-cta-arrow">
              {lang === "ar" ? "←" : "→"}
            </span>
          </Link>
        </div>
      </div>
    </Card>
  );
}
