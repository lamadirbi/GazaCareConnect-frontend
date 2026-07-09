"use client";

import { logoutAndRedirect } from "@/lib/auth";
import { Button } from "@/components/ui/Button";

export function LogoutButton({ className }: { className?: string }) {
  return (
    <Button
      variant="danger"
      size="sm"
      onClick={() => logoutAndRedirect("/login")}
      className={className}
    >
      تسجيل الخروج
    </Button>
  );
}
