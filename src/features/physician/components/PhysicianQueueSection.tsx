"use client";

import { Card, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";

type Consultation = {
  id: number;
  question_text: string;
  submitted_at: string;
  patient?: { name: string } | null;
};

type Props = {
  queue: Consultation[];
  loading: boolean;
  error: string | null;
  claimingId: number | null;
  onClaim: (id: number) => void;
};

export function PhysicianQueueSection({ queue, loading, error, claimingId, onClaim }: Props) {
  return (
    <section id="physician-queue" className="scroll-mt-28">
      <div className="mb-3 text-sm font-semibold text-zinc-900 dark:text-zinc-50">
        استشارات بانتظار الاستلام
      </div>
      <p className="mb-3 text-xs text-(--muted)">
        استشارات لم يستلمها أي طبيب بعد — يمكنك استلام أي منها للمراجعة.
      </p>
      <div className="grid gap-3">
        {queue.map((c) => (
          <Card key={c.id}>
            <CardBody className="p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                    #{c.id} — جديد
                  </div>
                  {c.patient?.name ? (
                    <div className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                      المراجع: <span className="font-medium">{c.patient.name}</span>
                    </div>
                  ) : null}
                  <div className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
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
                  {claimingId === c.id ? "جاري الاستلام..." : "استلام الحالة"}
                </Button>
              </div>
            </CardBody>
          </Card>
        ))}

        {!loading && !error && queue.length === 0 ? (
          <Alert variant="info">لا توجد استشارات بانتظار الاستلام حالياً.</Alert>
        ) : null}
      </div>
    </section>
  );
}

