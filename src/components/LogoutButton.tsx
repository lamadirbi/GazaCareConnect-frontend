"use client";

import { logoutAndRedirect } from "@/lib/auth";
import { Button } from "@/components/ui/Button";
import { FaIcon } from "@/components/FaIcon";
import { cn } from "@/lib/cn";
import { useLang } from "@/lib/i18n";

type Props = {
  className?: string;
  iconOnly?: boolean;
};

export function LogoutButton({ className, iconOnly = false }: Props) {
  const { t } = useLang();

  if (iconOnly) {
    return (
      <button
        type="button"
        onClick={() => logoutAndRedirect("/login")}
        className={cn("gc-logout-icon-btn", className)}
        aria-label={t("navLogout")}
        title={t("navLogout")}
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
      aria-label={t("navLogout")}
      title={t("navLogout")}
    >
      {t("navLogout")}
    </Button>
  );
}
