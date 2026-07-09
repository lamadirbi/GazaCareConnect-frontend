import Link from "next/link";
import { BrandLogo } from "@/components/BrandLogo";
import { LandingHeader } from "@/components/LandingHeader";
import { buildStatCards, fetchPlatformStats } from "@/lib/platformStats";

const steps = [
  {
    n: "1",
    t: "إنشاء الحساب",
    d: "سجّل كمراجع أو طبيب وأكمل بياناتك الأساسية.",
  },
  {
    n: "2",
    t: "الملف الطبي",
    d: "أضف معلوماتك الصحية والأدوية والحساسية ليراجعها الطبيب.",
  },
  {
    n: "3",
    t: "إرسال الاستشارة",
    d: "اكتب سؤالك وأرفق التقارير أو الصور عند الحاجة.",
  },
  {
    n: "4",
    t: "استلام الرد",
    d: "يراجع الطبيب حالتك ويرسل توصياته داخل التطبيق.",
  },
];

const services = [
  {
    t: "استشارات تخصصية",
    d: "تواصل مع أطباء معتمدين في تخصصات مختلفة.",
  },
  {
    t: "ملف طبي واحد",
    d: "بياناتك الصحية محفوظة وجاهزة لكل استشارة.",
  },
  {
    t: "خصوصية البيانات",
    d: "الوصول محصور بك وللطبيب المعني والإدارة فقط.",
  },
  {
    t: "مناسب للموبايل",
    d: "واجهة عربية خفيفة حتى مع اتصال إنترنت ضعيف.",
  },
  {
    t: "طريقتان للإرسال",
    d: "إما لأول طبيب متاح، أو لطبيب تختاره أنت.",
  },
  {
    t: "أطباء موثّقون",
    d: "لا يستقبل أي طبيب حالات قبل مراجعة شهادته من الإدارة.",
  },
];

const faqs = [
  {
    q: "هل بياناتي الطبية آمنة؟",
    a: "نعم. يرى ملفك أنت والطبيب المعيّن والإدارة فقط.",
  },
  {
    q: "أرسل لطبيب معيّن أم لأول طبيب متاح؟",
    a: "الإرسال لأول طبيب متاح أسرع. الطبيب المعيّن مناسب إذا كنت تفضّل طبيباً بعينه أو تخصصاً محدداً.",
  },
  {
    q: "هل يمكن إرفاق تقارير وصور؟",
    a: "نعم، يمكنك إرفاق ملفات PDF أو صور مع كل استشارة.",
  },
  {
    q: "كم يستغرق الرد؟",
    a: "يعتمد على توفر الأطباء. يمكنك متابعة حالة استشارتك من لوحة التحكم.",
  },
];

