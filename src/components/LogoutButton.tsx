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
        d="M10 7V6a2 2 0 0 1 2-2h7a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-7a2 2 0 0 1-2-2v-1"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M15 12H3m0 0 3.5-3.5M3 12l3.5 3.5"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function LogoutButton({ className, iconOnly = false }: Props) {
  return (
    <Button
      variant="danger"
      size="sm"
      onClick={() => logoutAndRedirect("/login")}
      className={cn(iconOnly && "h-10 w-10 px-0", className)}
      aria-label="تسجيل الخروج"
      title="تسجيل الخروج"
    >
      {iconOnly ? <LogoutIcon /> : "تسجيل الخروج"}
    </Button>
  );
}
