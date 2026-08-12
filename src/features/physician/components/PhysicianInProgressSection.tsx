"use client";

import { Alert } from "@/components/ui/Alert";
import { ListPagination } from "@/components/ui/ListPagination";
import { usePagedItems } from "@/components/ui/usePagedItems";
import { ConsultationCard } from "@/features/consultations/components/ConsultationCard";
import { formatPatientWithRelationship } from "@/lib/caregiver";
import { useLang } from "@/lib/i18n";

type Consultation = {
  id: number;
  question_text: string;
  status: "pending" | "completed";
  submitted_at: string;
  physician_response?: string | null;
  assignment_mode?: "queue" | "direct";
  patient?: {
    name: string;
    caregiver_mode_enabled?: boolean;
    caregiver_relationship?: string | null;
  } | null;
};

type Props = {
  items: Consultation[];
  loading: boolean;
  error: string | null;
};

const PAGE_SIZE = 3;

export function PhysicianInProgressSection({ items, loading, error }: Props) {
  const { t, lang } = useLang();
  const { page, setPage, totalPages, pageSize, total, pageItems } = usePagedItems(items, {
    pageSize: PAGE_SIZE,
  });

  return (
    <section id="physician-in-progress" className="mt-10 scroll-mt-28">
      <div className="mb-3 text-sm font-semibold text-zinc-900">{t("physicianInProgressTitle")}</div>
      <p className="mb-3 text-xs text-(--muted)">{t("physicianInProgressDesc")}</p>
      <div className="grid gap-3">
        {pageItems.map((c) => (
          <ConsultationCard
            key={c.id}
            id={c.id}
            status={c.status}
            physicianResponse={c.physician_response}
            questionText={c.question_text}
            submittedAt={c.submitted_at}
            href={`/physician/consultations/${c.id}`}
            ctaLabel={t("continueReplyBtn")}
            variant="physician"
            patientName={c.patient ? formatPatientWithRelationship(c.patient, lang) : null}
            assignmentMode={c.assignment_mode ?? "queue"}
          />
        ))}
        {!loading && !error && items.length === 0 ? (
          <Alert variant="info">{t("noInProgressCases")}</Alert>
        ) : null}

        <ListPagination
          page={page}
          totalPages={totalPages}
          total={total}
          pageSize={pageSize}
          onPageChange={setPage}
        />
      </div>
    </section>
  );
}
