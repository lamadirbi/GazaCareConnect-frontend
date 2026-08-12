"use client";

import { useMemo, useState } from "react";
import { useRequireAuth, logoutAndRedirect, routeForRole } from "@/lib/auth";
import { changePassword } from "@/lib/password";
import { AppHeader } from "@/components/AppHeader";
import { PageLoadingGate } from "@/components/PageLoadingGate";
import { Card, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { useLang } from "@/lib/i18n";

export default function AccountPasswordPage() {
  const { t } = useLang();
  const { user, loading: authLoading } = useRequireAuth();
  const [currentPassword, setCurrentPassword] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [okMsg, setOkMsg] = useState<string | null>(null);

  const passwordHint = useMemo(() => {
    if (!password) return null;
    if (password.length < 8) return t("passwordNewTooShort");
    if (passwordConfirmation && password !== passwordConfirmation) {
      return t("passwordConfirmMismatch");
    }
    return null;
  }, [password, passwordConfirmation, t]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 8) {
      setError(t("passwordNewTooShort"));
      return;
    }
    if (password !== passwordConfirmation) {
      setError(t("passwordConfirmMismatch"));
      return;
    }

    setSaving(true);
    setError(null);
    setOkMsg(null);

    const res = await changePassword({
      current_password: currentPassword,
      password,
      password_confirmation: passwordConfirmation,
    });

    setSaving(false);
    if (!res.ok) {
      setError(res.message);
      return;
    }

    setOkMsg(res.data.message);
    setTimeout(() => logoutAndRedirect("/login"), 1200);
  }

  return (
    <PageLoadingGate loading={authLoading} message={t("loading")}>
      <div className="min-h-screen bg-transparent">
        <AppHeader
          title={t("navPassword")}
          backHref={user ? routeForRole(user.role) : "/dashboard"}
          userRole={user?.role}
        />

        <main className="mx-auto w-full max-w-md px-4 py-8">
          <Card>
            <CardBody className="p-5 sm:p-6">
              <h1 className="text-lg font-bold text-foreground">{t("changePasswordTitle")}</h1>
              <p className="mt-1 text-sm text-(--muted)">{t("changePasswordSubtitle")}</p>

              <form onSubmit={onSubmit} className="mt-6 grid gap-4">
                <label className="grid gap-1">
                  <span className="text-sm font-medium">{t("currentPasswordLabel")}</span>
                  <PasswordInput
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    autoComplete="current-password"
                    required
                  />
                </label>

                <label className="grid gap-1">
                  <span className="text-sm font-medium">{t("newPasswordLabel")}</span>
                  <PasswordInput
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="new-password"
                    required
                    minLength={8}
                  />
                </label>

                <label className="grid gap-1">
                  <span className="text-sm font-medium">{t("confirmNewPasswordLabel")}</span>
                  <PasswordInput
                    value={passwordConfirmation}
                    onChange={(e) => setPasswordConfirmation(e.target.value)}
                    autoComplete="new-password"
                    required
                    minLength={8}
                  />
                </label>

                {passwordHint ? (
                  <p className="text-xs text-amber-700">{passwordHint}</p>
                ) : null}
                {error ? <Alert variant="error">{error}</Alert> : null}
                {okMsg ? <Alert variant="success">{okMsg}</Alert> : null}

                <Button type="submit" disabled={saving} className="w-full">
                  {saving ? t("saving") : t("changePasswordSubmit")}
                </Button>
              </form>
            </CardBody>
          </Card>
        </main>
      </div>
    </PageLoadingGate>
  );
}
