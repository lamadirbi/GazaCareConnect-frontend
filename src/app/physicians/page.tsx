"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { useRequireAuth } from "@/lib/auth";
import { AppHeader } from "@/components/AppHeader";
import { PageLoadingGate } from "@/components/PageLoadingGate";
import { Card, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";

type VerifiedPhysician = {
  id: number;
  user_id: number;
  specialty: string;
  certificate: string;
  user?: { id: number; name: string; email: string };
};

type Paginated<T> = { data: T[] };

export default function VerifiedPhysiciansPage() {
  const { user, loading: authLoading } = useRequireAuth({ allowedRoles: ["patient"] });
  const [rows, setRows] = useState<VerifiedPhysician[]>([]);
  const [loading, setLoading] = useState(true);
  const [initialLoadDone, setInitialLoadDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [specialty, setSpecialty] = useState("");

  useEffect(() => {
    let mounted = true;
    const qs = specialty ? `?specialty=${encodeURIComponent(specialty)}` : "";
    apiFetch<Paginated<VerifiedPhysician>>(`/verified-physicians${qs}`)
      .then((res) => {
        if (!mounted) return;
        setLoading(false);
        if (!initialLoadDone) setInitialLoadDone(true);
        if (!res.ok) {
          setError(res.message);
          return;
        }
        setRows(res.data.data ?? []);
      })
      .catch(() => {
        if (!mounted) return;
        setLoading(false);
        if (!initialLoadDone) setInitialLoadDone(true);
        setError("فشل تحميل الأطباء");
      });
    return () => {
      mounted = false;
    };
  }, [specialty]);

  return (
    <PageLoadingGate
      loading={authLoading || !initialLoadDone}
      message="جاري تحميل الأطباء..."
    >
    <div className="min-h-screen bg-transparent">
      <AppHeader title="الأطباء الموثّقون" backHref="/dashboard" userRole={user?.role} />

      <main className="mx-auto w-full max-w-5xl px-4 py-8">
        <Card>
          <CardBody className="p-6">
            <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
              الأطباء الموثّقون
            </h1>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              تصفّح الأطباء وأرسل استشارة لمن تختاره، أو أرسلها لأول طبيب متاح من صفحة استشارة جديدة.
            </p>

            <div className="mt-4">
              <input
                value={specialty}
                onChange={(e) => setSpecialty(e.target.value)}
                placeholder="بحث بالتخصص..."
                className="w-full rounded-xl border border-(--border) bg-(--surface) px-3 py-2 text-sm"
              />
            </div>

            {error ? <Alert variant="error" className="mt-4">{error}</Alert> : null}

            {loading ? (
              <p className="mt-6 text-sm text-zinc-500">جاري تحديث القائمة...</p>
            ) : rows.length === 0 ? (
              <p className="mt-6 text-sm text-zinc-500">لا يوجد أطباء موثّقون حالياً.</p>
            ) : (
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                {rows.map((row) => (
                  <Card key={row.id}>
                    <CardBody className="p-5">
                      <div className="font-semibold text-zinc-900 dark:text-zinc-50">
                        {row.user?.name}
                      </div>
                      <div className="mt-1 text-sm text-(--gc-accent)">{row.specialty}</div>
                      <p className="mt-3 line-clamp-3 text-sm text-zinc-600 dark:text-zinc-400">
                        {row.certificate}
                      </p>
                      <div className="mt-4">
                        <Link
                          href={`/consultations/new?physician_id=${row.user?.id ?? ""}&mode=direct`}
                        >
                          <Button size="sm">إرسال استشارة لهذا الطبيب</Button>
                        </Link>
                      </div>
                    </CardBody>
                  </Card>
                ))}
              </div>
            )}
          </CardBody>
        </Card>
      </main>
    </div>
    </PageLoadingGate>
  );
}
