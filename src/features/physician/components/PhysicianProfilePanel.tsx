"use client";

import { useEffect, useMemo, useState } from "react";
import { apiFetch, downloadWithAuth } from "@/lib/api";
import { uploadMedicalFiles } from "@/lib/medicalFiles";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { triggerBlobDownload } from "@/components/BlobDownload";

type CertificateFileRef = {
  id: number;
  original_name: string;
  mime_type?: string | null;
  file_kind?: string | null;
};

type PhysicianProfile = {
  specialty: string;
  certificate: string;
  certificate_file_id?: number | null;
  certificate_file_ids?: number[];
  certificateFile?: CertificateFileRef | null;
  certificateFiles?: CertificateFileRef[];
  verification_status?: string | null;
  rejection_reason?: string | null;
};
type PhysicianProfileResponse = { profile: PhysicianProfile };

function normalizePhysicianProfile(raw: any): PhysicianProfile {
  const fromRel = raw?.certificate_files ?? raw?.certificateFiles ?? [];
  const arr: CertificateFileRef[] = Array.isArray(fromRel)
    ? fromRel.map((f: any) => ({
        id: f.id,
        original_name: f.original_name,
        mime_type: f.mime_type ?? null,
        file_kind: f.file_kind ?? null,
      }))
    : [];
  const cf = raw?.certificate_file ?? raw?.certificateFile;
  const legacy =
    cf && arr.length === 0
      ? [
          {
            id: cf.id,
            original_name: cf.original_name,
            mime_type: cf.mime_type ?? null,
            file_kind: cf.file_kind ?? null,
          },
        ]
      : [];
  const certificateFiles = arr.length ? arr : legacy;
  const idsRaw = raw?.certificate_file_ids;
  const certificate_file_ids = Array.isArray(idsRaw)
    ? idsRaw.map((x: any) => Number(x)).filter((n: number) => !Number.isNaN(n))
    : certificateFiles.map((f) => f.id);

  return {
    specialty: raw?.specialty ?? "",
    certificate: raw?.certificate ?? "",
    certificate_file_id: certificateFiles[0]?.id ?? raw?.certificate_file_id ?? null,
    certificate_file_ids,
    certificateFile: certificateFiles[0] ?? null,
    certificateFiles,
    verification_status: raw?.verification_status ?? null,
    rejection_reason: raw?.rejection_reason ?? null,
  };
}

type Props = {
  initialProfile?: any;
  verificationStatus?: string | null;
  rejectionReason?: string | null;
  onVerificationChange?: (next: {
    verification_status: string;
    rejection_reason: string | null;
  }) => void;
};

