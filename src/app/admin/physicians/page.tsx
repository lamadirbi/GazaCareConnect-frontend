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
import { useLang } from "@/lib/i18n";

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

function formatDate(value: string | null | undefined, locale: string) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  try {
    return new Intl.DateTimeFormat(locale === "ar" ? "ar-EG" : "en-US", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(d);
  } catch {
    return d.toLocaleString(locale === "ar" ? "ar" : "en");
  }
}

function certificateFilesOf(row: PhysicianProfileRow): CertificateFile[] {
  const files = row.certificate_files ?? row.certificateFiles ?? [];
  return Array.isArray(files) ? files : [];
}

export default function AdminPhysiciansPage() {
  const { t, lang } = useLang();
  const { user, loading: authLoading } = useRequireAuth({ allowedRoles: ["admin"] });
  const [rows, setRows] = useState<PhysicianProfileRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [initialLoadDone, setInitialLoadDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [downloadingId, setDownloadingId] = useState<number | null>(null);
  const [statusFilter, setStatusFilter] = useState("pending");
  const [rejectTarget, setRejectTarget] = useState<{ id: number; name: string } | null>(null);

  const statusLabels: Record<string, string> = {
    pending: t("adminStatusPending"),
    approved: t("adminStatusApproved"),
    rejected: t("adminStatusRejected"),
  };

  function fileKindLabel(kind?: string | null, mime?: string | null) {
    if (kind === "pdf" || mime?.includes("pdf")) return "PDF";
    if (kind === "image" || mime?.startsWith("image/")) return t("fileKindImage");
    return t("fileKindFile");
  }

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
    <PageLoadingGate loading={authLoading || !initialLoadDone} message={t("adminPhysiciansLoading")}>
    <div className="min-h-screen bg-transparent">
      <AppHeader title={t("adminPhysiciansTitle")} backHref="/admin/dashboard" userRole={user?.role} />

      <main className="mx-auto w-full max-w-5xl px-4 py-8">
        <Card>
          <CardBody className="p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h1 className="text-lg font-semibold text-zinc-900">{t("adminReviewPhysiciansTitle")}</h1>
                <p className="mt-1 text-sm text-zinc-600">{t("adminReviewPhysiciansDesc")}</p>
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="rounded-xl border border-(--border) bg-(--surface) px-3 py-2 text-sm"
              >
                <option value="pending">{t("adminStatusPending")}</option>
                <option value="approved">{t("adminStatusApproved")}</option>
                <option value="rejected">{t("adminStatusRejected")}</option>
                <option value="all">{t("adminStatusAll")}</option>
              </select>
            </div>

            {error ? <Alert variant="error" className="mt-4">{error}</Alert> : null}

            {loading ? (
              <p className="mt-6 text-sm text-zinc-500">{t("adminUpdatingList")}</p>
            ) : rows.length === 0 ? (
              <p className="mt-6 text-sm text-zinc-500">{t("adminNoRequests")}</p>
            ) : (
              <div className="mt-6 grid gap-5">
                {rows.map((row) => {
                  const files = certificateFilesOf(row);
                  const status = row.verification_status;
                  const physicianName = row.user?.name ?? t("adminPhysicianDefault");

                  return (
                    <Card key={row.id} className="overflow-hidden">
                      <CardBody className="p-0">
                        <div className="flex flex-col gap-4 border-b border-(--border) bg-(--surface-2) p-5 sm:flex-row sm:items-start sm:justify-between">
                          <div className="flex min-w-0 flex-1 gap-4">
                            <PhysicianPhotoBox
                              fileId={row.profile_photo_file_id}
                              alt={physicianName}
                              size="lg"
                            />
                            <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <h2 className="text-base font-semibold text-zinc-900">{physicianName}</h2>
                              <span
                                className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusStyles[status] ?? "bg-zinc-100 text-zinc-700"}`}
                              >
                                {statusLabels[status] ?? status}
                              </span>
                              {row.user?.is_disabled ? (
                                <span className="rounded-full bg-red-100 px-2.5 py-1 text-xs font-semibold text-red-700">
                                  {t("adminAccountDisabled")}
                                </span>
                              ) : null}
                            </div>
                            <div className="mt-2 grid gap-1 text-sm text-zinc-600">
                              <div className="min-w-0">
                                <span className="font-medium text-zinc-700">{t("adminEmail")}</span>{" "}
                                <span className="break-all" dir="ltr">{row.user?.email}</span>
                              </div>
                              {row.user?.phone ? (
                                <div>
                                  <span className="font-medium text-zinc-700">{t("adminPhone")}</span>{" "}
                                  <span dir="ltr">{row.user.phone}</span>
                                </div>
                              ) : null}
                              <div>
                                <span className="font-medium text-zinc-700">{t("adminRegisteredAt")}</span>{" "}
                                {formatDate(row.user?.created_at ?? row.created_at, lang)}
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
                                {busyId === row.id ? t("adminVerifying") : t("adminApprovePhysician")}
                              </Button>
                              <Button
                                size="sm"
                                variant="secondary"
                                disabled={busyId === row.id}
                                onClick={() => setRejectTarget({ id: row.id, name: physicianName })}
                              >
                                {t("adminRejectRequest")}
                              </Button>
                            </div>
                          ) : null}
                        </div>

                        <div className="grid gap-5 p-5 lg:grid-cols-2">
                          <section className="min-w-0 rounded-2xl border border-(--border) bg-(--surface) p-4">
                            <h3 className="text-sm font-semibold text-zinc-900">{t("adminQualificationSection")}</h3>
                            <dl className="mt-3 space-y-3 text-sm">
                              <div>
                                <dt className="text-xs font-medium text-zinc-500">{t("adminSpecialty")}</dt>
                                <dd className="mt-1 break-words font-medium text-zinc-900">{row.specialty}</dd>
                              </div>
                              <div>
                                <dt className="text-xs font-medium text-zinc-500">{t("adminCertificateDesc")}</dt>
                                <dd className="mt-1 whitespace-pre-wrap break-words leading-6 text-zinc-700">
                                  {row.certificate}
                                </dd>
                              </div>
                            </dl>
                          </section>

                          <section className="min-w-0 rounded-2xl border border-(--border) bg-(--surface) p-4">
                            <div className="flex items-center justify-between gap-2">
                              <h3 className="text-sm font-semibold text-zinc-900">{t("adminCertAttachments")}</h3>
                              <span className="shrink-0 text-xs text-zinc-500">
                                {files.length} {t("adminFilesCount")}
                              </span>
                            </div>

                            {files.length === 0 ? (
                              <p className="mt-3 text-sm text-zinc-500">{t("adminNoAttachments")}</p>
                            ) : (
                              <ul className="mt-3 grid gap-2">
                                {files.map((file) => (
                                  <li key={file.id} className="gc-admin-cert-file">
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
                                      {downloadingId === file.id ? "..." : t("adminDownload")}
                                    </Button>
                                  </li>
                                ))}
                              </ul>
                            )}
                          </section>
                        </div>

                        {row.rejection_reason ? (
                          <div className="border-t border-(--border) bg-red-50 px-4 py-3 text-sm leading-6 text-red-700 sm:px-5 sm:py-4">
                            <span className="font-semibold">{t("adminRejectionReason")}</span>{" "}
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
