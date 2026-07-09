"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { isVerifiedPhysician, physicianProfileOf, useRequireAuth } from "@/lib/auth";
import { AppHeader } from "@/components/AppHeader";
import { PageLoadingGate } from "@/components/PageLoadingGate";
import { Alert } from "@/components/ui/Alert";
import {
  PhysicianProfilePanel,
  PhysicianQueueSection,
  PhysicianDirectSection,
  PhysicianInProgressSection,
  PhysicianCompletedSection,
  scrollToPhysicianSection,
} from "@/features/physician";

type Consultation = {
  id: number;
  question_text: string;
  status: "pending" | "completed";
  submitted_at: string;
  responded_at?: string | null;
  physician_response?: string | null;
  assignment_mode?: "queue" | "direct";
  patient?: { id: number; name: string; role: string };
};

type Paginated<T> = { data: T[] };

export default function PhysicianDashboardPage() {
  const { user, loading: authLoading } = useRequireAuth({ allowedRoles: ["physician"] });
  const profile = physicianProfileOf(user);
  const verified = isVerifiedPhysician(user);
  const [queue, setQueue] = useState<Consultation[]>([]);
  const [directPending, setDirectPending] = useState<Consultation[]>([]);
  const [inProgress, setInProgress] = useState<Consultation[]>([]);
  const [completedMine, setCompletedMine] = useState<Consultation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [claimingId, setClaimingId] = useState<number | null>(null);

  useEffect(() => {
    if (!verified) {
      setLoading(false);
      return;
    }
    let mounted = true;
    Promise.all([
      apiFetch<Paginated<Consultation>>("/consultations/queue"),
      apiFetch<Paginated<Consultation>>("/consultations"),
    ])
      .then(([q, mine]) => {
        if (!mounted) return;
        setLoading(false);
        if (!q.ok) setError(q.message);
        if (q.ok) setQueue(q.data.data ?? []);
        if (mine.ok) {
          const rows = mine.data.data ?? [];
          const pending = rows.filter((c) => c.status === "pending");
          setDirectPending(
            pending.filter((c) => c.assignment_mode === "direct")
          );
          setInProgress(
            pending.filter((c) => c.assignment_mode !== "direct")
          );
          setCompletedMine(rows.filter((c) => c.status === "completed"));
        }
      })
      .catch(() => {
        if (!mounted) return;
        setLoading(false);
        setError("فشل تحميل الحالات");
      });
    return () => {
      mounted = false;
    };
  }, [verified]);

  useEffect(() => {
    if (loading || !verified) return;
    const hash = window.location.hash.replace(/^#/, "");
    if (!hash) return;
    const timer = window.setTimeout(() => scrollToPhysicianSection(hash), 120);
    return () => window.clearTimeout(timer);
  }, [loading, verified]);

  async function claim(id: number) {
    setClaimingId(id);
    setError(null);
    const res = await apiFetch<{ consultation: Consultation }>(`/consultations/${id}/claim`, {
      method: "POST",
    });
    setClaimingId(null);
    if (!res.ok) {
      setError(res.message);
      return;
    }
    window.location.href = `/physician/consultations/${id}`;
  }

  return (
    <PageLoadingGate
      loading={authLoading || loading}
      message="جاري تحميل لوحة الطبيب..."
    >
    <div className="min-h-screen bg-transparent">
      <AppHeader
        title="لوحة الطبيب"
        backHref="/"
        userRole={user?.role}
      />

      <main className="mx-auto w-full max-w-5xl px-4 py-8">
        {error ? (
          <div className="mb-4">
            <Alert variant="error">{error}</Alert>
          </div>
        ) : null}

        <div className="grid gap-6">
          <PhysicianProfilePanel initialProfile={profile} />

          {!verified ? (
            <Alert variant="info">
              {profile?.verification_status === "rejected" ? (
                <>
                  تم رفض طلب التوثيق.{" "}
                  {profile.rejection_reason ? `السبب: ${profile.rejection_reason}` : ""}
                </>
              ) : (
                <>
                  حسابك بانتظار موافقة الإدارة. لن تتمكن من عرض الحالات أو استلام الاستشارات حتى يتم توثيقك.
                </>
              )}
            </Alert>
          ) : (
            <>
              <PhysicianDirectSection
                items={directPending}
                loading={loading}
                error={error}
              />

              <PhysicianQueueSection
                queue={queue}
                loading={loading}
                error={error}
                claimingId={claimingId}
                onClaim={claim}
              />

              <PhysicianInProgressSection items={inProgress} loading={loading} error={error} />

              <PhysicianCompletedSection items={completedMine} loading={loading} error={error} />
            </>
          )}
        </div>
      </main>
    </div>
    </PageLoadingGate>
  );
}
