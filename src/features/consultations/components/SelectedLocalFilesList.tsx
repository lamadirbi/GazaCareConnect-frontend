"use client";

import { useEffect, useMemo, useState } from "react";

type Props = {
  files: File[];
  onRemoveAt: (index: number) => void;
};

function fileKey(f: File) {
  return `${f.name}:${f.size}:${f.lastModified}`;
}

function slotKey(index: number, f: File) {
  return `${index}__${fileKey(f)}`;
}

function isImageFile(f: File) {
  if (f.type?.toLowerCase().startsWith("image/")) return true;
  return /\.(png|jpe?g|gif|webp|avif|bmp|svg)(\?|$)/i.test(f.name);
}

function isPdfFile(f: File) {
  if (f.type?.toLowerCase() === "application/pdf") return true;
  return f.name.toLowerCase().endsWith(".pdf");
}

function formatBytes(bytes: number) {
  if (!bytes) return "";
  const units = ["B", "KB", "MB", "GB"];
  let b = bytes;
  let i = 0;
  while (b >= 1024 && i < units.length - 1) {
    b /= 1024;
    i += 1;
  }
  return `${b.toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
}

function fileKindLabel(f: File) {
  if (isImageFile(f)) return "صورة";
  if (isPdfFile(f)) return "PDF";
  return "مرفق";
}

/** يعرض ملفات تم اختيارها محلياً مع معاينة مصغّرة وترتيب مناسب للجوال */
export function SelectedLocalFilesList({ files, onRemoveAt }: Props) {
  const key = useMemo(() => files.map((f, i) => slotKey(i, f)).join(","), [files]);
  const [previewUrls, setPreviewUrls] = useState<Record<string, string>>({});

  useEffect(() => {
    const next: Record<string, string> = {};
    for (let i = 0; i < files.length; i++) {
      const f = files[i];
      if (!isImageFile(f)) continue;
      next[slotKey(i, f)] = URL.createObjectURL(f);
    }
    setPreviewUrls((prev) => {
      Object.values(prev).forEach((u) => URL.revokeObjectURL(u));
      return next;
    });
    return () => {
      Object.values(next).forEach((u) => URL.revokeObjectURL(u));
    };
  }, [key]);

  return (
    <ul className="grid gap-2.5">
      {files.map((f, idx) => {
        const slot = slotKey(idx, f);
        const previewUrl = isImageFile(f) ? previewUrls[slot] : null;
        const sizeLabel = formatBytes(f.size);

        return (
          <li
            key={slot}
            className="rounded-xl border border-(--border) bg-(--surface) p-3"
          >
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg border border-(--border) bg-(--surface-2)">
                {previewUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={previewUrl}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full flex-col items-center justify-center gap-0.5 px-1 text-center">
                    <span className="text-[10px] font-bold tracking-wide text-(--gc-accent)">
                      {isPdfFile(f) ? "PDF" : "FILE"}
                    </span>
                  </div>
                )}
              </div>

              <div className="min-w-0 flex-1">
                <div
                  className="truncate text-sm font-medium text-foreground"
                  title={f.name}
                  dir="auto"
                >
                  {f.name}
                </div>
                <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-(--muted)">
                  <span>{fileKindLabel(f)}</span>
                  {sizeLabel ? (
                    <>
                      <span aria-hidden>·</span>
                      <span dir="ltr">{sizeLabel}</span>
                    </>
                  ) : null}
                </div>
              </div>

              <button
                type="button"
                className="gc-file-remove-btn shrink-0"
                onClick={() => onRemoveAt(idx)}
                aria-label={`حذف ${f.name}`}
                title="حذف"
              >
                حذف
              </button>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
