"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { useRequireAuth } from "@/lib/auth";
import { AppHeader } from "@/components/AppHeader";
import { PageLoadingGate } from "@/components/PageLoadingGate";
import { Card, CardBody } from "@/components/ui/Card";
import { Alert } from "@/components/ui/Alert";
import { useLang } from "@/lib/i18n";

type Paginated<T> = { data: T[]; total?: number };

export default function AdminDashboardPage() {
  const { t } = useLang();
  const { user, loading: authLoading } = useRequireAuth({ allowedRoles: ["admin"] });
  const [pendingCount, setPendingCount] = useState<number | null>(null);
  const [usersCount, setUsersCount] = useState<number | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    Promise.all([
      apiFetch<Paginated<unknown>>("/admin/physicians/pending"),
      apiFetch<Paginated<unknown>>("/admin/users"),
    ]).then(([pending, users]) => {
      if (!mounted) return;
      if (pending.ok) setPendingCount(pending.data.total ?? pending.data.data?.length ?? 0);
      if (users.ok) setUsersCount(users.data.total ?? users.data.data?.length ?? 0);
      setStatsLoading(false);
    });
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <PageLoadingGate loading={authLoading || statsLoading} message={t("adminDashboardLoading")}>
    <div className="min-h-screen bg-transparent">
      <AppHeader title={t("adminDashboardTitle")} backHref="/" userRole={user?.role} />

      <main className="mx-auto w-full max-w-5xl px-4 py-8">
        <Card>
          <CardBody className="p-6">
            <h1 className="text-xl font-semibold text-zinc-900">{t("adminDashboardTitle")}</h1>
            <p className="mt-1 text-sm text-zinc-600">
              {t("welcome")} {user?.name} — {t("adminWelcomeDesc")}
            </p>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <Card className="hover:brightness-[1.03]">
                <CardBody className="p-5">
                  <div className="text-sm text-zinc-500">{t("adminPendingPhysicians")}</div>
                  <div className="mt-1 text-2xl font-semibold text-zinc-900">
                    {pendingCount ?? "..."}
                  </div>
                  <Link href="/admin/physicians" className="mt-4 inline-block text-sm font-semibold text-(--gc-accent)">
                    {t("adminReviewRequests")}
                  </Link>
                </CardBody>
              </Card>

              <Card className="hover:brightness-[1.03]">
                <CardBody className="p-5">
                  <div className="text-sm text-zinc-500">{t("adminUsersCard")}</div>
                  <div className="mt-1 text-2xl font-semibold text-zinc-900">
                    {usersCount ?? "..."}
                  </div>
                  <Link href="/admin/users" className="mt-4 inline-block text-sm font-semibold text-(--gc-accent)">
                    {t("adminManageUsers")}
                  </Link>
                </CardBody>
              </Card>
            </div>

            <Alert variant="info" className="mt-6">
              {t("adminInfoAlert")}
            </Alert>
          </CardBody>
        </Card>
      </main>
    </div>
    </PageLoadingGate>
  );
}
