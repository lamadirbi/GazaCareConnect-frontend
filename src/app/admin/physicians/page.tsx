"use client";

import { useEffect, useState } from "react";
import { apiFetch, downloadWithAuth } from "@/lib/api";
import { useRequireAuth } from "@/lib/auth";
import { AppHeader } from "@/components/AppHeader";
import { PageLoadingGate } from "@/components/PageLoadingGate";
import { Card, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
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
  pending: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-200",
  approved: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-200",
  rejected: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200",
};

function formatBytes(bytes?: number | null) {
  if (!bytes || bytes <= 0) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(value?: string | null) {
  if (!value) return "—";
  try {
    return new Intl.DateTimeFormat("ar", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(value));
  } catch {
    return value;
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

  async function reject(id: number) {
    const reason = window.prompt("سبب الرفض (اختياري):") ?? "";
    setBusyId(id);
    setError(null);
    const res = await apiFetch(`/admin/physicians/${id}/reject`, {
      method: "POST",
      body: JSON.stringify({ reason: reason || undefined }),
    });
    setBusyId(null);
    if (!res.ok) {
      setError(res.message);
      return;
    }
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
                <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                  مراجعة طلبات الأطباء
                </h1>
                <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
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
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-50">
                                {row.user?.name ?? "طبيب"}
                              </h2>
                              <span
                                className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusStyles[status] ?? "bg-zinc-100 text-zinc-700"}`}
                              >
                                {statusLabels[status] ?? status}
                              </span>
                              {row.user?.is_disabled ? (
                                <span className="rounded-full bg-red-100 px-2.5 py-1 text-xs font-semibold text-red-700 dark:bg-red-900/30 dark:text-red-200">
                                  حساب معطّل
                                </span>
                              ) : null}
                            </div>
                            <div className="mt-2 grid gap-1 text-sm text-zinc-600 dark:text-zinc-400">
                              <div>
                                <span className="font-medium text-zinc-700 dark:text-zinc-300">البريد:</span>{" "}
                                <span dir="ltr">{row.user?.email}</span>
                              </div>
                              {row.user?.phone ? (
                                <div>
                                  <span className="font-medium text-zinc-700 dark:text-zinc-300">الهاتف:</span>{" "}
                                  <span dir="ltr">{row.user.phone}</span>
                                </div>
                              ) : null}
                              <div>
                                <span className="font-medium text-zinc-700 dark:text-zinc-300">تاريخ التسجيل:</span>{" "}
                                {formatDate(row.user?.created_at ?? row.created_at)}
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
                                onClick={() => reject(row.id)}
                              >
                                رفض الطلب
                              </Button>
                            </div>
                          ) : null}
                        </div>

                        <div className="grid gap-5 p-5 lg:grid-cols-2">
                          <section className="rounded-2xl border border-(--border) bg-(--surface) p-4">
                            <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                              المؤهل والتخصص
                            </h3>
                            <dl className="mt-3 space-y-3 text-sm">
                              <div>
                                <dt className="text-xs font-medium text-zinc-500">التخصص</dt>
                                <dd className="mt-1 font-medium text-zinc-900 dark:text-zinc-50">
                                  {row.specialty}
                                </dd>
                              </div>
                              <div>
                                <dt className="text-xs font-medium text-zinc-500">وصف الشهادة / المؤهل</dt>
                                <dd className="mt-1 whitespace-pre-wrap leading-6 text-zinc-700 dark:text-zinc-300">
                                  {row.certificate}
                                </dd>
                              </div>
                            </dl>
                          </section>

                          <section className="rounded-2xl border border-(--border) bg-(--surface) p-4">
                            <div className="flex items-center justify-between gap-2">
                              <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                                مرفقات الشهادة
                              </h3>
                              <span className="text-xs text-zinc-500">{files.length} ملف</span>
                            </div>

                            {files.length === 0 ? (
                              <p className="mt-3 text-sm text-zinc-500">
                                لا توجد مرفقات مرفوعة لهذا الطبيب.
                              </p>
                            ) : (
                              <ul className="mt-3 space-y-2">
                                {files.map((file) => (
                                  <li
                                    key={file.id}
                                    className="flex flex-col gap-3 rounded-xl border border-(--border) bg-(--surface-2) p-3 sm:flex-row sm:items-center sm:justify-between"
                                  >
                                    <div className="min-w-0">
                                      <div className="truncate text-sm font-medium text-zinc-900 dark:text-zinc-50">
                                        {file.original_name}
                                      </div>
                                      <div className="mt-1 flex flex-wrap gap-2 text-xs text-zinc-500">
                                        <span>{fileKindLabel(file.file_kind, file.mime_type)}</span>
                                        <span>•</span>
                                        <span>{formatBytes(file.size_bytes)}</span>
                                      </div>
                                    </div>
                                    <Button
                                      type="button"
                                      size="sm"
                                      variant="secondary"
                                      className="w-full sm:w-auto"
                                      disabled={downloadingId === file.id}
                                      onClick={() => downloadFile(file.id, file.original_name)}
                                    >
                                      {downloadingId === file.id ? "جاري التنزيل..." : "تنزيل"}
                                    </Button>
                                  </li>
                                ))}
                              </ul>
                            )}
                          </section>
                        </div>

                        {row.rejection_reason ? (
                          <div className="border-t border-(--border) bg-red-50 px-5 py-4 text-sm text-red-700 dark:bg-red-950/20 dark:text-red-300">
                            <span className="font-semibold">سبب الرفض:</span> {row.rejection_reason}
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
    </div>
    </PageLoadingGate>
  );
}
