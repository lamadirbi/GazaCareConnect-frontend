"use client";

import { useId, useRef } from "react";

type Props = {
  accept?: string;
  multiple?: boolean;
  onPick: (files: File[]) => void;
  hint?: string | null;
  buttonLabel?: string;
  className?: string;
};

/** منتقي ملفات بعربية واضحة بدل زر المتصفح الإنجليزي (Choose Files). */
export function LocalFilePicker({
  accept = "image/*,.pdf",
  multiple = true,
  onPick,
  hint = null,
  buttonLabel = "اختيار ملفات",
  className = "",
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const inputId = useId();

  return (
    <div className={`gc-file-picker ${className}`.trim()}>
      <input
        id={inputId}
        ref={inputRef}
        type="file"
        multiple={multiple}
        accept={accept}
        className="sr-only"
        onChange={(e) => {
          const picked = Array.from(e.target.files ?? []);
          e.target.value = "";
          if (picked.length) onPick(picked);
        }}
      />
      <button
        type="button"
        className="gc-file-picker-btn"
        onClick={() => inputRef.current?.click()}
      >
        {buttonLabel}
      </button>
      {hint ? <p className="gc-file-picker-hint">{hint}</p> : null}
    </div>
  );
}
