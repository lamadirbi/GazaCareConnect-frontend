"use client";

import Link from "next/link";
import { Suspense, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { BrandLogo } from "@/components/BrandLogo";
import { Card, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { AppLoadingScreen } from "@/components/AppLoadingScreen";
import { resetPassword } from "@/lib/password";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const initialEmail = searchParams.get("email") ?? "";
  const initialToken = searchParams.get("token") ?? "";

  const [email, setEmail] = useState(initialEmail);
  const [token, setToken] = useState(initialToken);
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const passwordHint = useMemo(() => {
    if (!password) return null;
    if (password.length < 8) return "كلمة المرور يجب أن تكون 8 أحرف على الأقل.";
    if (passwordConfirmation && password !== passwordConfirmation) {
      return "تأكيد كلمة المرور غير متطابق.";
    }
    return null;
  }, [password, passwordConfirmation]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 8) {
      setError("كلمة المرور يجب أن تكون 8 أحرف على الأقل.");
      return;
    }
    if (password !== passwordConfirmation) {
      setError("تأكيد كلمة المرور غير متطابق.");
      return;
    }

    setLoading(true);
    setError(null);

    const res = await resetPassword({
      email: email.trim().toLowerCase(),
      token: token.trim(),
      password,
      password_confirmation: passwordConfirmation,
    });

    setLoading(false);
    if (!res.ok) {
      setError(res.message);
      return;
    }
    setDone(true);
  }

  return (
    <div className="relative flex flex-1 items-start justify-center bg-zinc-50 px-4 py-6 sm:items-center sm:py-10 dark:bg-black">
      <main className="w-full max-w-md py-2">
        <div className="mb-4 flex items-center justify-between gap-2">
          <BrandLogo href="/" size="lg" showTitle showTagline className="min-w-0" />
          <Link
            href="/login"
            className="shrink-0 rounded-lg px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-zinc-900"
          >
            تسجيل الدخول
          </Link>
        </div>

        <Card>
          <CardBody className="p-5 sm:p-6">
            <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
              إعادة تعيين كلمة المرور
            </h1>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              أدخلي الرمز من البريد وكلمة المرور الجديدة.
            </p>

            {done ? (
              <div className="mt-6 grid gap-4">
                <Alert variant="success">تمت إعادة تعيين كلمة المرور بنجاح.</Alert>
                <Link href="/login">
                  <Button className="w-full">تسجيل الدخول</Button>
                </Link>
              </div>
            ) : (
              <form onSubmit={onSubmit} className="mt-6 grid gap-4">
                <label className="grid gap-1">
                  <span className="text-sm font-medium">البريد الإلكتروني</span>
                  <input
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    type="email"
                    required
                    className="h-11 rounded-xl border border-(--border) bg-(--surface) px-3 text-sm outline-none focus:ring-2 focus:ring-(--ring)"
                  />
                </label>

                <label className="grid gap-1">
                  <span className="text-sm font-medium">رمز إعادة التعيين</span>
                  <input
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
                    type="text"
                    required
                    dir="ltr"
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
                  <span className="text-sm font-medium">تأكيد كلمة المرور</span>
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

                <Button type="submit" disabled={loading} className="w-full">
                  {loading ? "جاري الحفظ..." : "حفظ كلمة المرور"}
                </Button>
              </form>
            )}
          </CardBody>
        </Card>
      </main>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<AppLoadingScreen message="جاري تحميل الصفحة..." />}>
      <ResetPasswordForm />
    </Suspense>
  );
}
