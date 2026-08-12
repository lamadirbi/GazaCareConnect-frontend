"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { isVerifiedPhysician, physicianProfileOf, setAuthSession, useRequireAuth, getAuthSession } from "@/lib/auth";
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
import { useLang } from "@/lib/i18n";

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
  const { t } = useLang();
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
      apiFetch<Paginated<Consultation>>("/consultations/queue?per_page=100"),
      apiFetch<Paginated<Consultation>>("/consultations?per_page=100"),
    ])
      .then(([q, mine]) => {
        if (!mounted) return;
        setLoading(false);
        if (!q.ok) setError(q.message);
        if (q.ok) setQueue(q.data.data ?? []);
        if (mine.ok) {
          const rows = mine.data.data ?? [];
          const pending = rows.filter((c) => c.status === "pending");
          // Direct cases without a reply yet stay in "موجّهة إليك".
          // Anything already claimed / sent for review goes to "قيد المعالجة".
          setDirectPending(
            pending.filter(
              (c) =>
                c.assignment_mode === "direct" && !c.physician_response?.trim(),
            ),
          );
          setInProgress(
            pending.filter(
              (c) =>
                c.assignment_mode !== "direct" ||
                Boolean(c.physician_response?.trim()),
            ),
          );
          setCompletedMine(rows.filter((c) => c.status === "completed"));
        }
      })
      .catch(() => {
        if (!mounted) return;
        setLoading(false);
        setError(t("physicianLoadError"));
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
      message={t("physicianDashboardLoading")}
    >
    <div className="min-h-screen bg-transparent">
      <AppHeader
        title={t("physicianDashboardTitle")}
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
          <PhysicianProfilePanel
            initialProfile={profile}
            verificationStatus={profile?.verification_status}
            rejectionReason={profile?.rejection_reason}
            onVerificationChange={({ verification_status, rejection_reason }) => {
              const current = getAuthSession();
              if (!current) return;
              const nextProfile = {
                ...(current.physician_profile ?? current.physicianProfile ?? {}),
                specialty:
                  current.physician_profile?.specialty ??
                  current.physicianProfile?.specialty ??
                  profile?.specialty ??
                  "",
                certificate:
                  current.physician_profile?.certificate ??
                  current.physicianProfile?.certificate ??
                  profile?.certificate ??
                  "",
                verification_status,
                rejection_reason,
              };
              setAuthSession({
                ...current,
                physician_profile: nextProfile,
                physicianProfile: nextProfile,
              });
            }}
          />

          {verified ? (
            <>
              <PhysicianQueueSection
                queue={queue}
                loading={loading}
                error={error}
                claimingId={claimingId}
                onClaim={claim}
              />

              <PhysicianDirectSection
                items={directPending}
                loading={loading}
                error={error}
              />

              <PhysicianInProgressSection items={inProgress} loading={loading} error={error} />

              <PhysicianCompletedSection items={completedMine} loading={loading} error={error} />
            </>
          ) : null}
        </div>
      </main>
    </div>
    </PageLoadingGate>
  );
}
