"use client";

import Link from "next/link";
import { useLang } from "@/lib/i18n";

type Props = {
  href?: string;
  size?: "sm" | "md" | "lg" | "xl";
  showTitle?: boolean;
  showTagline?: boolean;
  className?: string;
  withLink?: boolean;
};

const sizeClass = {
  sm: "h-7 w-auto",
  md: "h-9 w-auto",
  lg: "h-11 w-auto",
  xl: "h-16 w-auto",
} as const;

const titleClass = {
  sm: "text-sm font-bold text-foreground",
  md: "text-sm font-bold text-foreground",
  lg: "text-base font-extrabold tracking-tight text-foreground",
  xl: "text-lg font-extrabold tracking-tight text-foreground",
} as const;

const taglineClass = {
  sm: "text-xs text-(--muted)",
  md: "text-xs text-(--muted)",
  lg: "text-sm text-(--muted)",
  xl: "text-sm text-(--muted)",
} as const;

export function BrandLogo({
  href = "/",
  size = "md",
  showTitle = true,
  showTagline = false,
  className = "",
  withLink = true,
}: Props) {
  const { t } = useLang();

  const inner = (
    <>
      <img
        src="/logo.png"
        alt="GazaCare Connect"
        className={`shrink-0 ${sizeClass[size]}`}
      />
      {(showTitle || showTagline) && (
        <div className="min-w-0 text-start">
          {showTitle ? (
            <div className={titleClass[size]}>GazaCare Connect</div>
          ) : null}
          {showTagline ? (
            <div className={taglineClass[size]}>{t("brandTagline")}</div>
          ) : null}
        </div>
      )}
    </>
  );

  const wrap = `inline-flex items-center gap-2 ${className}`;

  if (withLink && href) {
    return (
      <Link href={href} className={wrap}>
        {inner}
      </Link>
    );
  }

  return <span className={wrap}>{inner}</span>;
}
