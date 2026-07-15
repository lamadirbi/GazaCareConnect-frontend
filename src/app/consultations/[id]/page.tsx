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
import { Button } from "@/components/ui/Button";
import {
  ConsultationDetailHeader,
  ConsultationThread,
  MedicalFilesList,
  PhysicianInfoModal,
  getConsultationDetail,
  postConsultationMessage,
  updateConsultation,
  type ConsultationDetail,
  type ConsultationMessage,
  type PhysicianProfileData,
} from "@/features/consultations";

function normalizeMessages(raw: ConsultationDetail): ConsultationMessage[] {
  const list = (raw.messages ?? []) as ConsultationMessage[];
  if (list.length > 0) return list;
  if (raw.physician_response?.trim()) {
    return [
      {
        id: -1,
        sender_role: "physician",
        body: raw.physician_response,
        created_at: raw.responded_at ?? raw.submitted_at,
        sender: raw.physician
          ? { id: raw.physician.id, name: raw.physician.name, role: "physician" }
          : null,
      },
    ];
  }
  return [];
}

export default function ConsultationDetailPage() {
  const { user, loading: authLoading } = useRequireAuth();
  const params = useParams<{ id: string }>();
  const id = useMemo(() => Number(params.id), [params.id]);
  const mounted = useMountedRef();

  const [consultation, setConsultation] = useState<ConsultationDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [physicianModalOpen, setPhysicianModalOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editText, setEditText] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);
  const [replying, setReplying] = useState(false);

  function applyConsultation(raw: ConsultationDetail) {
    const c: ConsultationDetail = { ...raw };
    c.medical_files = c.medical_files ?? (c as { medicalFiles?: typeof c.medical_files }).medicalFiles ?? [];
    if (c.physician?.physician_profile && !c.physician.physicianProfile) {
      c.physician.physicianProfile = c.physician.physician_profile;
    }
    c.messages = normalizeMessages(c);
    setConsultation(c);
    setEditText(c.question_text);
  }

  useEffect(() => {
    getConsultationDetail(id)
      .then((res) => {
        if (!mounted.current) return;
        setLoading(false);
        if (!res.ok) {
          setError(res.message);
          return;
        }
        applyConsultation(res.data.consultation);
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
  const messages = consultation?.messages ?? [];
  const hasPhysicianReply = messages.some((m) => m.sender_role === "physician");
  const canEdit = Boolean(consultation && !hasPhysicianReply);
  const canReply = Boolean(consultation && hasPhysicianReply);

  async function saveEdit() {
    if (!consultation) return;
    setSavingEdit(true);
    setError(null);
    const res = await updateConsultation(consultation.id, editText.trim());
    setSavingEdit(false);
    if (!res.ok) {
      setError(res.message);
      return;
    }
    applyConsultation(res.data.consultation);
    setEditing(false);
  }

  async function sendReply(body: string) {
    if (!consultation) return;
    setReplying(true);
    setError(null);
    const res = await postConsultationMessage(consultation.id, body);
    setReplying(false);
    if (!res.ok) {
      setError(res.message);
      return;
    }
    applyConsultation(res.data.consultation);
  }

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

                {canEdit ? (
                  <div className="mt-4 border-t border-(--border) pt-4">
                    {!editing ? (
                      <Button type="button" variant="secondary" size="sm" onClick={() => setEditing(true)}>
                        تعديل الاستشارة
                      </Button>
                    ) : (
                      <div className="grid gap-3">
                        <label className="text-sm font-medium" htmlFor="edit-question">
                          نص الاستشارة
                        </label>
                        <textarea
                          id="edit-question"
                          value={editText}
                          onChange={(e) => setEditText(e.target.value)}
                          rows={5}
                          className="w-full rounded-xl border border-(--border) bg-(--surface) px-3 py-2 text-sm leading-6 outline-none focus:ring-2 focus:ring-(--ring)"
                          disabled={savingEdit}
                        />
                        <div className="flex flex-wrap gap-2">
                          <Button type="button" size="sm" onClick={saveEdit} disabled={savingEdit}>
                            {savingEdit ? "جاري الحفظ..." : "حفظ التعديل"}
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setEditing(false);
                              setEditText(consultation.question_text);
                            }}
                            disabled={savingEdit}
                          >
                            إلغاء
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                ) : null}
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

            {messages.length > 0 || canReply ? (
              <Card>
                <CardBody className="p-5 sm:p-6">
                  {consultation.physician && hasPhysicianReply ? (
                    <p className="mb-3 text-sm text-(--muted)">
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
                  <ConsultationThread
                    messages={messages}
                    canReply={canReply}
                    submitting={replying}
                    onSubmitReply={sendReply}
                    replyPlaceholder="اكتب سؤالاً متابعة أو توضيحاً للطبيب..."
                  />
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
