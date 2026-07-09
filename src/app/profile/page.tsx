"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { apiFetch } from "@/lib/api";
import { useRequireAuth } from "@/lib/auth";
import { AppHeader } from "@/components/AppHeader";
import { PageLoadingGate } from "@/components/PageLoadingGate";
import { Card, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";

type MedicalProfile = {
  id: number;
  user_id: number;
  height_cm: number | null;
  weight_kg: number | null;
  chronic_diseases: string | null;
  medical_history: string | null;
  allergies: string | null;
  current_medications: string | null;
};

type ProfileResponse = { profile: MedicalProfile };

export default function ProfilePage() {
  const { user, loading: authLoading } = useRequireAuth();
  const [profile, setProfile] = useState<MedicalProfile | null>(null);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [okMsg, setOkMsg] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    apiFetch<ProfileResponse>(`/medical-profile`)
      .then((res) => {
        if (!mounted) return;
        setLoading(false);
        if (!res.ok) {
          setError(res.message);
          return;
        }
        setProfile(res.data.profile);
        setEditing(false);
      })
      .catch(() => {
        if (!mounted) return;
        setLoading(false);
        setError("فشل تحميل الملف الطبي");
      });
    return () => {
      mounted = false;
    };
  }, []);

  async function save() {
    if (!profile) return;
    setSaving(true);
    setError(null);
    setOkMsg(null);

    const res = await apiFetch<ProfileResponse>(`/medical-profile`, {
      method: "PUT",
      body: JSON.stringify({
        height_cm: profile.height_cm,
        weight_kg: profile.weight_kg,
        chronic_diseases: profile.chronic_diseases,
        medical_history: profile.medical_history,
        allergies: profile.allergies,
        current_medications: profile.current_medications,
      }),
    });

    setSaving(false);
    if (!res.ok) {
      setError(res.message);
      return;
    }
    setProfile(res.data.profile);
    setOkMsg("تم حفظ التحديثات");
    setEditing(false);
  }

  function fieldOrDash(value: string | null | undefined) {
    const v = value?.trim();
    return v ? v : "—";
  }

  return (
    <PageLoadingGate
      loading={authLoading || loading}
      message="جاري تحميل الملف الطبي..."
    >
    <div className="min-h-screen bg-transparent">
      <AppHeader title="الملف الطبي" backHref="/dashboard" userRole={user?.role} />

      <main className="mx-auto w-full max-w-5xl px-4 py-8">
        {error ? (
          <div className="mb-4">
            <Alert variant="error">{error}</Alert>
          </div>
        ) : null}

        {okMsg ? (
          <div className="mb-4">
            <Alert variant="success">{okMsg}</Alert>
          </div>
        ) : null}

        {profile ? (
          <Card>
            <CardBody className="p-6">
            <div className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
              هذه البيانات يراها الطبيب عند مراجعة استشارتك.
            </div>

            <div className="mt-4 grid gap-3 text-sm text-zinc-700 dark:text-zinc-200 sm:grid-cols-2">
              <div className="rounded-xl border border-(--border) bg-(--surface-2) px-4 py-3">
                <div className="text-xs text-zinc-500 dark:text-zinc-400">الطول</div>
                <div className="mt-1 font-medium">
                  {profile.height_cm ? <span dir="ltr">{profile.height_cm} cm</span> : "غير محدد"}
                </div>
              </div>
              <div className="rounded-xl border border-(--border) bg-(--surface-2) px-4 py-3">
                <div className="text-xs text-zinc-500 dark:text-zinc-400">الوزن</div>
                <div className="mt-1 font-medium">
                  {profile.weight_kg ? <span dir="ltr">{profile.weight_kg} kg</span> : "غير محدد"}
                </div>
              </div>
              <div className="rounded-xl border border-(--border) bg-(--surface-2) px-4 py-3 sm:col-span-2">
                <div className="text-xs text-zinc-500 dark:text-zinc-400">أمراض مزمنة</div>
                <div className="mt-1 whitespace-pre-wrap font-medium">
                  {fieldOrDash(profile.chronic_diseases)}
                </div>
              </div>
              <div className="rounded-xl border border-(--border) bg-(--surface-2) px-4 py-3 sm:col-span-2">
                <div className="text-xs text-zinc-500 dark:text-zinc-400">التاريخ الطبي</div>
                <div className="mt-1 whitespace-pre-wrap font-medium">
                  {fieldOrDash(profile.medical_history)}
                </div>
              </div>
              <div className="rounded-xl border border-(--border) bg-(--surface-2) px-4 py-3 sm:col-span-2">
                <div className="text-xs text-zinc-500 dark:text-zinc-400">الحساسية</div>
                <div className="mt-1 whitespace-pre-wrap font-medium">{fieldOrDash(profile.allergies)}</div>
              </div>
              <div className="rounded-xl border border-(--border) bg-(--surface-2) px-4 py-3 sm:col-span-2">
                <div className="text-xs text-zinc-500 dark:text-zinc-400">الأدوية الحالية</div>
                <div className="mt-1 whitespace-pre-wrap font-medium">
                  {fieldOrDash(profile.current_medications)}
                </div>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-end">
              <Button
                type="button"
                variant={editing ? "secondary" : "primary"}
                size="sm"
                onClick={() => {
                  setError(null);
                  setOkMsg(null);
                  setEditing((v) => !v);
                }}
              >
                {editing ? "إخفاء التعديل" : "تعديل المعلومات"}
              </Button>
            </div>

            {editing ? (
              <div className="mt-4 grid gap-4 rounded-2xl border border-(--border) bg-(--surface-2) p-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="grid gap-1">
                    <span className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
                      الطول (سم)
                    </span>
                    <input
                      value={profile.height_cm ?? ""}
                      onChange={(e) =>
                        setProfile({
                          ...profile,
                          height_cm: e.target.value ? Number(e.target.value) : null,
                        })
                      }
                      inputMode="numeric"
                      className="h-11 rounded-xl border border-(--border) bg-(--surface) px-3 text-sm text-zinc-900 outline-none focus:ring-2 focus:ring-(--ring) dark:text-zinc-50"
                    />
                  </label>

                  <label className="grid gap-1">
                    <span className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
                      الوزن (كغ)
                    </span>
                    <input
                      value={profile.weight_kg ?? ""}
                      onChange={(e) =>
                        setProfile({
                          ...profile,
                          weight_kg: e.target.value ? Number(e.target.value) : null,
                        })
                      }
                      inputMode="numeric"
                      className="h-11 rounded-xl border border-zinc-200 bg-white px-3 text-sm text-zinc-900 outline-none focus:ring-2 focus:ring-zinc-900/10 dark:border-zinc-800 dark:bg-black dark:text-zinc-50 dark:focus:ring-white/10"
                    />
                  </label>
                </div>

                <label className="grid gap-1">
                  <span className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
                    أمراض مزمنة
                  </span>
                  <textarea
                    value={profile.chronic_diseases ?? ""}
                    onChange={(e) =>
                      setProfile({ ...profile, chronic_diseases: e.target.value || null })
                    }
                    rows={3}
                    className="rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:ring-2 focus:ring-zinc-900/10 dark:border-zinc-800 dark:bg-black dark:text-zinc-50 dark:focus:ring-white/10"
                  />
                </label>

                <label className="grid gap-1">
                  <span className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
                    التاريخ الطبي
                  </span>
                  <textarea
                    value={profile.medical_history ?? ""}
                    onChange={(e) =>
                      setProfile({ ...profile, medical_history: e.target.value || null })
                    }
                    rows={4}
                    className="rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:ring-2 focus:ring-zinc-900/10 dark:border-zinc-800 dark:bg-black dark:text-zinc-50 dark:focus:ring-white/10"
                  />
                </label>

                <label className="grid gap-1">
                  <span className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
                    الحساسية
                  </span>
                  <textarea
                    value={profile.allergies ?? ""}
                    onChange={(e) =>
                      setProfile({ ...profile, allergies: e.target.value || null })
                    }
                    rows={2}
                    className="rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:ring-2 focus:ring-zinc-900/10 dark:border-zinc-800 dark:bg-black dark:text-zinc-50 dark:focus:ring-white/10"
                  />
                </label>

                <label className="grid gap-1">
                  <span className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
                    الأدوية الحالية
                  </span>
                  <textarea
                    value={profile.current_medications ?? ""}
                    onChange={(e) =>
                      setProfile({
                        ...profile,
                        current_medications: e.target.value || null,
                      })
                    }
                    rows={2}
                    className="rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:ring-2 focus:ring-zinc-900/10 dark:border-zinc-800 dark:bg-black dark:text-zinc-50 dark:focus:ring-white/10"
                  />
                </label>

                <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => {
                      setEditing(false);
                      setError(null);
                      setOkMsg(null);
                    }}
                  >
                    إلغاء
                  </Button>
                  <Button type="button" onClick={save} disabled={saving}>
                    {saving ? "جاري الحفظ..." : "حفظ التعديل"}
                  </Button>
                </div>
              </div>
            ) : null}
            </CardBody>
          </Card>
        ) : null}
      </main>
    </div>
    </PageLoadingGate>
  );
}

