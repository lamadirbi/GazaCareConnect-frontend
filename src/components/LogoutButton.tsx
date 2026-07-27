"use client";

import { logoutAndRedirect } from "@/lib/auth";
import { Button } from "@/components/ui/Button";
import { FaIcon } from "@/components/FaIcon";
import { cn } from "@/lib/cn";

type Props = {
  className?: string;
  /** أيقونة فقط — للشاشات الصغيرة */
  iconOnly?: boolean;
};

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
        <FaIcon icon="right-from-bracket" className="text-base" />
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
