"use client";

import Link from "next/link";
import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { apiFetch } from "@/lib/api";
import { useRequireAuth } from "@/lib/auth";
import { QUEUE_ASSIGNMENT_LABEL } from "@/features/consultations";
import { uploadMedicalFiles } from "@/lib/medicalFiles";
import { AppHeader } from "@/components/AppHeader";
import { AppLoadingScreen } from "@/components/AppLoadingScreen";
import { PageLoadingGate } from "@/components/PageLoadingGate";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { SelectedLocalFilesList } from "@/features/consultations";
import { LocalFilePicker } from "@/components/ui/LocalFilePicker";
import { MedicalProfileSummaryCard } from "@/features/profile";

type Consultation = {
  id: number;
  question_text: string;
  status: "pending" | "completed";
  submitted_at: string;
  assignment_mode?: "queue" | "direct";
};

type CreateResponse = { consultation: Consultation };

type MedicalProfile = {
  height_cm: number | null;
  weight_kg: number | null;
  chronic_diseases: string | null;
  medical_history: string | null;
  allergies: string | null;
  current_medications: string | null;
};
type ProfileResponse = { profile: MedicalProfile };

type VerifiedPhysician = {
  id: number;
  user_id: number;
  specialty: string;
  user?: { id: number; name: string };
};

type Paginated<T> = { data: T[] };

function FormSectionHead({
  step,
  title,
  description,
}: {
  step: number;
  title: string;
  description?: string;
}) {
  return (
    <div className="gc-form-section-head">
      <span className="gc-form-step" aria-hidden>
        {step}
      </span>
      <div>
        <h2 className="gc-form-section-title">{title}</h2>
        {description ? <p className="gc-form-section-desc">{description}</p> : null}
      </div>
    </div>
  );
}

export default function NewConsultationPage() {
  return (
    <Suspense fallback={<AppLoadingScreen message="جاري فتح الصفحة..." />}>
      <NewConsultationContent />
    </Suspense>
  );
}