export function PhysicianProfilePanel({
  initialProfile,
  verificationStatus,
  rejectionReason,
  onVerificationChange,
}: Props) {
  const [profile, setProfile] = useState<PhysicianProfile | null>(() =>
    initialProfile ? normalizePhysicianProfile(initialProfile) : null,
  );
  const [editingProfile, setEditingProfile] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [resubmitting, setResubmitting] = useState(false);
  const [profileMsg, setProfileMsg] = useState<string | null>(null);
  const [certificateUploading, setCertificateUploading] = useState(false);
  const [certPreviewMap, setCertPreviewMap] = useState<
    Record<number, { url: string; kind: "image" | "pdf" }>
  >({});
  const [localStatus, setLocalStatus] = useState<string | null | undefined>(
    verificationStatus ?? initialProfile?.verification_status,
  );
  const [localReason, setLocalReason] = useState<string | null | undefined>(
    rejectionReason ?? initialProfile?.rejection_reason,
  );

  useEffect(() => {
    setLocalStatus(verificationStatus ?? profile?.verification_status);
  }, [verificationStatus, profile?.verification_status]);

  useEffect(() => {
    setLocalReason(rejectionReason ?? profile?.rejection_reason);
  }, [rejectionReason, profile?.rejection_reason]);

  const isRejected = localStatus === "rejected";
  const isPending = localStatus === "pending";

  const certificateList = useMemo(() => {
    if (!profile) return [];
    if (profile.certificateFiles?.length) return profile.certificateFiles;
    if (profile.certificateFile) return [profile.certificateFile];
    return [];
  }, [profile]);

  const certFilesKey = useMemo(() => certificateList.map((f) => f.id).join(","), [certificateList]);

  useEffect(() => {
    let mounted = true;
    apiFetch<PhysicianProfileResponse>("/physician-profile")
      .then((res) => {
        if (!mounted) return;
        if (!res.ok) return;
        const next = normalizePhysicianProfile(res.data.profile);
        setProfile(next);
        if (next.verification_status) setLocalStatus(next.verification_status);
        if (next.rejection_reason !== undefined) setLocalReason(next.rejection_reason);
      })
      .catch(() => {});
    return () => {
      mounted = false;
    };
  }, []);

  function isCertificateFileImage(f: CertificateFileRef | null | undefined) {
    if (!f) return false;
    const mime = f.mime_type ?? "";
    const name = f.original_name ?? "";
    if (mime.startsWith("image/")) return true;
    if (f.file_kind === "image") return true;
    return /\.(jpe?g|png|gif|webp|bmp)$/i.test(name);
  }

  function isCertificateFilePdf(f: CertificateFileRef | null | undefined) {
    if (!f) return false;
    const mime = f.mime_type ?? "";
    const name = f.original_name ?? "";
    if (mime === "application/pdf" || mime.includes("pdf")) return true;
    if (f.file_kind === "pdf") return true;
    return name.toLowerCase().endsWith(".pdf");
  }

  useEffect(() => {
    if (!certFilesKey) {
      setCertPreviewMap((prev) => {
        Object.values(prev).forEach((v) => URL.revokeObjectURL(v.url));
        return {};
      });
      return;
    }
    const previewable = certificateList.filter((f) => isCertificateFileImage(f) || isCertificateFilePdf(f));
    if (!previewable.length) {
      setCertPreviewMap((prev) => {
        Object.values(prev).forEach((v) => URL.revokeObjectURL(v.url));
        return {};
      });
      return;
    }

    const next: Record<number, { url: string; kind: "image" | "pdf" }> = {};
    const urlsToRevoke: string[] = [];
    let cancelled = false;

    (async () => {
      for (const f of previewable) {
        if (cancelled) break;
        const res = await downloadWithAuth(`/medical-files/${f.id}/download`);
        if (cancelled || !res.ok) continue;
        const url = URL.createObjectURL(res.data.blob);
        urlsToRevoke.push(url);
        next[f.id] = { url, kind: isCertificateFilePdf(f) ? "pdf" : "image" };
      }
      if (!cancelled) setCertPreviewMap(next);
    })();

    return () => {
      cancelled = true;
      urlsToRevoke.forEach((u) => URL.revokeObjectURL(u));
    };
  }, [certFilesKey, certificateList]);

  async function saveProfile(options?: { resubmit?: boolean }) {
    if (!profile) return;
    const resubmit = Boolean(options?.resubmit);
    if (resubmit) setResubmitting(true);
    else setSavingProfile(true);
    setProfileMsg(null);
    const ids = certificateList.map((f) => f.id);
    const res = await apiFetch<PhysicianProfileResponse>("/physician-profile", {
      method: "PUT",
      body: JSON.stringify({
        specialty: profile.specialty,
        certificate: profile.certificate ?? "",
        certificate_file_ids: ids,
        resubmit: resubmit ? true : undefined,
      }),
    });
    setSavingProfile(false);
    setResubmitting(false);
    if (!res.ok) {
      setProfileMsg(res.message);
      return;
    }
    const next = normalizePhysicianProfile(res.data.profile);
    setProfile(next);
    const status = next.verification_status ?? (resubmit ? "pending" : localStatus) ?? "pending";
    const reason = next.rejection_reason ?? (resubmit ? null : localReason) ?? null;
    setLocalStatus(status);
    setLocalReason(reason);
    onVerificationChange?.({
      verification_status: status,
      rejection_reason: reason,
    });
    setProfileMsg(
      resubmit
        ? "تم إرسال طلب التوثيق مجدداً. ستظهر حالتك بانتظار المراجعة."
        : "تم حفظ معلومات الطبيب",
    );
    setEditingProfile(false);
  }

  async function uploadCertificateFiles(toUpload: File[]) {
    if (!profile || toUpload.length === 0) return;
    setCertificateUploading(true);
    setProfileMsg(null);

    const up = await uploadMedicalFiles(toUpload);
    if (!up.ok) {
      setCertificateUploading(false);
      setProfileMsg(up.message);
      return;
    }
    const newRefs: CertificateFileRef[] = up.data.files.map((row) => ({
      id: row.id,
      original_name: row.original_name ?? "certificate",
      mime_type: row.mime_type ?? null,
      file_kind: row.file_kind ?? null,
    }));

    const mergedFiles = [...certificateList, ...newRefs];
    const mergedIds = mergedFiles.map((f) => f.id);
    const next: PhysicianProfile = {
      ...profile,
      certificateFiles: mergedFiles,
      certificate_file_ids: mergedIds,
      certificateFile: mergedFiles[0] ?? null,
      certificate_file_id: mergedIds[0] ?? null,
    };
    setProfile(next);
    setCertificateUploading(false);

    if (next.specialty?.trim()) {
      const saveRes = await apiFetch<PhysicianProfileResponse>("/physician-profile", {
        method: "PUT",
        body: JSON.stringify({
          specialty: next.specialty,
          certificate: next.certificate ?? "",
          certificate_file_ids: mergedIds,
        }),
      });
      if (saveRes.ok) {
        setProfile(normalizePhysicianProfile(saveRes.data.profile));
        setProfileMsg(newRefs.length > 1 ? `تم رفع ${newRefs.length} مرفقات وحفظها.` : "تم رفع مرفق الشهادة وحفظه.");
        return;
      }
      setProfileMsg(saveRes.message || "تم الرفع؛ اضغط حفظ لإرفاق الملفات.");
      return;
    }
    setProfileMsg("تم رفع الملفات. عيّن التخصص ثم احفظ لتثبيت المرفقات.");
  }

  function removeCertificateAt(index: number) {
    setProfile((p) => {
      if (!p) return p;
      const list = p.certificateFiles?.length ? [...p.certificateFiles] : p.certificateFile ? [p.certificateFile] : [];
      const nextList = list.filter((_, i) => i !== index);
      const ids = nextList.map((f) => f.id);
      return {
        ...p,
        certificateFiles: nextList,
        certificate_file_ids: ids,
        certificateFile: nextList[0] ?? null,
        certificate_file_id: ids[0] ?? null,
      };
    });
  }

  async function downloadCertificateFile(fileId: number, fallbackName: string) {
    const res = await downloadWithAuth(`/medical-files/${fileId}/download`);
    if (!res.ok) {
      setProfileMsg(res.message);
      return;
    }
    triggerBlobDownload(res.data.blob, res.data.filename ?? fallbackName);
  }

  function certFileIcon(f: CertificateFileRef) {
    if (isCertificateFileImage(f)) return "صورة";
    if (isCertificateFilePdf(f)) return "PDF";
    return "ملف";
  }

  return (
    <Card className="overflow-hidden">
      <div className="h-1 bg-gradient-to-l from-(--gc-accent) to-[#0b6e7a]" />

      <div className="p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-foreground">ملف الطبيب</h2>
            <p className="mt-1 text-xs leading-6 text-(--muted)">
              تظهر للمراجع عند الرد على الاستشارة.
            </p>
          </div>
          {profile && !isRejected ? (
            <Button
              type="button"
              variant={editingProfile ? "secondary" : "primary"}
              size="sm"
              onClick={() => {
                setProfileMsg(null);
                setEditingProfile((v) => !v);
              }}
            >
              {editingProfile ? "إغلاق التعديل" : "تعديل الملف"}
            </Button>
          ) : null}
        </div>

        {isPending && !isRejected ? (
          <div className="mt-4">
            <Alert variant="info">
              حسابك بانتظار موافقة الإدارة. لن تتمكن من عرض الحالات أو استلام الاستشارات حتى يتم توثيقك.
            </Alert>
          </div>
        ) : null}

        {profile ? (
          <>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <div className="gc-profile-field">
                <div className="gc-profile-field-label">التخصص</div>
                <div className="gc-profile-field-value">
                  {profile.specialty?.trim() ? profile.specialty : "غير محدد"}
                </div>
              </div>

              <div className="gc-profile-field sm:col-span-2">
                <div className="gc-profile-field-label">عدد مرفقات الشهادة</div>
                <div className="gc-profile-field-value">
                  {certificateList.length
                    ? `${certificateList.length} مرفق`
                    : "لا توجد مرفقات"}
                </div>
              </div>
            </div>

            <div className="mt-5">
              <div className="gc-section-label mb-2">وصف المؤهل</div>
              <div className="gc-physician-profile-text">
                {profile.certificate?.trim() ? profile.certificate : "لم يُضف وصف بعد."}
              </div>
            </div>

            {certificateList.length ? (
              <div className="mt-5">
                <div className="gc-section-label mb-3">
                  مرفقات الشهادة ({certificateList.length})
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  {certificateList.map((cf, idx) => {
                    const prev = certPreviewMap[cf.id];
                    return (
                      <div key={`${cf.id}-${idx}`} className="gc-cert-file-card">
                        {prev ? (
                          <div className="gc-cert-file-preview p-2">
                            {prev.kind === "image" ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={prev.url} alt="" />
                            ) : (
                              <iframe title={`معاينة ${cf.original_name}`} src={prev.url} />
                            )}
                          </div>
                        ) : null}
                        <div className="gc-cert-file-row">
                          <div className="flex min-w-0 items-center gap-3">
                            <span className="gc-cert-file-icon">{certFileIcon(cf)}</span>
                            <div className="min-w-0">
                              <div className="truncate text-sm font-semibold text-foreground">
                                {cf.original_name}
                              </div>
                              <div className="mt-0.5 text-xs text-(--muted)">مرفق #{idx + 1}</div>
                            </div>
                          </div>
                          <Button
                            type="button"
                            variant="secondary"
                            size="sm"
                            className="shrink-0"
                            onClick={() => downloadCertificateFile(cf.id, cf.original_name)}
                          >
                            تنزيل
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <p className="mt-5 rounded-xl border border-dashed border-(--border) bg-(--surface-2) px-4 py-3 text-xs text-(--muted)">
                لا توجد شهادات مرفقة. يمكنك إضافتها من «تعديل البيانات».
              </p>
            )}

            {isRejected ? (
              <div className="gc-reject-banner mt-5">
                <h3 className="gc-reject-banner-title">تم رفض طلب التوثيق</h3>
                <p className="gc-reject-banner-reason">
                  <span className="font-semibold">سبب الرفض: </span>
                  {localReason?.trim() || "لم تُذكر تفاصيل إضافية من الإدارة."}
                </p>
                <div className="gc-reject-banner-actions">
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      setProfileMsg(null);
                      setEditingProfile(true);
                    }}
                  >
                    تعديل البيانات
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    disabled={resubmitting || !profile?.specialty?.trim()}
                    onClick={() => void saveProfile({ resubmit: true })}
                  >
                    {resubmitting ? "جاري الإرسال..." : "إرسال طلب مجدداً"}
                  </Button>
                </div>
              </div>
            ) : null}

            {profileMsg ? (
              <div className="mt-4">
                <Alert variant={profileMsg.includes("تم") ? "success" : "info"}>{profileMsg}</Alert>
              </div>
            ) : null}

            {editingProfile ? (
              <div className="gc-physician-edit-panel grid gap-4">
                <div className="text-sm font-semibold text-foreground">تعديل معلومات الملف</div>

                <label className="grid gap-1.5">
                  <span className="text-sm font-medium text-foreground">التخصص</span>
                  <input
                    value={profile.specialty}
                    onChange={(e) => setProfile((p) => (p ? { ...p, specialty: e.target.value } : p))}
                    className="h-11 rounded-xl border border-(--border) bg-(--surface) px-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-(--ring)"
                  />
                </label>

                <label className="grid gap-1.5">
                  <span className="text-sm font-medium text-foreground">وصف المؤهل (اختياري)</span>
                  <textarea
                    value={profile.certificate}
                    onChange={(e) => setProfile((p) => (p ? { ...p, certificate: e.target.value } : p))}
                    rows={4}
                    className="gc-consult-textarea min-h-[6.5rem]"
                  />
                </label>

                <div className="grid gap-2">
                  <span className="text-sm font-medium text-foreground">
                    مرفقات الشهادة (صور أو PDF)
                  </span>
                  <div className="gc-file-picker">
                    <input
                      type="file"
                      multiple
                      aria-label="مرفقات الشهادة"
                      accept="image/*,application/pdf"
                      onChange={(e) => {
                        const picked = Array.from(e.target.files ?? []);
                        e.target.value = "";
                        if (picked.length) void uploadCertificateFiles(picked);
                      }}
                    />
                    {certificateUploading ? (
                      <p className="text-xs text-(--muted)">جاري رفع الملفات...</p>
                    ) : (
                      <p className="text-xs text-(--muted)">يمكنك اختيار أكثر من ملف</p>
                    )}
                  </div>

                  {certificateList.length ? (
                    <ul className="grid gap-2">
                      {certificateList.map((cf, idx) => (
                        <li
                          key={`${cf.id}-${idx}`}
                          className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-(--border) bg-(--surface) px-3 py-2.5"
                        >
                          <span className="min-w-0 truncate text-xs font-medium text-foreground">
                            {cf.original_name}
                          </span>
                          <div className="flex shrink-0 gap-1">
                            <Button
                              type="button"
                              variant="secondary"
                              size="sm"
                              onClick={() => downloadCertificateFile(cf.id, cf.original_name)}
                            >
                              تنزيل
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeCertificateAt(idx)}
                            >
                              إزالة
                            </Button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-xs text-(--muted)">لا توجد مرفقات حالياً.</p>
                  )}
                </div>

                <div className="gc-form-submit-bar !border-t-0 !pt-0">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => {
                      setEditingProfile(false);
                      setProfileMsg(null);
                    }}
                  >
                    إلغاء
                  </Button>
                  {isRejected ? (
                    <Button
                      type="button"
                      onClick={() => void saveProfile({ resubmit: true })}
                      disabled={savingProfile || resubmitting || !profile?.specialty?.trim()}
                    >
                      {resubmitting || savingProfile
                        ? "جاري الإرسال..."
                        : "حفظ وإرسال الطلب مجدداً"}
                    </Button>
                  ) : (
                    <Button
                      type="button"
                      onClick={() => void saveProfile()}
                      disabled={savingProfile || !profile?.specialty?.trim()}
                    >
                      {savingProfile ? "جاري الحفظ..." : "حفظ التعديل"}
                    </Button>
                  )}
                </div>
              </div>
            ) : null}
          </>
        ) : (
          <p className="mt-4 text-sm text-(--muted)">جاري تحميل معلومات الطبيب...</p>
        )}
      </div>
    </Card>
  );
}

