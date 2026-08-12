"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRequireAuth } from "@/lib/auth";
import { useMountedRef } from "@/lib/hooks/useMountedRef";
import { AppHeader } from "@/components/AppHeader";
import { PageLoadingGate } from "@/components/PageLoadingGate";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { ConsultationCard, getMyConsultations, type ConsultationListItem } from "@/features/consultations";
import { useLang } from "@/lib/i18n";

function ConsultationSection({
  title,
  description,
  items,
  ctaLabel,
}: {
  title: string;
  description: string;
  items: ConsultationListItem[];
  ctaLabel: string;
}) {
  if (items.length === 0) return null;

  return (
    <section className="grid gap-3">
      <div>
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        <p className="mt-1 text-xs text-(--muted)">{description}</p>
      </div>
      {items.map((c) => (
        <ConsultationCard
          key={c.id}
          id={c.id}
          status={c.status}
          physicianResponse={c.physician_response}
          physicianName={c.physician?.name ?? null}
          physicianId={c.physician_id ?? c.physician?.id ?? null}
          questionText={c.question_text}
          submittedAt={c.submitted_at}
          href={`/consultations/${c.id}`}
          ctaLabel={ctaLabel}
          variant="patient"
          assignmentMode={c.assignment_mode ?? "queue"}
        />
      ))}
    </section>
  );
}

export default function ConsultationsPage() {
  const { t } = useLang();
  const { user, loading: authLoading } = useRequireAuth();
  const [items, setItems] = useState<ConsultationListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const mounted = useMountedRef();

  useEffect(() => {
    getMyConsultations()
      .then((res) => {
        if (!mounted.current) return;
        setLoading(false);
        if (!res.ok) {
          setError(res.message);
          return;
        }
        setItems(res.data.data ?? []);
      })
      .catch(() => {
        if (!mounted.current) return;
        setLoading(false);
        setError(t("consultationsLoadError"));
      });
  }, [mounted, t]);

  const grouped = useMemo(() => {
    const directPending = items.filter(
      (c) => c.status === "pending" && c.assignment_mode === "direct"
    );
    const queuePending = items.filter(
      (c) => c.status === "pending" && c.assignment_mode !== "direct"
    );
    const completed = items.filter((c) => c.status === "completed");
    return { directPending, queuePending, completed };
  }, [items]);

  const hasAny = items.length > 0;

  return (
    <PageLoadingGate loading={authLoading || loading} message={t("consultationsLoading")}>
    <div className="min-h-screen bg-transparent">
      <AppHeader
        title={t("navConsultations")}
        backHref="/dashboard"
        userRole={user?.role}
        primaryAction={
          <Link href="/consultations/new">
            <Button size="sm">{t("newConsultation")}</Button>
          </Link>
        }
      />

      <main className="mx-auto w-full max-w-5xl px-4 py-8">
        <div className="mb-6">
          <h2 className="text-base font-semibold text-foreground">{t("consultationsHistory")}</h2>
          <p className="mt-1 text-sm text-(--muted)">{t("consultationsHistoryDesc")}</p>
        </div>

        {error ? (
          <div className="mb-4">
            <Alert variant="error">{error}</Alert>
          </div>
        ) : null}

        <div className="grid gap-8">
          <ConsultationSection
            title={t("consultationsDirectTitle")}
            description={t("consultationsDirectDesc")}
            items={grouped.directPending}
            ctaLabel={t("viewDetails")}
          />

          <ConsultationSection
            title={`${t("queueAssignmentTitle")} — ${t("consultationsQueuePending")}`}
            description={t("queueAssignmentDesc")}
            items={grouped.queuePending}
            ctaLabel={t("viewDetails")}
          />

          <ConsultationSection
            title={t("consultationsCompletedTitle")}
            description={t("consultationsCompletedDesc")}
            items={grouped.completed}
            ctaLabel={t("viewDetails")}
          />

          {!error && !hasAny ? (
            <Alert variant="info">
              {t("consultationsEmpty")}{" "}
              <Link className="font-medium hover:underline" href="/consultations/new">
                {t("consultationsEmptyCta")}
              </Link>
            </Alert>
          ) : null}
        </div>
      </main>
    </div>
    </PageLoadingGate>
  );
}
