"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { useRequireAuth } from "@/lib/auth";
import { AppHeader } from "@/components/AppHeader";
import { PageLoadingGate } from "@/components/PageLoadingGate";
import { Card, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";

type UserRow = {
  id: number;
  name: string;
  email: string;
  role: string;
  is_disabled?: boolean;
  physician_profile?: { specialty?: string; verification_status?: string } | null;
};

type Paginated<T> = { data: T[] };

const roleLabels: Record<string, string> = {
  patient: "مراجع",
  physician: "طبيب",
  admin: "مدير",
};

export default function AdminUsersPage() {
  const { user, loading: authLoading } = useRequireAuth({ allowedRoles: ["admin"] });
  const [rows, setRows] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [initialLoadDone, setInitialLoadDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [roleFilter, setRoleFilter] = useState("");

  async function load() {
    setLoading(true);
    setError(null);
    const qs = new URLSearchParams();
    if (roleFilter) qs.set("role", roleFilter);
    qs.set("per_page", "100");
    const res = await apiFetch<Paginated<UserRow>>(`/admin/users?${qs.toString()}`);
    setLoading(false);
    if (!initialLoadDone) setInitialLoadDone(true);
    if (!res.ok) {
      setError(res.message);
      return;
    }
    setRows(res.data.data ?? []);
  }

  useEffect(() => {
    load();
  }, [roleFilter]);

  async function toggleDisabled(row: UserRow) {
    setBusyId(row.id);
    setError(null);
    const res = await apiFetch<{ user: UserRow }>(`/admin/users/${row.id}/disabled`, {
      method: "PATCH",
      body: JSON.stringify({ disabled: !row.is_disabled }),
    });
    setBusyId(null);
    if (!res.ok) {
      setError(res.message);
      return;
    }
    setRows((prev) => prev.map((u) => (u.id === row.id ? res.data.user : u)));
  }

  return (
    <PageLoadingGate
      loading={authLoading || !initialLoadDone}
      message="جاري تحميل المستخدمين..."
    >
    <div className="min-h-screen bg-transparent">
      <AppHeader title="إدارة المستخدمين" backHref="/admin/dashboard" userRole={user?.role} />

      <main className="mx-auto w-full max-w-5xl px-4 py-8">
        <Card>
          <CardBody className="p-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">المستخدمون</h1>
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="rounded-xl border border-(--border) bg-(--surface) px-3 py-2 text-sm"
              >
                <option value="">كل الأدوار</option>
                <option value="patient">مرضى</option>
                <option value="physician">أطباء</option>
              </select>
            </div>

            {error ? <Alert variant="error" className="mt-4">{error}</Alert> : null}

            {loading ? (
              <p className="mt-6 text-sm text-zinc-500">جاري تحديث القائمة...</p>
            ) : (
              <div className="mt-6 overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="border-b border-(--border) text-right text-zinc-500">
                      <th className="px-3 py-2 font-medium">الاسم</th>
                      <th className="px-3 py-2 font-medium">البريد</th>
                      <th className="px-3 py-2 font-medium">الدور</th>
                      <th className="px-3 py-2 font-medium">الحالة</th>
                      <th className="px-3 py-2 font-medium">إجراء</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row) => (
                      <tr key={row.id} className="border-b border-(--border)">
                        <td className="px-3 py-3 font-medium">{row.name}</td>
                        <td className="px-3 py-3" dir="ltr">{row.email}</td>
                        <td className="px-3 py-3">{roleLabels[row.role] ?? row.role}</td>
                        <td className="px-3 py-3">
                          {row.is_disabled ? (
                            <span className="text-red-600">معطّل</span>
                          ) : (
                            <span className="text-emerald-600">نشط</span>
                          )}
                          {row.role === "physician" && row.physician_profile?.verification_status ? (
                            <div className="mt-1 text-xs text-zinc-500">
                              توثيق: {row.physician_profile.verification_status}
                            </div>
                          ) : null}
                        </td>
                        <td className="px-3 py-3">
                          {row.role === "admin" ? (
                            <span className="text-xs text-zinc-400">—</span>
                          ) : (
                            <Button
                              size="sm"
                              variant={row.is_disabled ? "primary" : "secondary"}
                              disabled={busyId === row.id}
                              onClick={() => toggleDisabled(row)}
                            >
                              {row.is_disabled ? "تفعيل" : "تعطيل"}
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardBody>
        </Card>
      </main>
    </div>
    </PageLoadingGate>
  );
}