function NewConsultationContent() {
  const searchParams = useSearchParams();
  const initialMode = searchParams.get("mode") === "direct" ? "direct" : "queue";
  const initialPhysicianId = searchParams.get("physician_id");

  const { user, loading: authLoading } = useRequireAuth({ allowedRoles: ["patient"] });
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [assignmentMode, setAssignmentMode] = useState<"queue" | "direct">(initialMode);
  const [selectedPhysicianId, setSelectedPhysicianId] = useState<string>(
    initialPhysicianId ?? ""
  );
  const [physicians, setPhysicians] = useState<VerifiedPhysician[]>([]);
  const [bootLoading, setBootLoading] = useState(true);

  const [profile, setProfile] = useState<MedicalProfile | null>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [uploadedFileIds, setUploadedFileIds] = useState<number[]>([]);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    let mounted = true;
    Promise.all([
      apiFetch<ProfileResponse>(`/medical-profile`),
      apiFetch<Paginated<VerifiedPhysician>>("/verified-physicians"),
    ])
      .then(([profileRes, physiciansRes]) => {
        if (!mounted) return;
        if (profileRes.ok) setProfile(profileRes.data.profile);
        if (physiciansRes.ok) setPhysicians(physiciansRes.data.data ?? []);
      })
      .catch(() => {})
      .finally(() => {
        if (mounted) setBootLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, [authLoading]);

  const selectedPhysician = useMemo(
    () => physicians.find((p) => String(p.user?.id ?? "") === selectedPhysicianId),
    [physicians, selectedPhysicianId]
  );

  const canSubmit = useMemo(() => {
    if (text.trim().length < 10) return false;
    if (assignmentMode === "direct" && !selectedPhysicianId) return false;
    return true;
  }, [text, assignmentMode, selectedPhysicianId]);

  const charCount = text.trim().length;

  async function uploadSelectedFiles() {
    if (files.length === 0) return [];
    setUploading(true);
    setError(null);
    const res = await uploadMedicalFiles(files);
    setUploading(false);
    if (!res.ok) {
      setError(res.message);
      return [];
    }
    const ids = res.data.files.map((f) => f.id);
    setUploadedFileIds(ids);
    return ids;
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const ids = await uploadSelectedFiles();
    if (files.length > 0 && ids.length === 0) {
      setLoading(false);
      return;
    }

    const res = await apiFetch<CreateResponse>("/consultations", {
      method: "POST",
      body: JSON.stringify({
        question_text: text,
        file_ids: ids.length ? ids : undefined,
        assignment_mode: assignmentMode,
        physician_id:
          assignmentMode === "direct" ? Number(selectedPhysicianId) : undefined,
      }),
    });

    setLoading(false);
    if (!res.ok) {
      setError(res.message);
      return;
    }

    window.location.href = `/consultations/${res.data.consultation.id}`;
  }

  return (
    <PageLoadingGate
      loading={authLoading || bootLoading}
      message="جاري تجهيز نموذج الاستشارة..."
    >
    <div className="min-h-screen bg-transparent">
      <AppHeader title="استشارة جديدة" backHref="/consultations" userRole={user?.role} />

      <main className="mx-auto w-full max-w-3xl px-4 py-8">
        <header className="mb-6">
          <h1 className="text-xl font-bold text-foreground">إرسال استشارة</h1>
          <p className="mt-1.5 text-sm leading-6 text-(--muted)">
            اختر طريقة الإرسال، اكتب سؤالك، وأرفق الملفات عند الحاجة.
          </p>
        </header>

        <form className="grid gap-5" onSubmit={submit}>
          <Card className="overflow-hidden">
            <div className="h-1 bg-gradient-to-l from-(--gc-accent) to-[#0b6e7a]" />
            <div className="p-5 sm:p-6">
              <FormSectionHead
                step={1}
                title="طريقة الإرسال"
                description="لأول طبيب متاح، أو لطبيب تختاره."
              />

              <div className="gc-assignment-grid">
                <label className="gc-assignment-option">
                  <input
                    type="radio"
                    name="assignment_mode"
                    checked={assignmentMode === "queue"}
                    onChange={() => setAssignmentMode("queue")}
                  />
                  <span className="gc-assignment-option-title">{QUEUE_ASSIGNMENT_LABEL}</span>
                  <span className="gc-assignment-option-desc">
                    تبقى بانتظار أول طبيب متاح لاستلامها.
                  </span>
                </label>

                <label className="gc-assignment-option">
                  <input
                    type="radio"
                    name="assignment_mode"
                    checked={assignmentMode === "direct"}
                    onChange={() => setAssignmentMode("direct")}
                  />
                  <span className="gc-assignment-option-title">طبيب محدّد</span>
                  <span className="gc-assignment-option-desc">
                    تُرسل مباشرة إلى الطبيب الذي تختاره.
                  </span>
                </label>
              </div>

              {assignmentMode === "direct" ? (
                <div className="gc-assignment-direct-panel">
                  <label className="grid gap-2">
                    <span className="text-xs font-semibold text-(--muted)">اختر الطبيب</span>
                    <select
                      value={selectedPhysicianId}
                      onChange={(e) => setSelectedPhysicianId(e.target.value)}
                      required
                      className="rounded-xl border border-(--border) bg-(--surface) px-3 py-2.5 text-sm"
                    >
                      <option value="">— اختر من القائمة —</option>
                      {physicians.map((p) => (
                        <option key={p.id} value={p.user?.id ?? ""}>
                          {p.user?.name} — {p.specialty}
                        </option>
                      ))}
                    </select>
                  </label>
                  <Link
                    href="/physicians"
                    className="mt-2 inline-block text-xs font-semibold text-(--gc-accent) hover:underline"
                  >
                    تصفح الأطباء الموثّقين
                  </Link>
                  {selectedPhysician ? (
                    <p className="mt-3 rounded-xl border border-sky-200/80 bg-sky-50/80 px-3 py-2.5 text-xs text-sky-900 dark:border-sky-900/40 dark:bg-sky-950/40 dark:text-sky-100">
                      ستُرسل إلى د. {selectedPhysician.user?.name}
                    </p>
                  ) : null}
                </div>
              ) : null}
            </div>
          </Card>

          {profile ? (
            <Card className="overflow-hidden">
              <div className="p-5 sm:p-6">
                <FormSectionHead
                  step={2}
                  title="ملفك الطبي"
                  description="يُرفق مع الاستشارة. راجع البيانات قبل الإرسال."
                />
                <MedicalProfileSummaryCard profile={profile} editHref="/profile" embedded />
              </div>
            </Card>
          ) : null}

          <Card className="overflow-hidden">
            <div className="p-5 sm:p-6">
              <FormSectionHead
                step={profile ? 3 : 2}
                title="سؤال الاستشارة"
                description="صف أعراضك أو اكتب سؤالك الطبي."
              />

              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                rows={7}
                minLength={10}
                required
                placeholder="مثال: صداع منذ أسبوعين مع دوخة عند الوقوف. هل أحتاج فحوصات؟"
                className="gc-consult-textarea"
              />
              <p className="mt-2 text-xs text-(--muted)">
                {charCount < 10
                  ? `أدخل 10 أحرف على الأقل (${charCount}/10)`
                  : `${charCount} حرف`}
              </p>
            </div>
          </Card>

          <Card className="overflow-hidden">
            <div className="p-5 sm:p-6">
              <FormSectionHead
                step={profile ? 4 : 3}
                title="مرفقات (اختياري)"
                description="تقارير، أشعة، أو تحاليل — PDF أو صورة."
              />

              <LocalFilePicker
                accept="image/*,.pdf"
                multiple
                buttonLabel="اختيار ملفات"
                hint={
                  files.length
                    ? `${files.length} ملف محدد${uploadedFileIds.length ? ` · تم رفع ${uploadedFileIds.length}` : ""}`
                    : "لم تُختَر ملفات بعد"
                }
                onPick={(picked) => {
                  const allowed = picked.filter((f) => {
                    const t = (f.type || "").toLowerCase();
                    const n = f.name.toLowerCase();
                    return (
                      t.startsWith("image/") ||
                      t === "application/pdf" ||
                      n.endsWith(".pdf")
                    );
                  });
                  if (allowed.length < picked.length) {
                    setError("يُسمح فقط بصور أو ملفات PDF.");
                  }
                  if (allowed.length) {
                    setFiles((prev) => [...prev, ...allowed]);
                  }
                }}
              />

              {files.length ? (
                <div className="mt-4 rounded-2xl border border-(--border) bg-(--surface-2) p-4">
                  <div className="mb-2 text-sm font-semibold text-foreground">الملفات المحددة</div>
                  <SelectedLocalFilesList
                    files={files}
                    onRemoveAt={(idx) => setFiles((prev) => prev.filter((_, i) => i !== idx))}
                  />
                </div>
              ) : null}
            </div>
          </Card>

          {error ? <Alert variant="error">{error}</Alert> : null}

          <Card className="overflow-hidden">
            <div className="p-5 sm:p-6">
              <div className="gc-form-submit-bar">
                <Link href="/consultations" className="w-full sm:w-auto">
                  <Button variant="secondary" className="w-full sm:w-auto" type="button">
                    إلغاء
                  </Button>
                </Link>
                <Button
                  type="submit"
                  disabled={loading || uploading || !canSubmit}
                  className="w-full sm:w-auto"
                >
                  {uploading
                    ? "جاري رفع الملفات..."
                    : loading
                      ? "جاري الإرسال..."
                      : "إرسال الاستشارة"}
                </Button>
              </div>
            </div>
          </Card>
        </form>
      </main>
    </div>
    </PageLoadingGate>
  );
}
