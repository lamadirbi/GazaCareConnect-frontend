"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useRequireAuth } from "@/lib/auth";
import { useMountedRef } from "@/lib/hooks/useMountedRef";
import { uploadMedicalFiles } from "@/lib/medicalFiles";
import { AppHeader } from "@/components/AppHeader";
import { PageLoadingGate } from "@/components/PageLoadingGate";
import { Card, CardBody } from "@/components/ui/Card";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { LocalFilePicker } from "@/components/ui/LocalFilePicker";
import {
  ConsultationDetailHeader,
  ConsultationThread,
  MedicalFilesList,
  PhysicianInfoModal,
  SelectedLocalFilesList,
  getConsultationDetail,
  postConsultationMessage,
  updateConsultation,
  type ConsultationDetail,
  type ConsultationMessage,
  type MedicalFile,
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
  const [keptFiles, setKeptFiles] = useState<MedicalFile[]>([]);
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [savingEdit, setSavingEdit] = useState(false);
  const [replying, setReplying] = useState(false);

  function applyConsultation(raw: ConsultationDetail) {
    const c: ConsultationDetail = { ...raw };
    c.medical_files =
      c.medical_files ?? (c as { medicalFiles?: typeof c.medical_files }).medicalFiles ?? [];
    if (c.physician?.physician_profile && !c.physician.physicianProfile) {
      c.physician.physicianProfile = c.physician.physician_profile;
    }
    c.messages = normalizeMessages(c);
    setConsultation(c);
    setEditText(c.question_text);
    setKeptFiles([...(c.medical_files ?? [])]);
  }

  function startEditing() {
    if (!consultation) return;
    setEditText(consultation.question_text);
    setKeptFiles([...(consultation.medical_files ?? [])]);
    setNewFiles([]);
    setEditing(true);
  }

  function cancelEditing() {
    if (!consultation) return;
    setEditing(false);
    setEditText(consultation.question_text);
    setKeptFiles([...(consultation.medical_files ?? [])]);
    setNewFiles([]);
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
    const text = editText.trim();
    if (text.length < 10) {
      setError("نص الاستشارة يجب أن يكون 10 أحرف على الأقل.");
      return;
    }

    setSavingEdit(true);
    setError(null);

    let uploadedIds: number[] = [];
    if (newFiles.length > 0) {
      const uploadRes = await uploadMedicalFiles(newFiles);
      if (!uploadRes.ok) {
        setSavingEdit(false);
        setError(uploadRes.message);
        return;
      }
      uploadedIds = uploadRes.data.files.map((f) => f.id);
    }

    const fileIds = [...keptFiles.map((f) => f.id), ...uploadedIds];
    const res = await updateConsultation(consultation.id, {
      question_text: text,
      file_ids: fileIds,
    });

    setSavingEdit(false);
    if (!res.ok) {
      setError(res.message);
      return;
    }
    applyConsultation(res.data.consultation);
    setNewFiles([]);
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
                      <Button type="button" variant="secondary" size="sm" onClick={startEditing}>
                        تعديل الاستشارة
                      </Button>
                    ) : (
                      <div className="grid gap-4">
                        <div className="grid gap-2">
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
                        </div>

                        <div className="grid gap-2">
                          <div className="text-sm font-medium">المرفقات الطبية</div>
                          <p className="text-xs text-(--muted)">
                            احذفي مرفقاً أو أضيفي تقارير/صور قبل رد الطبيب.
                          </p>

                          {keptFiles.length > 0 ? (
                            <ul className="grid gap-2">
                              {keptFiles.map((f) => (
                                <li
                                  key={f.id}
                                  className="flex items-center justify-between gap-3 rounded-xl border border-(--border) bg-(--surface-2) px-3 py-2"
                                >
                                  <div className="min-w-0">
                                    <div className="truncate text-sm font-medium text-foreground">
                                      {f.original_name}
                                    </div>
                                    <div className="text-xs text-(--muted)">
                                      {f.file_kind || f.mime_type || "مرفق"}
                                    </div>
                                  </div>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    disabled={savingEdit}
                                    onClick={() =>
                                      setKeptFiles((prev) => prev.filter((x) => x.id !== f.id))
                                    }
                                  >
                                    إزالة
                                  </Button>
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <p className="text-xs text-(--muted)">لا توجد مرفقات حالياً.</p>
                          )}

                          <LocalFilePicker
                            className="mt-1"
                            accept="image/*,.pdf"
                            multiple
                            buttonLabel="اختيار ملفات"
                            hint={
                              newFiles.length
                                ? `${newFiles.length} ملف جديد قيد الإضافة`
                                : "أضيفي مرفقات جديدة (اختياري)"
                            }
                            onPick={(picked) => {
                              if (savingEdit) return;
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
                                setNewFiles((prev) => [...prev, ...allowed]);
                              }
                            }}
                          />

                          {newFiles.length > 0 ? (
                            <div className="rounded-2xl border border-(--border) bg-(--surface-2) p-4">
                              <div className="mb-2 text-sm font-semibold text-foreground">
                                ملفات جديدة
                              </div>
                              <SelectedLocalFilesList
                                files={newFiles}
                                onRemoveAt={(idx) =>
                                  setNewFiles((prev) => prev.filter((_, i) => i !== idx))
                                }
                              />
                            </div>
                          ) : null}
                        </div>

                        <div className="flex flex-wrap gap-2">
                          <Button type="button" size="sm" onClick={saveEdit} disabled={savingEdit}>
                            {savingEdit ? "جاري الحفظ..." : "حفظ التعديل"}
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={cancelEditing}
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

            {!editing && files.length > 0 ? (
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
