"use client";

import { useEffect, useState } from "react";
import { downloadWithAuth } from "@/lib/api";
import { FaIcon } from "@/components/FaIcon";

type Props = {
  fileId?: number | null;
  previewUrl?: string | null;
  alt: string;
  size?: "md" | "lg";
  className?: string;
};

export function PhysicianPhotoBox({
  fileId,
  previewUrl,
  alt,
  size = "lg",
  className,
}: Props) {
  const [url, setUrl] = useState<string | null>(previewUrl ?? null);

  useEffect(() => {
    if (previewUrl) {
      setUrl(previewUrl);
      return;
    }

    if (!fileId) {
      setUrl(null);
      return;
    }

    let cancelled = false;
    let objectUrl = "";
    downloadWithAuth(`/medical-files/${fileId}/download`).then((res) => {
      if (cancelled || !res.ok) return;
      objectUrl = URL.createObjectURL(res.data.blob);
      setUrl(objectUrl);
    });
    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [fileId, previewUrl]);

  const sizeClass = size === "lg" ? "h-24 w-24" : "h-16 w-16";

  return (
    <div
      className={`${sizeClass} flex shrink-0 items-center justify-center overflow-hidden rounded-2xl border-2 border-(--gc-accent) bg-(--surface-2) shadow-sm ${className ?? ""}`}
      title={alt}
    >
      {url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={url} alt={alt} className="h-full w-full object-cover" />
      ) : (
        <FaIcon icon="user-doctor" className="text-2xl text-(--muted)" />
      )}
    </div>
  );
}
