"use client";

import { useEffect, useState } from "react";
import { apiFetch, downloadWithAuth } from "@/lib/api";
import { useRequireAuth } from "@/lib/auth";
import { AppHeader } from "@/components/AppHeader";
import { PageLoadingGate } from "@/components/PageLoadingGate";
import { Card, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { RejectReasonModal } from "@/components/ui/RejectReasonModal";
import { PhysicianPhotoBox } from "@/features/physician/components/PhysicianPhotoBox";
import { triggerBlobDownload } from "@/components/BlobDownload";

type CertificateFile = {
  id: number;
  original_name: string;
  mime_type?: string | null;
  file_kind?: string | null;
  size_bytes?: number | null;
};

type PhysicianProfileRow = {
  id: number;
  specialty: string;
  certificate: string;
  verification_status: string;
  rejection_reason?: string | null;
  profile_photo_file_id?: number | null;
  created_at?: string;
  user?: {
    id: number;
    name: string;
    email: string;
    phone?: string | null;
    is_disabled?: boolean;
    created_at?: string;
  };
  certificate_files?: CertificateFile[];
  certificateFiles?: CertificateFile[];
};

type Paginated<T> = { data: T[] };

const statusLabels: Record<string, string> = {
  pending: "بانتظار المراجعة",
  approved: "موثّق",
  rejected: "مرفوض",
};

const statusStyles: Record<string, string> = {
  pending: "bg-amber-100 text-amber-800",
  approved: "bg-emerald-100 text-emerald-800",
  rejected: "bg-red-100 text-red-800",
};

function formatBytes(bytes?: number | null) {
  if (!bytes || bytes <= 0) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(value?: string | null) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  try {
    return new Intl.DateTimeFormat("ar-EG", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(d);
  } catch {
    return d.toLocaleString("ar");
  }
}

function certificateFilesOf(row: PhysicianProfileRow): CertificateFile[] {
  const files = row.certificate_files ?? row.certificateFiles ?? [];
  return Array.isArray(files) ? files : [];
}

function fileKindLabel(kind?: string | null, mime?: string | null) {
  if (kind === "pdf" || mime?.includes("pdf")) return "PDF";
  if (kind === "image" || mime?.startsWith("image/")) return "صورة";
  return "ملف";
}

export default function AdminPhysiciansPage() {
  const { user, loading: authLoading } = useRequireAuth({ allowedRoles: ["admin"] });
  const [rows, setRows] = useState<PhysicianProfileRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [initialLoadDone, setInitialLoadDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [downloadingId, setDownloadingId] = useState<number | null>(null);
  const [statusFilter, setStatusFilter] = useState("pending");
  const [rejectTarget, setRejectTarget] = useState<{ id: number; name: string } | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    const endpoint =
      statusFilter === "pending"
        ? "/admin/physicians/pending"
        : `/admin/physicians?status=${encodeURIComponent(statusFilter)}`;
    const res = await apiFetch<Paginated<PhysicianProfileRow>>(endpoint);
    setLoading(false);
    if (!initialLoadDone) setInitialLoadDone(true);
    if (!res.ok) {
      setError(res.message);
      return;
    }
    setRows(res.data.data ?? []);
  }

  useEffect(() => {
    load();
  }, [statusFilter]);

  async function approve(id: number) {
    setBusyId(id);
    setError(null);
    const res = await apiFetch(`/admin/physicians/${id}/approve`, { method: "POST" });
    setBusyId(null);
    if (!res.ok) {
      setError(res.message);
      return;
    }
    await load();
  }

  async function reject(id: number, reason: string) {
    setBusyId(id);
    setError(null);
    const res = await apiFetch(`/admin/physicians/${id}/reject`, {
      method: "POST",
      body: JSON.stringify({ reason }),
    });
    setBusyId(null);
    if (!res.ok) {
      setError(res.message);
      return;
    }
    setRejectTarget(null);
    await load();
  }

  async function downloadFile(fileId: number, fallbackName: string) {
    setDownloadingId(fileId);
    setError(null);
    const res = await downloadWithAuth(`/medical-files/${fileId}/download`);
    setDownloadingId(null);
    if (!res.ok) {
      setError(res.message);
      return;
    }
    triggerBlobDownload(res.data.blob, res.data.filename ?? fallbackName);
  }

  return (
    <PageLoadingGate
      loading={authLoading || !initialLoadDone}
      message="جاري تحميل طلبات الأطباء..."
    >
    <div className="min-h-screen bg-transparent">
      <AppHeader title="توثيق الأطباء" backHref="/admin/dashboard" userRole={user?.role} />

      <main className="mx-auto w-full max-w-5xl px-4 py-8">
        <Card>
          <CardBody className="p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h1 className="text-lg font-semibold text-zinc-900">
                  مراجعة طلبات الأطباء
                </h1>
                <p className="mt-1 text-sm text-zinc-600">
                  راجع بيانات الطبيب وشهاداته، ثم وثّقه أو ارفض الطلب.
                </p>
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="rounded-xl border border-(--border) bg-(--surface) px-3 py-2 text-sm"
              >
                <option value="pending">بانتظار المراجعة</option>
                <option value="approved">موثّقون</option>
                <option value="rejected">مرفوضون</option>
                <option value="all">الكل</option>
              </select>
            </div>

            {error ? <Alert variant="error" className="mt-4">{error}</Alert> : null}

            {loading ? (
              <p className="mt-6 text-sm text-zinc-500">جاري تحديث القائمة...</p>
            ) : rows.length === 0 ? (
              <p className="mt-6 text-sm text-zinc-500">لا توجد طلبات في هذا القسم.</p>
            ) : (
              <div className="mt-6 grid gap-5">
                {rows.map((row) => {
                  const files = certificateFilesOf(row);
                  const status = row.verification_status;

                  return (
                    <Card key={row.id} className="overflow-hidden">
                      <CardBody className="p-0">
                        <div className="flex flex-col gap-4 border-b border-(--border) bg-(--surface-2) p-5 sm:flex-row sm:items-start sm:justify-between">
                          <div className="flex min-w-0 flex-1 gap-4">
                            <PhysicianPhotoBox
                              fileId={row.profile_photo_file_id}
                              alt={row.user?.name ?? "طبيب"}
                              size="lg"
                            />
                            <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <h2 className="text-base font-semibold text-zinc-900">
                                {row.user?.name ?? "طبيب"}
                              </h2>
                              <span
                                className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusStyles[status] ?? "bg-zinc-100 text-zinc-700"}`}
                              >
                                {statusLabels[status] ?? status}
                              </span>
                              {row.user?.is_disabled ? (
                                <span className="rounded-full bg-red-100 px-2.5 py-1 text-xs font-semibold text-red-700">
                                  حساب معطّل
                                </span>
                              ) : null}
                            </div>
                            <div className="mt-2 grid gap-1 text-sm text-zinc-600">
                              <div className="min-w-0">
                                <span className="font-medium text-zinc-700">البريد:</span>{" "}
                                <span className="break-all" dir="ltr">
                                  {row.user?.email}
                                </span>
                              </div>
                              {row.user?.phone ? (
                                <div>
                                  <span className="font-medium text-zinc-700">الهاتف:</span>{" "}
                                  <span dir="ltr">{row.user.phone}</span>
                                </div>
                              ) : null}
                              <div>
                                <span className="font-medium text-zinc-700">تاريخ التسجيل:</span>{" "}
                                {formatDate(row.user?.created_at ?? row.created_at)}
                              </div>
                            </div>
                          </div>
                          </div>

                          {status === "pending" ? (
                            <div className="flex shrink-0 flex-wrap gap-2">
                              <Button
                                size="sm"
                                disabled={busyId === row.id || row.user?.is_disabled}
                                onClick={() => approve(row.id)}
                              >
                                {busyId === row.id ? "جاري التوثيق..." : "توثيق الطبيب"}
                              </Button>
                              <Button
                                size="sm"
                                variant="secondary"
                                disabled={busyId === row.id}
                                onClick={() =>
                                  setRejectTarget({
                                    id: row.id,
                                    name: row.user?.name ?? "طبيب",
                                  })
                                }
                              >
                                رفض الطلب
                              </Button>
                            </div>
                          ) : null}
                        </div>

                        <div className="grid gap-5 p-5 lg:grid-cols-2">
                          <section className="min-w-0 rounded-2xl border border-(--border) bg-(--surface) p-4">
                            <h3 className="text-sm font-semibold text-zinc-900">
                              المؤهل والتخصص
                            </h3>
                            <dl className="mt-3 space-y-3 text-sm">
                              <div>
                                <dt className="text-xs font-medium text-zinc-500">التخصص</dt>
                                <dd className="mt-1 break-words font-medium text-zinc-900">
                                  {row.specialty}
                                </dd>
                              </div>
                              <div>
                                <dt className="text-xs font-medium text-zinc-500">وصف الشهادة / المؤهل</dt>
                                <dd className="mt-1 whitespace-pre-wrap break-words leading-6 text-zinc-700">
                                  {row.certificate}
                                </dd>
                              </div>
                            </dl>
                          </section>

                          <section className="min-w-0 rounded-2xl border border-(--border) bg-(--surface) p-4">
                            <div className="flex items-center justify-between gap-2">
                              <h3 className="text-sm font-semibold text-zinc-900">
                                مرفقات الشهادة
                              </h3>
                              <span className="shrink-0 text-xs text-zinc-500">{files.length} ملف</span>
                            </div>

                            {files.length === 0 ? (
                              <p className="mt-3 text-sm text-zinc-500">
                                لا توجد مرفقات مرفوعة لهذا الطبيب.
                              </p>
                            ) : (
                              <ul className="mt-3 grid gap-2">
                                {files.map((file) => (
                                  <li
                                    key={file.id}
                                    className="gc-admin-cert-file"
                                  >
                                    <div className="gc-admin-cert-file-thumb" aria-hidden>
                                      {fileKindLabel(file.file_kind, file.mime_type) === "PDF" ? "PDF" : "IMG"}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                      <div
                                        className="truncate text-sm font-medium text-zinc-900"
                                        title={file.original_name}
                                        dir="auto"
                                      >
                                        {file.original_name}
                                      </div>
                                      <div className="mt-0.5 flex flex-wrap items-center gap-x-2 text-xs text-zinc-500">
                                        <span>{fileKindLabel(file.file_kind, file.mime_type)}</span>
                                        <span aria-hidden>·</span>
                                        <span dir="ltr">{formatBytes(file.size_bytes)}</span>
                                      </div>
                                    </div>
                                    <Button
                                      type="button"
                                      size="sm"
                                      variant="secondary"
                                      className="gc-admin-cert-file-action"
                                      disabled={downloadingId === file.id}
                                      onClick={() => downloadFile(file.id, file.original_name)}
                                    >
                                      {downloadingId === file.id ? "..." : "تنزيل"}
                                    </Button>
                                  </li>
                                ))}
                              </ul>
                            )}
                          </section>
                        </div>

                        {row.rejection_reason ? (
                          <div className="border-t border-(--border) bg-red-50 px-4 py-3 text-sm leading-6 text-red-700 sm:px-5 sm:py-4">
                            <span className="font-semibold">سبب الرفض:</span>{" "}
                            <span className="break-words">{row.rejection_reason}</span>
                          </div>
                        ) : null}
                      </CardBody>
                    </Card>
                  );
                })}
              </div>
            )}
          </CardBody>
        </Card>
      </main>

      <RejectReasonModal
        open={Boolean(rejectTarget)}
        physicianName={rejectTarget?.name}
        busy={busyId !== null && busyId === rejectTarget?.id}
        onClose={() => {
          if (busyId !== null) return;
          setRejectTarget(null);
        }}
        onConfirm={(reason) => {
          if (!rejectTarget) return;
          void reject(rejectTarget.id, reason);
        }}
      />
    </div>
    </PageLoadingGate>
  );
}
