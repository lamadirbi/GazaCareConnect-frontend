"use client";

import { Alert } from "@/components/ui/Alert";
import { ListPagination } from "@/components/ui/ListPagination";
import { usePagedItems } from "@/components/ui/usePagedItems";
import { ConsultationCard } from "@/features/consultations/components/ConsultationCard";
import { formatPatientWithRelationship } from "@/lib/caregiver";

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

export function PhysicianCompletedSection({ items, loading, error }: Props) {
  const { page, setPage, totalPages, pageSize, total, pageItems } = usePagedItems(items, {
    pageSize: PAGE_SIZE,
  });

  return (
    <section id="physician-completed" className="mt-10 scroll-mt-28">
      <div className="mb-3 text-sm font-semibold text-zinc-900">
        استشارات منتهية
      </div>
      <p className="mb-3 text-xs text-(--muted)">
        الاستشارات التي أكملت الرد فيها.
      </p>
      <div className="grid gap-3">
        {pageItems.map((c) => (
          <ConsultationCard
            key={c.id}
            id={c.id}
            status="completed"
            physicianResponse={c.physician_response}
            questionText={c.question_text}
            submittedAt={c.submitted_at}
            href={`/physician/consultations/${c.id}`}
            ctaLabel="عرض التفاصيل"
            variant="physician"
            patientName={c.patient ? formatPatientWithRelationship(c.patient) : null}
            assignmentMode={c.assignment_mode ?? null}
          />
        ))}
        {!loading && !error && items.length === 0 ? (
          <Alert variant="info">لا توجد استشارات منتهية بعد.</Alert>
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
