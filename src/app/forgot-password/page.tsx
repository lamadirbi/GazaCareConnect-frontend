"use client";

import Link from "next/link";
import { useState } from "react";
import { BrandLogo } from "@/components/BrandLogo";
import { LanguageToggle } from "@/components/LanguageToggle";
import { Card, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { requestPasswordReset } from "@/lib/password";
import { useLang } from "@/lib/i18n";

export default function ForgotPasswordPage() {
  const { t } = useLang();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [demoToken, setDemoToken] = useState<string | null>(null);
  const [demoUrl, setDemoUrl] = useState<string | null>(null);

  const MOCK_MODE = process.env.NEXT_PUBLIC_MOCK_API === "true";

  function getFormHint() {
    return MOCK_MODE ? t("forgotHintMock") : t("forgotHintDefault");
  }

  function getSuccessView() {
    if (MOCK_MODE) {
      if (demoToken || demoUrl) {
        return { variant: "success" as const, message: t("forgotSuccessMock"), showDemoDetails: true };
      }
      return { variant: "info" as const, message: t("forgotInfoMock"), showDemoDetails: false };
    }

    const isLocal =
      typeof window !== "undefined" &&
      (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1");

    return {
      variant: "success" as const,
      message: isLocal ? t("forgotSuccessLocal") : t("forgotSuccessEmail"),
      showDemoDetails: !!(demoToken || demoUrl),
      mailpitUrl: isLocal ? "http://127.0.0.1:8025" : null,
    };
  }

  const successView = sent ? getSuccessView() : null;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const normalized = email.trim().toLowerCase();
    setEmail(normalized);
    setLoading(true);
    setError(null);
    setDemoToken(null);
    setDemoUrl(null);

    const res = await requestPasswordReset(normalized);
    setLoading(false);

    if (!res.ok) {
      setError(res.message);
      return;
    }

    setSent(true);
    if (res.data.demo_reset_token) setDemoToken(res.data.demo_reset_token);
    if (res.data.demo_reset_url) setDemoUrl(res.data.demo_reset_url);
  }

  return (
    <div className="relative flex flex-1 items-start justify-center bg-zinc-50 px-4 py-6 sm:items-center sm:py-10">
      <main className="w-full max-w-md py-2">
        <div className="mb-4 flex items-center justify-between gap-2">
          <BrandLogo href="/" size="lg" showTitle showTagline className="min-w-0" />
          <div className="flex shrink-0 items-center gap-2">
            <LanguageToggle />
            <Link
              href="/login"
              className="shrink-0 rounded-lg px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-100"
            >
              {t("loginFull")}
            </Link>
          </div>
        </div>

        <Card>
          <CardBody className="p-5 sm:p-6">
            <h1 className="text-xl font-semibold text-zinc-900">{t("forgotPasswordTitle")}</h1>
            <p className="mt-1 text-sm text-zinc-600">{getFormHint()}</p>

            {sent && successView ? (
              <div className="mt-6 grid gap-4">
                <Alert variant={successView.variant}>{successView.message}</Alert>

                {"mailpitUrl" in successView && successView.mailpitUrl ? (
                  <a
                    href={successView.mailpitUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-center text-sm font-semibold text-(--gc-accent) underline"
                  >
                    {t("forgotPasswordOpenMailpit")}
                  </a>
                ) : null}

                {successView.showDemoDetails && (demoToken || demoUrl) ? (
                  <div className="rounded-2xl border border-(--border) bg-(--surface-2) p-4">
                    {demoToken ? (
                      <p className="text-sm">
                        <span className="font-semibold text-foreground">{t("forgotPasswordToken")}</span>{" "}
                        <span className="font-mono font-bold text-(--gc-accent)" dir="ltr">
                          {demoToken}
                        </span>
                      </p>
                    ) : null}
                    {demoUrl ? (
                      <p className={demoToken ? "mt-3" : ""}>
                        <Link
                          href={demoUrl}
                          className="inline-flex items-center gap-1 text-sm font-semibold text-(--gc-accent) underline"
                        >
                          {t("forgotPasswordOpenReset")}
                        </Link>
                      </p>
                    ) : null}
                  </div>
                ) : null}

                <Link href="/login" className="text-center text-sm font-medium text-(--gc-accent)">
                  {t("forgotPasswordBack")}
                </Link>
              </div>
            ) : (
              <form onSubmit={onSubmit} className="mt-6 grid gap-4">
                <label className="grid gap-1">
                  <span className="text-sm font-medium text-zinc-800">{t("emailLabel")}</span>
                  <input
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    type="email"
                    inputMode="email"
                    autoComplete="email"
                    required
                    placeholder={t("emailPlaceholder")}
                    className="h-11 rounded-xl border border-(--border) bg-(--surface) px-3 text-sm outline-none focus:ring-2 focus:ring-(--ring)"
                  />
                </label>

                {error ? <Alert variant="error">{error}</Alert> : null}

                <Button type="submit" disabled={loading} className="w-full">
                  {loading ? t("forgotPasswordSending") : t("forgotPasswordSubmit")}
                </Button>

                <Link
                  href="/login"
                  className="text-center text-sm text-zinc-600 hover:text-zinc-900"
                >
                  {t("forgotPasswordBack")}
                </Link>
              </form>
            )}
          </CardBody>
        </Card>
      </main>
    </div>
  );
}
