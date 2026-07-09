"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useRequireAuth } from "@/lib/auth";
import { AppHeader } from "@/components/AppHeader";
import { PageLoadingGate } from "@/components/PageLoadingGate";
import Link from "next/link";
import { Card, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";

type MedicalProfile = {
  height_cm: number | null;
  weight_kg: number | null;
  chronic_diseases: string | null;
  allergies: string | null;
  current_medications: string | null;
};

export default function DashboardPage() {
  const { user, loading, error } = useRequireAuth();
  const [profile, setProfile] = useState<MedicalProfile | null>(null);

  useEffect(() => {
    if (user?.role !== "admin") return;
    window.location.href = "/admin/dashboard";
  }, [user?.role]);

  useEffect(() => {
    if (user?.role === "admin") return;
    let mounted = true;
    // keep dashboard lightweight; ignore profile errors here
    import("@/lib/api").then(({ apiFetch }) =>
      apiFetch<{ profile: MedicalProfile }>("/medical-profile")
        .then((res) => {
          if (!mounted) return;
          if (!res.ok) return;
          setProfile(res.data.profile);
        })
        .catch(() => {})
    );
    return () => {
      mounted = false;
    };
  }, [user?.role]);

  if (user?.role === "admin") {
    return (
      <PageLoadingGate loading={loading} message="جاري التحويل إلى لوحة المدير...">
        <div className="min-h-[calc(100vh-0px)] bg-transparent">
          <AppHeader title="لوحة التحكم" backHref="/" userRole={user.role} />
          <main className="mx-auto w-full max-w-5xl px-4 py-8">
            <p className="text-sm text-zinc-500">جاري تحويلك إلى لوحة المدير...</p>
          </main>
        </div>
      </PageLoadingGate>
    );
  }

  function roleLabel(role: string | null | undefined) {
    if (role === "patient") return "مراجع مسجّل";
    if (role === "physician") return "طبيب مسجّل";
    if (role === "admin") return "مدير النظام";
    return "مستخدم";
  }

  return (
    <PageLoadingGate loading={loading} message="جاري تجهيز لوحة التحكم...">
    <div className="min-h-[calc(100vh-0px)] bg-transparent">
      <AppHeader
        title="لوحة التحكم"
        backHref="/"
        userRole={user?.role}
      />

      <main className="mx-auto w-full max-w-5xl px-4 py-8">
        {error ? (
          <Alert variant="error">
            {error} — تأكد أن الخادم يعمل على المنفذ <span dir="ltr">:8000</span>
          </Alert>
        ) : null}

        <Card className="mt-4 overflow-hidden">
          <div className="h-1 bg-gradient-to-l from-(--gc-accent) to-[#0b6e7a]" />
          <CardBody>
            <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
              لوحة التحكم
            </h1>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              {user ? (
                <>
                  مرحباً، <span className="font-medium text-foreground">{user.name}</span>
                  <span className="mx-2 text-zinc-300 dark:text-zinc-600">·</span>
                  <span className="inline-flex items-center rounded-full border border-(--border) bg-(--surface-2) px-2.5 py-0.5 text-xs font-medium text-(--muted)">
                    {roleLabel(user.role)}
                  </span>
                </>
              ) : (
                "جاري تحميل بياناتك..."
              )}
            </p>

            {user?.role === "patient" ? (
              <div className="mt-6 rounded-2xl border border-(--border) bg-(--surface-2) p-5">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h2 className="text-sm font-semibold text-foreground">ملخص الملف الطبي</h2>
                    <p className="mt-1 text-xs text-(--muted)">
                      يظهر للطبيب عند مراجعة الاستشارة. يمكنك تعديله من الزر أدناه.
                    </p>
                  </div>
                  <Link href="/profile" className="shrink-0">
                    <Button variant="secondary" size="sm" className="w-full sm:w-auto">
                      تعديل الملف الطبي
                    </Button>
                  </Link>
                </div>

                <ul className="mt-5 divide-y divide-(--border) list-none ps-0">
                  {(
                    [
                      {
                        label: "الطول",
                        value:
                          profile?.height_cm != null ? (
                            <span dir="ltr">{profile.height_cm} cm</span>
                          ) : (
                            "غير محدد"
                          ),
                      },
                      {
                        label: "الوزن",
                        value:
                          profile?.weight_kg != null ? (
                            <span dir="ltr">{profile.weight_kg} kg</span>
                          ) : (
                            "غير محدد"
                          ),
                      },
                      {
                        label: "أمراض مزمنة",
                        value: profile?.chronic_diseases?.trim()
                          ? profile.chronic_diseases
                          : "لا يوجد",
                      },
                      {
                        label: "الحساسية",
                        value: profile?.allergies?.trim() ? profile.allergies : "لا يوجد",
                      },
                      {
                        label: "الأدوية الحالية",
                        value: profile?.current_medications?.trim()
                          ? profile.current_medications
                          : "لا يوجد",
                      },
                    ] as { label: string; value: ReactNode }[]
                  ).map((row) => (
                    <li key={row.label} className="flex gap-3 py-3">
                      <span
                        className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-(--gc-accent)"
                        aria-hidden
                      />
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-medium text-(--muted)">{row.label}</div>
                        <div className="mt-0.5 whitespace-pre-wrap text-sm font-medium text-foreground">
                          {row.value}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            <div
              className={`mt-6 grid gap-3 ${
                user?.role === "patient" ? "sm:grid-cols-2" : "sm:grid-cols-2"
              }`}
            >
              {user?.role === "patient" ? (
                <Card className="hover:brightness-[1.03]">
                  <CardBody className="p-5">
                    <div className="font-semibold text-zinc-900 dark:text-zinc-50">
                      الأطباء الموثّقون
                    </div>
                    <div className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                      تصفّح الأطباء وأرسل استشارة مباشرة لمن تختاره.
                    </div>
                    <div className="mt-4">
                      <Link href="/physicians">
                        <Button variant="secondary" size="sm">
                          عرض الأطباء
                        </Button>
                      </Link>
                    </div>
                  </CardBody>
                </Card>
              ) : null}

              {user?.role !== "patient" ? (
                <Card className="hover:brightness-[1.03]">
                  <CardBody className="p-5">
                    <div className="font-semibold text-zinc-900 dark:text-zinc-50">
                      الملف الطبي
                    </div>
                    <div className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                      عدّل بياناتك الصحية.
                    </div>
                    <div className="mt-4">
                      <Link href="/profile">
                        <Button variant="secondary" size="sm">
                          فتح الملف الطبي
                        </Button>
                      </Link>
                    </div>
                  </CardBody>
                </Card>
              ) : null}

              {user?.role === "patient" ? (
              <Card className="hover:brightness-[1.03]">
                <CardBody className="p-5">
                    <div className="font-semibold text-zinc-900 dark:text-zinc-50">
                      استشاراتي
                    </div>
                    <div className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                      أرسل استشارة جديدة أو راجع السابقة.
                    </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Link href="/consultations">
                      <Button variant="secondary" size="sm">
                        عرض الاستشارات
                      </Button>
                    </Link>
                    <Link href="/consultations/new">
                      <Button variant="primary" size="sm">
                        استشارة جديدة
                      </Button>
                    </Link>
                  </div>
                </CardBody>
              </Card>
              ) : null}
            </div>

            <div className="mt-6 flex items-center justify-end">
              {/* logout is only in header */}
            </div>
          </CardBody>
        </Card>
      </main>
    </div>
    </PageLoadingGate>
  );
}

