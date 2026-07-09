"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRequireAuth } from "@/lib/auth";
import { useMountedRef } from "@/lib/hooks/useMountedRef";
import { AppHeader } from "@/components/AppHeader";
import { PageLoadingGate } from "@/components/PageLoadingGate";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { ConsultationCard, getMyConsultations, QUEUE_ASSIGNMENT_SECTION_DESC, QUEUE_ASSIGNMENT_SECTION_TITLE, type ConsultationListItem } from "@/features/consultations";

function ConsultationSection({
  title,
  description,
  items,
}: {
  title: string;
  description: string;
  items: ConsultationListItem[];
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
          ctaLabel="عرض التفاصيل"
          variant="patient"
          assignmentMode={c.assignment_mode ?? "queue"}
        />
      ))}
    </section>
  );
}

export default function ConsultationsPage() {
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
        setError("فشل تحميل الاستشارات");
      });
  }, []);

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
    <PageLoadingGate
      loading={authLoading || loading}
      message="جاري تحميل الاستشارات..."
    >
    <div className="min-h-screen bg-transparent">
      <AppHeader
        title="الاستشارات"
        backHref="/dashboard"
        userRole={user?.role}
        primaryAction={
          <Link href="/consultations/new">
            <Button size="sm">استشارة جديدة</Button>
          </Link>
        }
      />

      <main className="mx-auto w-full max-w-5xl px-4 py-8">
        <div className="mb-6">
          <h2 className="text-base font-semibold text-foreground">سجل الاستشارات</h2>
          <p className="mt-1 text-sm text-(--muted)">
            كل استشاراتك هنا
          </p>
        </div>

        {error ? (
          <div className="mb-4">
            <Alert variant="error">{error}</Alert>
          </div>
        ) : null}

        <div className="grid gap-8">
          <ConsultationSection
            title="موجّهة لطبيب محدّد"
            description="أرسلتها لطبيب معيّن وهي بانتظار رده."
            items={grouped.directPending}
          />

          <ConsultationSection
            title={`${QUEUE_ASSIGNMENT_SECTION_TITLE} — قيد الانتظار`}
            description={QUEUE_ASSIGNMENT_SECTION_DESC}
            items={grouped.queuePending}
          />

          <ConsultationSection
            title="مكتملة"
            description="الطبيب رد عليها."
            items={grouped.completed}
          />

          {!error && !hasAny ? (
            <Alert variant="info">
              لم تُرسل أي استشارة بعد.{" "}
              <Link className="font-medium hover:underline" href="/consultations/new">
                أرسل أول استشارة
              </Link>
            </Alert>
          ) : null}
        </div>
      </main>
    </div>
    </PageLoadingGate>
  );
}
