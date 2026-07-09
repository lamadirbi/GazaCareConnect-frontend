"use client";

import { useEffect, useMemo, useState } from "react";
import { downloadWithAuth } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { triggerBlobDownload } from "@/components/BlobDownload";

export type MedicalFileLite = {
  id: number;
  original_name: string;
  file_kind?: string | null;
  mime_type?: string | null;
  size_bytes?: number | null;
};

type PreviewKind = "image" | "pdf";

type Props = {
  files: MedicalFileLite[];
  /** عرض معاينة للصور فقط أو للصور + PDF */
  preview: "images" | "images_and_pdfs";
  /** عند true: لا نعرض اسم الملف للصور (نعرض المعاينة فقط + زر تنزيل) */
  hideImageName?: boolean;
  /** معاملات إضافية للتنزيل (مثل consultation_id لحالات خاصة) */
  downloadQuery?: Record<string, string>;
  onError?: (message: string) => void;
};

function isImageFile(f: MedicalFileLite) {
  const mime = (f.mime_type ?? "").toLowerCase();
  if (mime.startsWith("image/")) return true;
  return /\.(png|jpe?g|gif|webp|avif|bmp|svg)(\?|$)/i.test(f.original_name);
}

function isPdfFile(f: MedicalFileLite) {
  const mime = (f.mime_type ?? "").toLowerCase();
  if (mime === "application/pdf" || mime.includes("pdf")) return true;
  return f.original_name.toLowerCase().endsWith(".pdf");
}

function fileTypeLabel(f: MedicalFileLite) {
  if (isImageFile(f)) return "صورة";
  if (isPdfFile(f)) return "ملف PDF";
  return "مرفق";
}

function formatBytes(bytes: number | null | undefined) {
  if (!bytes) return "";
  const units = ["B", "KB", "MB", "GB"];
  let b = bytes;
  let i = 0;
  while (b >= 1024 && i < units.length - 1) {
    b /= 1024;
    i++;
  }
  return `${b.toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
}

export function MedicalFilesList({
  files,
  preview,
  hideImageName = false,
  downloadQuery,
  onError,
}: Props) {
  const [previews, setPreviews] = useState<Record<number, { url: string; kind: PreviewKind }>>(
    {},
  );

  const previewIdsKey = useMemo(() => {
    const ids = files
      .filter((f) => {
        if (preview === "images") return isImageFile(f);
        return isImageFile(f) || isPdfFile(f);
      })
      .map((f) => f.id)
      .sort((a, b) => a - b);
    return ids.join(",");
  }, [files, preview]);

  useEffect(() => {
    const urls: string[] = [];
    let cancelled = false;

    if (!files.length || !previewIdsKey) {
      setPreviews((prev) => {
        Object.values(prev).forEach((p) => URL.revokeObjectURL(p.url));
        return {};
      });
      return () => {
        urls.forEach((u) => URL.revokeObjectURL(u));
      };
    }

    (async () => {
      const next: Record<number, { url: string; kind: PreviewKind }> = {};
      for (const f of files) {
        if (cancelled) break;
        const showImg = isImageFile(f);
        const showPdf = preview === "images_and_pdfs" && isPdfFile(f);
        if (!showImg && !showPdf) continue;

        const res = await downloadWithAuth(`/medical-files/${f.id}/download`, downloadQuery);
        if (cancelled) break;
        if (!res.ok) continue;

        const url = URL.createObjectURL(res.data.blob);
        urls.push(url);
        next[f.id] = { url, kind: showPdf ? "pdf" : "image" };
      }
      if (!cancelled) {
        setPreviews((prev) => {
          Object.values(prev).forEach((p) => URL.revokeObjectURL(p.url));
          return next;
        });
      } else {
        urls.forEach((u) => URL.revokeObjectURL(u));
      }
    })();

    return () => {
      cancelled = true;
      urls.forEach((u) => URL.revokeObjectURL(u));
    };
  }, [previewIdsKey]);

  async function download(fileId: number, fallbackName: string) {
    const res = await downloadWithAuth(`/medical-files/${fileId}/download`, downloadQuery);
    if (!res.ok) {
      onError?.(res.message);
      return;
    }
    triggerBlobDownload(res.data.blob, res.data.filename ?? fallbackName);
  }

  return (
    <div className="grid gap-3">
      {files.map((f) => {
        const prev = previews[f.id];
        const isImg = isImageFile(f);
        const loadingPreview = !prev && (isImg || (preview === "images_and_pdfs" && isPdfFile(f)));

        return (
          <div
            key={f.id}
            className="overflow-hidden rounded-2xl border border-(--border) bg-(--surface-2)"
          >
            {prev?.kind === "image" ? (
              <div className="border-b border-(--border) bg-(--surface) p-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={prev.url}
                  alt=""
                  className="mx-auto max-h-72 w-full rounded-lg object-contain"
                />
              </div>
            ) : null}
            {prev?.kind === "pdf" ? (
              <div className="h-72 border-b border-(--border) bg-(--surface)">
                <iframe title="معاينة ملف PDF" src={prev.url} className="h-full w-full border-0" />
              </div>
            ) : null}

            <div className="flex items-center justify-between gap-3 px-4 py-3.5">
              <div className="flex min-w-0 items-center gap-3">
                <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-(--gc-accent-soft) text-[11px] font-bold text-[#0b6e7a]">
                  {isImg ? "صورة" : isPdfFile(f) ? "PDF" : "ملف"}
                </span>
                <div className="min-w-0">
                  <div className="truncate text-sm font-semibold text-foreground">
                    {f.original_name}
                  </div>
                  <div className="mt-0.5 text-xs text-(--muted)">
                    {loadingPreview ? "جاري تحميل المعاينة..." : null}
                    {!loadingPreview && f.size_bytes ? (
                      <span dir="ltr">الحجم: {formatBytes(f.size_bytes)}</span>
                    ) : null}
                  </div>
                </div>
              </div>
              <Button
                onClick={() => download(f.id, f.original_name)}
                variant="secondary"
                size="sm"
                className="shrink-0"
              >
                تنزيل
              </Button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

