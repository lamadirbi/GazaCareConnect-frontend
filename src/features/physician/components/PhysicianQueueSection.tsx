"use client";

import { Card, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { ListPagination } from "@/components/ui/ListPagination";
import { usePagedItems } from "@/components/ui/usePagedItems";
import { formatPatientWithRelationship } from "@/lib/caregiver";
import { useLang } from "@/lib/i18n";

type Consultation = {
  id: number;
  question_text: string;
  submitted_at: string;
  patient?: {
    name: string;
    caregiver_mode_enabled?: boolean;
    caregiver_relationship?: string | null;
  } | null;
};

type Props = {
  queue: Consultation[];
  loading: boolean;
  error: string | null;
  claimingId: number | null;
  onClaim: (id: number) => void;
};

const PAGE_SIZE = 3;

export function PhysicianQueueSection({ queue, loading, error, claimingId, onClaim }: Props) {
  const { t, lang } = useLang();
  const { page, setPage, totalPages, pageSize, total, pageItems } = usePagedItems(queue, {
    pageSize: PAGE_SIZE,
  });

  return (
    <section id="physician-queue" className="scroll-mt-28">
      <div className="mb-3 text-sm font-semibold text-zinc-900">{t("physicianQueueTitle")}</div>
      <p className="mb-3 text-xs text-(--muted)">{t("physicianQueueDesc")}</p>
      <div className="grid gap-3">
        {pageItems.map((c) => (
          <Card key={c.id}>
            <CardBody className="p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-semibold text-zinc-900">
                    #{c.id} — {t("newCase")}
                  </div>
                  {c.patient?.name ? (
                    <div className="mt-1 text-xs text-zinc-500">
                      {t("patientLabel")}{" "}
                      <span className="font-medium">
                        {formatPatientWithRelationship(c.patient, lang)}
                      </span>
                    </div>
                  ) : null}
                  <div className="mt-1 text-sm text-zinc-600">
                    {c.question_text.slice(0, 140)}
                    {c.question_text.length > 140 ? "..." : ""}
                  </div>
                </div>
                <Button
                  onClick={() => onClaim(c.id)}
                  disabled={claimingId === c.id}
                  size="sm"
                  className="shrink-0 whitespace-nowrap"
                >
                  {claimingId === c.id ? t("claimingCase") : t("claimCase")}
                </Button>
              </div>
            </CardBody>
          </Card>
        ))}

        {!loading && !error && queue.length === 0 ? (
          <Alert variant="info">{t("noQueueCases")}</Alert>
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
