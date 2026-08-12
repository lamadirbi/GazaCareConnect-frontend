"use client";

import Link from "next/link";
import { BrandLogo } from "@/components/BrandLogo";
import { LandingHeader } from "@/components/LandingHeader";
import { useLang } from "@/lib/i18n";
import type { PlatformStats } from "@/lib/platformStats";

function formatNumber(n: number, lang: string) {
  return new Intl.NumberFormat(lang === "ar" ? "ar" : "en").format(n);
}

export function LandingContent({ platformStats }: { platformStats: PlatformStats }) {
  const { t, lang } = useLang();

  const steps = [
    { n: "1", title: t("step1Title"), desc: t("step1Desc") },
    { n: "2", title: t("step2Title"), desc: t("step2Desc") },
    { n: "3", title: t("step3Title"), desc: t("step3Desc") },
    { n: "4", title: t("step4Title"), desc: t("step4Desc") },
  ];

  const services = [
    { title: t("service1Title"), desc: t("service1Desc") },
    { title: t("service2Title"), desc: t("service2Desc") },
    { title: t("service3Title"), desc: t("service3Desc") },
    { title: t("service4Title"), desc: t("service4Desc") },
    { title: t("service5Title"), desc: t("service5Desc") },
    { title: t("service6Title"), desc: t("service6Desc") },
  ];

  const faqs = [
    { q: t("faq1Q"), a: t("faq1A") },
    { q: t("faq2Q"), a: t("faq2A") },
    { q: t("faq3Q"), a: t("faq3A") },
    { q: t("faq4Q"), a: t("faq4A") },
  ];

  const stats = [
    { value: formatNumber(platformStats.completed_consultations, lang), label: t("statCompletedConsultations") },
    { value: formatNumber(platformStats.verified_physicians, lang), label: t("statVerifiedPhysicians") },
    { value: formatNumber(platformStats.registered_patients, lang), label: t("statRegisteredPatients") },
  ];

  const attachments =
    lang === "ar"
      ? [
          { name: "تحاليل-دم.pdf", size: "128 KB" },
          { name: "أشعة-صدر.jpg", size: "512 KB" },
        ]
      : [
          { name: "blood-tests.pdf", size: "128 KB" },
          { name: "chest-xray.jpg", size: "512 KB" },
        ];

  return (
    <div className="min-h-screen bg-transparent font-sans">
      <LandingHeader />

      <main>
        {/* Hero */}
        <section className="relative overflow-hidden px-4 pb-16 pt-10 sm:pt-14">
          <div className="gc-hero-glow pointer-events-none absolute inset-0" aria-hidden />

          <div className="relative mx-auto max-w-6xl">
            <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-12">
              <div className="text-center lg:text-start">
                <div className="gc-hero-badge mx-auto lg:mx-0">
                  <span className="gc-hero-badge-dot" aria-hidden />
                  {t("heroBadge")}
                </div>

                <h1 className="mt-5 text-3xl font-extrabold leading-tight tracking-tight text-foreground sm:text-4xl lg:text-[2.6rem]">
                  {t("heroTitle")}
                  <span className="mt-2 block bg-gradient-to-l from-(--gc-accent) to-[#0b6e7a] bg-clip-text text-transparent">
                    {t("heroTitleHighlight")}
                  </span>
                </h1>

                <p className="mx-auto mt-5 max-w-lg text-base leading-8 text-(--muted) lg:mx-0">
                  {t("heroDesc")}
                </p>

                <div className="mt-8 flex flex-wrap items-center justify-center gap-3 lg:justify-start">
                  <Link href="/register" className="gc-btn gc-btn-primary min-w-[140px]">
                    {t("heroCta1")}
                  </Link>
                  <Link href="/login" className="gc-btn gc-btn-secondary min-w-[140px]">
                    {t("heroCta2")}
                  </Link>
                </div>

                <div className="mt-10 grid grid-cols-3 gap-3">
                  {stats.map((s) => (
                    <div key={s.label} className="gc-stat-card">
                      <div className="text-xl font-extrabold text-(--gc-accent) sm:text-2xl">
                        {s.value}
                      </div>
                      <div className="mt-0.5 text-xs text-(--muted)">{s.label}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="relative mx-auto w-full max-w-md lg:max-w-none">
                <div className="gc-hero-card-float gc-glass rounded-3xl p-5 sm:p-6">
                  <div className="flex items-center justify-between gap-3 border-b border-(--border) pb-4">
                    <div>
                      <div className="text-sm font-bold text-foreground">{t("cardConsultationTitle")}</div>
                      <div className="mt-0.5 text-xs text-(--muted)">{t("cardConsultationDate")}</div>
                    </div>
                    <span className="gc-status-pill gc-status-pill-done">{t("cardConsultationStatus")}</span>
                  </div>

                  <div className="mt-4 space-y-3">
                    <div className="rounded-2xl border border-(--border) bg-(--surface-2) p-4">
                      <div className="gc-section-label">{t("cardPatientComplaint")}</div>
                      <p className="mt-2 text-sm leading-6 text-foreground">
                        {t("cardPatientComplaintText")}
                      </p>
                    </div>

                    <div className="rounded-2xl border border-(--border) bg-(--surface-2) p-4">
                      <div className="gc-section-label">{t("cardAttachments")}</div>
                      <div className="mt-3 space-y-2">
                        {attachments.map((f) => (
                          <div
                            key={f.name}
                            className="flex items-center justify-between rounded-xl border border-(--border) bg-(--surface) px-3 py-2 text-xs"
                          >
                            <span className="font-medium">{f.name}</span>
                            <span className="text-(--muted)">{f.size}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="rounded-2xl border border-[rgba(34,197,94,0.3)] bg-[rgba(34,197,94,0.08)] p-4">
                      <div className="gc-section-label text-emerald-800">
                        {t("cardDoctorReply")}
                      </div>
                      <p className="mt-2 text-sm leading-6 text-emerald-900/90">
                        {t("cardDoctorReplyText")}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="gc-hero-card-shadow pointer-events-none absolute -inset-4 -z-10 rounded-[2rem]" aria-hidden />
              </div>
            </div>
          </div>
        </section>

        {/* How it works */}
        <section id="how" className="gc-steps-strip scroll-mt-20">
          <div className="mx-auto max-w-6xl px-4 py-14">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-foreground">{t("howTitle")}</h2>
              <p className="mt-2 text-sm text-(--muted)">{t("howSubtitle")}</p>
              <div className="mx-auto mt-5 max-w-md gc-step-line" />
            </div>

            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {steps.map((s) => (
                <div key={s.n} className="gc-step-card">
                  <div className="gc-step-dot">{s.n}</div>
                  <div className="mt-4 text-sm font-bold text-foreground">{s.title}</div>
                  <p className="mt-2 text-xs leading-6 text-(--muted)">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Services */}
        <section id="services" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-14">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-foreground">{t("servicesTitle")}</h2>
            <p className="mt-2 text-sm text-(--muted)">{t("servicesSubtitle")}</p>
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((x) => (
              <div key={x.title} className="gc-service-card gc-glass rounded-2xl p-5">
                <div className="gc-service-accent" aria-hidden />
                <div className="text-sm font-bold text-foreground">{x.title}</div>
                <p className="mt-2 text-sm leading-6 text-(--muted)">{x.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="mx-auto max-w-6xl px-4 pb-14">
          <div className="gc-cta-banner relative overflow-hidden rounded-3xl p-8 text-center sm:p-12">
            <div className="gc-cta-glow pointer-events-none absolute inset-0" aria-hidden />
            <div className="relative">
              <h2 className="text-xl font-bold text-white sm:text-2xl">{t("ctaTitle")}</h2>
              <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-white/80">
                {t("ctaSubtitle")}
              </p>
              <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                <Link
                  href="/register"
                  className="inline-flex h-11 items-center justify-center rounded-xl bg-white px-6 text-sm font-bold text-[#0b3d47] transition hover:bg-white/90"
                >
                  {t("ctaBtn")}
                </Link>
                <Link
                  href="/login"
                  className="inline-flex h-11 items-center justify-center rounded-xl border border-white/30 px-6 text-sm font-bold text-white transition hover:bg-white/10"
                >
                  {t("loginFull")}
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="mx-auto max-w-6xl scroll-mt-20 px-4 pb-16">
          <h2 className="text-center text-2xl font-bold">{t("faqTitle")}</h2>
          <p className="mt-2 text-center text-sm text-(--muted)">{t("faqSubtitle")}</p>
          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            {faqs.map((x) => (
              <details key={x.q} className="gc-faq-item gc-glass rounded-2xl p-5">
                <summary className="cursor-pointer text-sm font-semibold text-foreground">
                  {x.q}
                </summary>
                <p className="mt-3 text-sm leading-7 text-(--muted)">{x.a}</p>
              </details>
            ))}
          </div>
        </section>
      </main>

      <footer className="border-t border-(--border) bg-[color-mix(in_srgb,var(--surface-2)_88%,transparent)] py-8 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 sm:flex-row sm:items-center sm:justify-between">
          <BrandLogo href="/" size="md" showTitle showTagline />
          <p className="text-xs text-(--muted) sm:text-sm">
            &copy; {new Date().getFullYear()} GazaCare Connect
          </p>
        </div>
      </footer>
    </div>
  );
}