export default async function Home() {
  const platformStats = await fetchPlatformStats();
  const stats = buildStatCards(platformStats);

  return (
    <div className="min-h-screen bg-transparent font-sans">
      <LandingHeader />

      <main>
        <section className="relative overflow-hidden px-4 pb-16 pt-10 sm:pt-14">
          <div className="gc-hero-glow pointer-events-none absolute inset-0" aria-hidden />

          <div className="relative mx-auto max-w-6xl">
            <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-12">
              <div className="text-center lg:text-start">
                <div className="gc-hero-badge mx-auto lg:mx-0">
                  <span className="gc-hero-badge-dot" aria-hidden />
                  استشارات طبية عن بُعد — غزة
                </div>

                <h1 className="mt-5 text-3xl font-extrabold leading-tight tracking-tight text-foreground sm:text-4xl lg:text-[2.6rem]">
                  رعاية طبية عن بُعد
                  <span className="mt-2 block bg-gradient-to-l from-(--gc-accent) to-[#0b6e7a] bg-clip-text text-transparent">
                    من قطاع غزة
                  </span>
                </h1>

                <p className="mx-auto mt-5 max-w-lg text-base leading-8 text-(--muted) lg:mx-0">
                  تسجّل، ترسل استشارتك، وتستلم رد الطبيب — ملف طبي ومرفقات في مكان واحد.
                </p>

                <div className="mt-8 flex flex-wrap items-center justify-center gap-3 lg:justify-start">
                  <Link href="/register" className="gc-btn gc-btn-primary min-w-[140px]">
                    سجّل الآن
                  </Link>
                  <Link href="/login" className="gc-btn gc-btn-secondary min-w-[140px]">
                    لدي حساب
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
                      <div className="text-sm font-bold text-foreground">نموذج استشارة</div>
                      <div className="mt-0.5 text-xs text-(--muted)">من السؤال إلى الرد</div>
                    </div>
                    <span className="gc-status-pill gc-status-pill-done">مكتملة</span>
                  </div>

                  <div className="mt-4 space-y-3">
                    <div className="rounded-2xl border border-(--border) bg-(--surface-2) p-4">
                      <div className="gc-section-label">سؤال المراجع</div>
                      <p className="mt-2 text-sm leading-6 text-foreground">
                        أعاني من صداع مستمر مع دوخة خفيفة منذ أسبوعين. أرفقت تحاليل الدم
                        والأشعة للمراجعة.
                      </p>
                    </div>

                    <div className="rounded-2xl border border-(--border) bg-(--surface-2) p-4">
                      <div className="gc-section-label">المرفقات</div>
                      <div className="mt-3 space-y-2">
                        {[
                          { name: "تحاليل-دم.pdf", size: "128 KB" },
                          { name: "أشعة-صدر.jpg", size: "512 KB" },
                        ].map((f) => (
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
                      <div className="gc-section-label text-emerald-800 dark:text-emerald-200">
                        توصيات الطبيب
                      </div>
                      <p className="mt-2 text-sm leading-6 text-emerald-900/90 dark:text-emerald-50">
                        يُنصح بمتابعة الضغط يومياً والاستمرار على الدواء. إذا استمر الصداع أكثر من أسبوعين، راجع طبيبك.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="gc-hero-card-shadow pointer-events-none absolute -inset-4 -z-10 rounded-[2rem]" aria-hidden />
              </div>
            </div>
          </div>
        </section>

        <section id="how" className="gc-steps-strip scroll-mt-20">
          <div className="mx-auto max-w-6xl px-4 py-14">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-foreground">كيف تعمل؟</h2>
              <p className="mt-2 text-sm text-(--muted)">
                أربع خطوات من التسجيل حتى استلام الرد
              </p>
              <div className="mx-auto mt-5 max-w-md gc-step-line" />
            </div>

            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {steps.map((s) => (
                <div key={s.n} className="gc-step-card">
                  <div className="gc-step-dot">{s.n}</div>
                  <div className="mt-4 text-sm font-bold text-foreground">{s.t}</div>
                  <p className="mt-2 text-xs leading-6 text-(--muted)">{s.d}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="services" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-14">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-foreground">ما الذي نقدّمه؟</h2>
            <p className="mt-2 text-sm text-(--muted)">
              اللي بتحتاجه لاستشارة طبية عن بُعد
            </p>
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((x) => (
              <div key={x.t} className="gc-service-card gc-glass rounded-2xl p-5">
                <div className="gc-service-accent" aria-hidden />
                <div className="text-sm font-bold text-foreground">{x.t}</div>
                <p className="mt-2 text-sm leading-6 text-(--muted)">{x.d}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 pb-14">
          <div className="gc-cta-banner relative overflow-hidden rounded-3xl p-8 text-center sm:p-12">
            <div className="gc-cta-glow pointer-events-none absolute inset-0" aria-hidden />
            <div className="relative">
              <h2 className="text-xl font-bold text-white sm:text-2xl">
                جاهز للبدء؟
              </h2>
              <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-white/80">
                أنشئ حسابك وأرسل أول استشارة — بالعربية وبخطوات بسيطة.
              </p>
              <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                <Link
                  href="/register"
                  className="inline-flex h-11 items-center justify-center rounded-xl bg-white px-6 text-sm font-bold text-[#0b3d47] transition hover:bg-white/90"
                >
                  إنشاء حساب جديد
                </Link>
                <Link
                  href="/login"
                  className="inline-flex h-11 items-center justify-center rounded-xl border border-white/30 px-6 text-sm font-bold text-white transition hover:bg-white/10"
                >
                  تسجيل الدخول
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section id="faq" className="mx-auto max-w-6xl scroll-mt-20 px-4 pb-16">
          <h2 className="text-2xl font-bold text-center">أسئلة شائعة</h2>
          <p className="mt-2 text-center text-sm text-(--muted)">أسئلة شائعة</p>
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
            © {new Date().getFullYear()} GazaCare Connect — مشروع تخرج
          </p>
        </div>
      </footer>
    </div>
  );
}
