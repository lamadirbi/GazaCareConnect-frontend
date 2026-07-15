"use client";

import { useMemo, useState } from "react";
import { useRequireAuth, logoutAndRedirect, routeForRole } from "@/lib/auth";
import { changePassword } from "@/lib/password";
import { AppHeader } from "@/components/AppHeader";
import { PageLoadingGate } from "@/components/PageLoadingGate";
import { Card, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";

export default function AccountPasswordPage() {
  const { user, loading: authLoading } = useRequireAuth();
  const [currentPassword, setCurrentPassword] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [okMsg, setOkMsg] = useState<string | null>(null);

  const passwordHint = useMemo(() => {
    if (!password) return null;
    if (password.length < 8) return "كلمة المرور الجديدة يجب أن تكون 8 أحرف على الأقل.";
    if (passwordConfirmation && password !== passwordConfirmation) {
      return "تأكيد كلمة المرور غير متطابق.";
    }
    return null;
  }, [password, passwordConfirmation]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 8) {
      setError("كلمة المرور الجديدة يجب أن تكون 8 أحرف على الأقل.");
      return;
    }
    if (password !== passwordConfirmation) {
      setError("تأكيد كلمة المرور غير متطابق.");
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
    <PageLoadingGate loading={authLoading} message="جاري التحميل...">
      <div className="min-h-screen bg-transparent">
        <AppHeader
          title="كلمة المرور"
          backHref={user ? routeForRole(user.role) : "/dashboard"}
          userRole={user?.role}
        />

        <main className="mx-auto w-full max-w-md px-4 py-8">
          <Card>
            <CardBody className="p-5 sm:p-6">
              <h1 className="text-lg font-bold text-foreground">تغيير كلمة المرور</h1>
              <p className="mt-1 text-sm text-(--muted)">
                بعد التغيير ستحتاجين لتسجيل الدخول من جديد.
              </p>

              <form onSubmit={onSubmit} className="mt-6 grid gap-4">
                <label className="grid gap-1">
                  <span className="text-sm font-medium">كلمة المرور الحالية</span>
                  <input
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    type="password"
                    autoComplete="current-password"
                    required
                    className="h-11 rounded-xl border border-(--border) bg-(--surface) px-3 text-sm outline-none focus:ring-2 focus:ring-(--ring)"
                  />
                </label>

                <label className="grid gap-1">
                  <span className="text-sm font-medium">كلمة المرور الجديدة</span>
                  <input
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    type="password"
                    autoComplete="new-password"
                    required
                    minLength={8}
                    className="h-11 rounded-xl border border-(--border) bg-(--surface) px-3 text-sm outline-none focus:ring-2 focus:ring-(--ring)"
                  />
                </label>

                <label className="grid gap-1">
                  <span className="text-sm font-medium">تأكيد كلمة المرور الجديدة</span>
                  <input
                    value={passwordConfirmation}
                    onChange={(e) => setPasswordConfirmation(e.target.value)}
                    type="password"
                    autoComplete="new-password"
                    required
                    minLength={8}
                    className="h-11 rounded-xl border border-(--border) bg-(--surface) px-3 text-sm outline-none focus:ring-2 focus:ring-(--ring)"
                  />
                </label>

                {passwordHint ? (
                  <p className="text-xs text-amber-700 dark:text-amber-300">{passwordHint}</p>
                ) : null}
                {error ? <Alert variant="error">{error}</Alert> : null}
                {okMsg ? <Alert variant="success">{okMsg}</Alert> : null}

                <Button type="submit" disabled={saving} className="w-full">
                  {saving ? "جاري الحفظ..." : "حفظ كلمة المرور"}
                </Button>
              </form>
            </CardBody>
          </Card>
        </main>
      </div>
    </PageLoadingGate>
  );
}
