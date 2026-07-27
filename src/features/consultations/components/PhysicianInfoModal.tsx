"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { downloadWithAuth } from "@/lib/api";
import type { CertificateFileRef, PhysicianProfileData } from "@/features/consultations/types";

type Props = {
  open: boolean;
  onClose: () => void;
  consultationId: number;
  physicianName: string;
  profile: PhysicianProfileData | null;
};

function certificateFilesFromProfile(prof: PhysicianProfileData | null): CertificateFileRef[] {
  if (!prof) return [];
  const multi = prof.certificateFiles ?? prof.certificate_files ?? [];
  if (Array.isArray(multi) && multi.length > 0) return multi;
  const one = prof.certificateFile ?? prof.certificate_file;
  return one ? [one] : [];
}

type PreviewRow = { fileId: number; url: string; mime: string; name: string };

export function PhysicianInfoModal({ open, onClose, consultationId, physicianName, profile }: Props) {
  const certFiles = useMemo(() => certificateFilesFromProfile(profile), [profile]);
  const certKey = useMemo(() => certFiles.map((f) => f.id).join(","), [certFiles]);

  const [previews, setPreviews] = useState<PreviewRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const close = useCallback(() => {
    setPreviews((prev) => {
      prev.forEach((p) => URL.revokeObjectURL(p.url));
      return [];
    });
    setLoading(false);
    setErr(null);
    onClose();
  }, [onClose]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, close]);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    const blobUrls: string[] = [];
    setErr(null);
    setLoading(true);
    setPreviews((prev) => {
      prev.forEach((p) => URL.revokeObjectURL(p.url));
      return [];
    });

    (async () => {
      const rows: PreviewRow[] = [];
      for (const cf of certFiles) {
        if (cancelled) break;
        const res = await downloadWithAuth(`/medical-files/${cf.id}/download`, {
          consultation_id: String(consultationId),
        });
        if (cancelled) break;
        if (!res.ok) {
          setLoading(false);
          setErr(res.message || "تعذر تحميل بعض مرفقات الشهادة");
          return;
        }
        const mime =
          res.data.blob.type ||
          cf.mime_type ||
          (cf.original_name?.toLowerCase().endsWith(".pdf") ? "application/pdf" : "") ||
          "application/octet-stream";
        const url = URL.createObjectURL(res.data.blob);
        blobUrls.push(url);
        rows.push({ fileId: cf.id, url, mime, name: cf.original_name });
      }
      if (cancelled) {
        blobUrls.forEach((u) => URL.revokeObjectURL(u));
        return;
      }
      setLoading(false);
      setPreviews(rows);
    })();

    return () => {
      cancelled = true;
    };
  }, [open, consultationId, certKey]);

  if (!open) return null;

  const certCount = certFiles.length;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-4 backdrop-blur-sm sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="physician-modal-title"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) close();
      }}
    >
      <div
        className="flex max-h-[min(90vh,720px)] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-(--border) bg-(--surface) shadow-(--shadow)"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="flex shrink-0 items-center justify-between gap-3 border-b border-(--border) px-4 py-3">
          <h2
            id="physician-modal-title"
            className="text-sm font-semibold text-zinc-900"
          >
            معلومات الطبيب — {physicianName}
          </h2>
          <button
            type="button"
            onClick={close}
            className="rounded-lg p-1.5 text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-800"
            aria-label="إغلاق"
          >
            ×
          </button>
        </div>

        <div className="min-h-0 overflow-y-auto p-4 text-sm text-zinc-800">
          {profile?.specialty?.trim() ? (
            <div>
              <span className="font-semibold text-zinc-900">التخصص:</span>{" "}
              {profile.specialty}
            </div>
          ) : (
            <div className="text-zinc-500">لا يوجد تخصص مسجّل.</div>
          )}

          {profile?.certificate?.trim() ? (
            <div className="mt-3 whitespace-pre-wrap">
              <span className="font-semibold text-zinc-900">الشهادة / المؤهل:</span>{" "}
              {profile.certificate}
            </div>
          ) : null}

          <div className="mt-4 border-t border-(--border) pt-4">
            <div className="text-xs font-semibold text-zinc-600">
              مرفقات الشهادة{certCount > 1 ? ` (${certCount})` : ""}
            </div>
            {loading ? <div className="mt-2 text-xs text-zinc-500">جاري تحميل المعاينات...</div> : null}
            {err ? <div className="mt-2 text-xs text-red-600">{err}</div> : null}

            {!loading && !err && previews.length > 0 ? (
              <div className="mt-3 grid gap-4">
                {previews.map((row) => (
                  <div key={row.fileId}>
                    {row.mime.startsWith("image/") ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={row.url}
                        alt=""
                        className="max-h-72 w-full rounded-xl border border-(--border) object-contain bg-zinc-100/50"
                      />
                    ) : row.mime === "application/pdf" || row.mime.includes("pdf") ? (
                      <iframe
                        title="معاينة الشهادة"
                        src={row.url}
                        className="h-72 w-full rounded-xl border border-(--border) bg-white"
                      />
                    ) : (
                      <a
                        href={row.url}
                        download={row.name}
                        className="inline-flex text-xs font-medium text-emerald-700 underline"
                      >
                        تنزيل — {row.name}
                      </a>
                    )}
                  </div>
                ))}
              </div>
            ) : null}

            {certCount === 0 && !loading ? (
              <div className="mt-2 text-xs text-zinc-500">
                لا يوجد مرفق مسجّل لهذه الشهادة.
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}

