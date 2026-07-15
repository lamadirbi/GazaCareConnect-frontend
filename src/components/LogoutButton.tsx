"use client";

import { logoutAndRedirect } from "@/lib/auth";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";

type Props = {
  className?: string;
  /** أيقونة فقط — للشاشات الصغيرة */
  iconOnly?: boolean;
};

function LogoutIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
    >
      <path
        d="M9.5 7.25V6.4c0-1.05.85-1.9 1.9-1.9h6.2c1.05 0 1.9.85 1.9 1.9v11.2c0 1.05-.85 1.9-1.9 1.9h-6.2c-1.05 0-1.9-.85-1.9-1.9v-.85"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M14.25 12H3.75"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
      <path
        d="M6.4 8.85 3.75 12l2.65 3.15"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function LogoutButton({ className, iconOnly = false }: Props) {
  if (iconOnly) {
    return (
      <button
        type="button"
        onClick={() => logoutAndRedirect("/login")}
        className={cn("gc-logout-icon-btn", className)}
        aria-label="تسجيل الخروج"
        title="تسجيل الخروج"
      >
        <LogoutIcon />
      </button>
    );
  }

  return (
    <Button
      variant="danger"
      size="sm"
      onClick={() => logoutAndRedirect("/login")}
      className={className}
      aria-label="تسجيل الخروج"
      title="تسجيل الخروج"
    >
      تسجيل الخروج
    </Button>
  );
}
