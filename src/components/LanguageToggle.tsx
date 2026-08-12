"use client";

import { cn } from "@/lib/cn";
import { useLang } from "@/lib/i18n";

interface Props {
  className?: string;
}

export function LanguageToggle({ className = "" }: Props) {
  const { lang, toggleLang } = useLang();
  const label = lang === "ar" ? "EN" : "AR";

  return (
    <button
      type="button"
      onClick={toggleLang}
      className={cn(
        "gc-notif-bell-btn w-auto min-w-10 px-2 text-xs font-bold tracking-wide",
        className,
      )}
      title={lang === "ar" ? "Switch to English" : "التبديل للعربية"}
      aria-label={lang === "ar" ? "Switch to English" : "التبديل للعربية"}
    >
      {label}
    </button>
  );
}
