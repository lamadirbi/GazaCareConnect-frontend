"use client";

import { Alert } from "@/components/ui/Alert";
import { ConsultationCard } from "@/features/consultations/components/ConsultationCard";

type Consultation = {
  id: number;
  question_text: string;
  status: "pending" | "completed";
  submitted_at: string;
  physician_response?: string | null;
  assignment_mode?: "queue" | "direct";
  patient?: { name: string } | null;
};

type Props = {
  items: Consultation[];
  loading: boolean;
  error: string | null;
};

export function PhysicianInProgressSection({ items, loading, error }: Props) {
  return (
    <section id="physician-in-progress" className="mt-10 scroll-mt-28">
      <div className="mb-3 text-sm font-semibold text-zinc-900 dark:text-zinc-50">
        استشارات قيد المعالجة
      </div>
      <p className="mb-3 text-xs text-(--muted)">
        استشارات استلمتها وما زالت بحاجة إلى إكمال الرد.
      </p>
      <div className="grid gap-3">
        {items.map((c) => (
          <ConsultationCard
            key={c.id}
            id={c.id}
            status={c.status}
            physicianResponse={c.physician_response}
            questionText={c.question_text}
            submittedAt={c.submitted_at}
            href={`/physician/consultations/${c.id}`}
            ctaLabel="متابعة الرد"
            variant="physician"
            patientName={c.patient?.name ?? null}
            assignmentMode={c.assignment_mode ?? "queue"}
          />
        ))}
        {!loading && !error && items.length === 0 ? (
          <Alert variant="info">لا توجد استشارات قيد المعالجة.</Alert>
        ) : null}
      </div>
    </section>
  );
}

