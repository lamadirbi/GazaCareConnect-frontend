"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { apiFetch } from "@/lib/api";
import { useRequireAuth } from "@/lib/auth";
import { AppHeader } from "@/components/AppHeader";
import { PageLoadingGate } from "@/components/PageLoadingGate";
import { Card, CardBody } from "@/components/ui/Card";
import { Alert } from "@/components/ui/Alert";
import { MedicalFilesList } from "@/features/consultations/components/MedicalFilesList";
import { ConsultationDetailHeader } from "@/features/consultations/components/ConsultationDetailHeader";
import { PhysicianResponseForm } from "@/features/consultations";
import { MedicalProfileSummaryCard } from "@/features/profile";

type MedicalFileRow = {
  id: number;
  original_name: string;
  file_kind: string;
  mime_type?: string | null;
  size_bytes?: number | null;
  created_at: string;
};

type MedicalProfileRow = {
  height_cm: number | null;
  weight_kg: number | null;
  chronic_diseases: string | null;
  medical_history: string | null;
  allergies: string | null;
  current_medications: string | null;
};

type Consultation = {
  id: number;
  question_text: string;
  status: "pending" | "completed";
  submitted_at: string;
  physician_response: string | null;
  patient?: {
    id: number;
    name: string;
    email?: string;
    role: string;
    medicalProfile?: MedicalProfileRow | null;
  };
  physician?: {
    id: number;
    name: string;
    role: string;
    physicianProfile?: { source?: string } | null;
    physician_profile?: { specialty?: string; certificate?: string } | null;
  };
  medical_files?: MedicalFileRow[];
};

type ShowResponse = { consultation: Record<string, unknown> };

function normalizeConsultation(raw: Record<string, unknown>): Consultation {
  const patient = raw.patient as Record<string, unknown> | undefined;
  const medProf =
    (patient?.medical_profile as MedicalProfileRow | undefined) ??
    (patient?.medicalProfile as MedicalProfileRow | undefined) ??
    null;
  const files =
    (raw.medical_files as MedicalFileRow[] | undefined) ??
    (raw.medicalFiles as MedicalFileRow[] | undefined) ??
    [];

  return {
    ...(raw as unknown as Consultation),
    patient: patient
      ? {
          id: patient.id as number,
          name: patient.name as string,
          role: patient.role as string,
          medicalProfile: medProf,
        }
      : undefined,
    medical_files: files,
  };
}

export default function PhysicianConsultationPage() {
  const { user, loading: authLoading } = useRequireAuth({ allowedRoles: ["physician"] });
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = useMemo(() => Number(params.id), [params.id]);

  const [consultation, setConsultation] = useState<Consultation | null>(null);
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    apiFetch<ShowResponse>(`/consultations/${id}`)
      .then((res) => {
        if (!mounted) return;
        setLoading(false);
        if (!res.ok) {
          setError(res.message);
          return;
        }
        const c = normalizeConsultation(res.data.consultation);
        setConsultation(c);
        setResponse(c.physician_response ?? "");
      })
      .catch(() => {
        if (!mounted) return;
        setLoading(false);
        setError("فشل تحميل الاستشارة");
      });
    return () => {
      mounted = false;
    };
  }, [id]);

  async function submit(markCompleted: boolean) {
    if (!consultation) return;
    setSaving(true);
    setError(null);

    const res = await apiFetch<ShowResponse>(`/consultations/${consultation.id}/respond`, {
      method: "POST",
      body: JSON.stringify({ response, mark_completed: markCompleted }),
    });

    setSaving(false);
    if (!res.ok) {
      setError(res.message);
      return;
    }
    router.push("/physician/dashboard");
  }

  const med = consultation?.patient?.medicalProfile;

  return (
    <PageLoadingGate
      loading={authLoading || loading}
      message="جاري تحميل تفاصيل الاستشارة..."
    >
    <div className="min-h-screen bg-transparent">
      <AppHeader
        title="تفاصيل الاستشارة"
        backHref="/physician/dashboard"
        userRole={user?.role}
      />

      <main className="mx-auto w-full max-w-3xl px-4 py-8">
        {error ? (
          <div className="mb-4">
            <Alert variant="error">{error}</Alert>
          </div>
        ) : null}

        {consultation ? (
          <Card>
            <CardBody>
              <ConsultationDetailHeader
                id={consultation.id}
                status={consultation.status}
                physicianResponse={consultation.physician_response}
                questionText={consultation.question_text}
                variant="physician"
              />
              {consultation.patient?.name ? (
                <div className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
                  المراجع: <span className="font-medium text-foreground">{consultation.patient.name}</span>
                </div>
              ) : null}

              {med ? (
                <div className="mt-4">
                  <MedicalProfileSummaryCard
                    title="الملف الطبي للمراجع"
                    subtitle=""
                    profile={med}
                  />
                </div>
              ) : (
                <div className="mt-4 rounded-xl border border-(--border) bg-(--surface-2) px-4 py-3 text-sm text-(--muted)">
                  لا يوجد ملف طبي مكتمل لهذا المراجع.
                </div>
              )}

              {consultation.medical_files && consultation.medical_files.length ? (
                <div className="mt-6">
                  <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                    الملفات المرفقة
                  </div>
                  <div className="mt-2">
                    <MedicalFilesList
                      files={consultation.medical_files}
                      preview="images_and_pdfs"
                      onError={(m) => setError(m)}
                    />
                  </div>
                </div>
              ) : null}

              <PhysicianResponseForm
                value={response}
                onChange={setResponse}
                saving={saving}
                onSubmitReview={() => submit(false)}
                onSubmitComplete={() => submit(true)}
              />
            </CardBody>
          </Card>
        ) : !error ? (
          <div className="rounded-2xl border border-(--border) bg-(--surface) p-6 text-sm text-zinc-600 dark:text-zinc-400">
            لم يتم العثور على الاستشارة.
          </div>
        ) : null}
      </main>
    </div>
    </PageLoadingGate>
  );
}
