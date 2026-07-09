"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useRequireAuth } from "@/lib/auth";
import { useMountedRef } from "@/lib/hooks/useMountedRef";
import { AppHeader } from "@/components/AppHeader";
import { PageLoadingGate } from "@/components/PageLoadingGate";
import { Card, CardBody } from "@/components/ui/Card";
import { Alert } from "@/components/ui/Alert";
import {
  ConsultationDetailHeader,
  MedicalFilesList,
  PhysicianInfoModal,
  getConsultationDetail,
  type ConsultationDetail,
  type PhysicianProfileData,
} from "@/features/consultations";

export default function ConsultationDetailPage() {
  const { user, loading: authLoading } = useRequireAuth();
  const params = useParams<{ id: string }>();
  const id = useMemo(() => Number(params.id), [params.id]);
  const mounted = useMountedRef();

  const [consultation, setConsultation] = useState<ConsultationDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [physicianModalOpen, setPhysicianModalOpen] = useState(false);

  useEffect(() => {
    getConsultationDetail(id)
      .then((res) => {
        if (!mounted.current) return;
        setLoading(false);
        if (!res.ok) {
          setError(res.message);
          return;
        }
        const c: any = res.data.consultation as any;
        c.medical_files = c.medical_files ?? c.medicalFiles ?? [];
        if (c.physician?.physician_profile && !c.physician.physicianProfile) {
          c.physician.physicianProfile = c.physician.physician_profile;
        }
        setConsultation(c as ConsultationDetail);
      })
      .catch(() => {
        if (!mounted.current) return;
        setLoading(false);
        setError("فشل تحميل الاستشارة");
      });
  }, [id, mounted]);

  function physicianProfileFor(p: ConsultationDetail["physician"]) {
    if (!p) return null;
    const raw = p as {
      physicianProfile?: PhysicianProfileData | null;
      physician_profile?: PhysicianProfileData | null;
    };
    return raw.physicianProfile ?? raw.physician_profile ?? null;
  }

  const files = consultation?.medical_files ?? [];

  return (
    <PageLoadingGate
      loading={authLoading || loading}
      message="جاري تحميل تفاصيل الاستشارة..."
    >
    <div className="min-h-screen bg-transparent">
      <AppHeader title="تفاصيل الاستشارة" backHref="/consultations" userRole={user?.role} />

      <main className="mx-auto w-full max-w-3xl px-4 py-8">
        {error ? (
          <div className="mb-4">
            <Alert variant="error">{error}</Alert>
          </div>
        ) : null}

        {consultation ? (
          <div className="grid gap-5">
            <Card>
              <CardBody className="p-5 sm:p-6">
                <ConsultationDetailHeader
                  id={consultation.id}
                  status={consultation.status}
                  physicianResponse={consultation.physician_response}
                  questionText={consultation.question_text}
                  submittedAt={consultation.submitted_at}
                  assignmentMode={consultation.assignment_mode}
                  physicianName={consultation.physician?.name ?? null}
                />
              </CardBody>
            </Card>

            {files.length > 0 ? (
              <Card>
                <CardBody className="p-5 sm:p-6">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="gc-section-label">المرفقات الطبية</div>
                      <p className="mt-1 text-xs text-(--muted)">
                        {files.length} ملف(ات) مرفقة مع الاستشارة
                      </p>
                    </div>
                  </div>
                  <div className="mt-4">
                    <MedicalFilesList
                      files={files}
                      preview="images"
                      onError={(m) => setError(m)}
                    />
                  </div>
                </CardBody>
              </Card>
            ) : null}

            {consultation.physician_response ? (
              <Card>
                <CardBody className="p-5 sm:p-6">
                  <div className="gc-section-label text-emerald-800 dark:text-emerald-200">
                    توصيات الطبيب
                  </div>
                  {consultation.physician ? (
                    <p className="mt-2 text-sm text-(--muted)">
                      الدكتور/ة:{" "}
                      <button
                        type="button"
                        onClick={() => setPhysicianModalOpen(true)}
                        className="font-semibold text-foreground underline decoration-(--gc-accent)/40 underline-offset-2 hover:decoration-(--gc-accent)"
                      >
                        {consultation.physician.name}
                      </button>
                    </p>
                  ) : null}
                  <div className="mt-4 rounded-2xl border border-emerald-200/80 bg-emerald-50/80 px-4 py-4 text-sm leading-7 text-emerald-900 dark:border-emerald-900/40 dark:bg-emerald-950/40 dark:text-emerald-100">
                    <p className="whitespace-pre-wrap">{consultation.physician_response}</p>
                  </div>
                </CardBody>
              </Card>
            ) : null}

            <div className="text-center">
              <Link
                href="/consultations"
                className="text-sm font-medium text-(--gc-accent) hover:underline"
              >
                العودة إلى قائمة الاستشارات
              </Link>
            </div>
          </div>
        ) : !error ? (
          <Alert variant="info">لم يتم العثور على الاستشارة.</Alert>
        ) : null}
      </main>

      {physicianModalOpen && consultation?.physician ? (
        <PhysicianInfoModal
          open={physicianModalOpen}
          onClose={() => setPhysicianModalOpen(false)}
          consultationId={consultation.id}
          physicianName={consultation.physician.name}
          profile={physicianProfileFor(consultation.physician)}
        />
      ) : null}
    </div>
    </PageLoadingGate>
  );
}
