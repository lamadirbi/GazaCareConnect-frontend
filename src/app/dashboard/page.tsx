"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useRequireAuth, setAuthSession } from "@/lib/auth";
import { apiFetch } from "@/lib/api";
import { AppHeader } from "@/components/AppHeader";
import { PageLoadingGate } from "@/components/PageLoadingGate";
import Link from "next/link";
import { Card, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { CaregiverModeModal } from "@/components/CaregiverModeModal";
import { caregiverRelationshipLabel } from "@/lib/caregiver";
import type { CaregiverRelationship } from "@/lib/caregiver";
import { genderLabel } from "@/lib/medicalProfile";
import { AgeValue } from "@/components/AgeValue";
import { useLang } from "@/lib/i18n";

type MedicalProfile = {
  gender: string | null;
  age: number | null;
  height_cm: number | null;
  weight_kg: number | null;
  chronic_diseases: string | null;
  allergies: string | null;
  current_medications: string | null;
};

export default function DashboardPage() {
  const { t, lang } = useLang();
  const { user, loading, error } = useRequireAuth();
  const [profile, setProfile] = useState<MedicalProfile | null>(null);
  const [caregiverModalOpen, setCaregiverModalOpen] = useState(false);
  const [caregiverSaving, setCaregiverSaving] = useState(false);
  const [caregiverError, setCaregiverError] = useState<string | null>(null);

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
      <PageLoadingGate loading={loading} message={t("redirectingAdmin")}>
        <div className="min-h-[calc(100vh-0px)] bg-transparent">
          <AppHeader title={t("dashboardTitle")} backHref="/" userRole={user.role} />
          <main className="mx-auto w-full max-w-5xl px-4 py-8">
            <p className="text-sm text-zinc-500">{t("redirectingAdmin")}</p>
          </main>
        </div>
      </PageLoadingGate>
    );
  }

  function roleLabel(role: string | null | undefined) {
    if (role === "patient") return t("rolePatientLabel");
    if (role === "physician") return t("rolePhysicianLabel");
    if (role === "admin") return t("roleAdminLabel");
    return t("roleUserLabel");
  }

  async function toggleCaregiverMode() {
    if (!user || user.role !== "patient") return;

    if (user.caregiver_mode_enabled) {
      setCaregiverSaving(true);
      setCaregiverError(null);
      const res = await apiFetch<{ user: typeof user }>("/caregiver-mode", {
        method: "PATCH",
        body: JSON.stringify({ enabled: false }),
      });
      setCaregiverSaving(false);
      if (!res.ok) {
        setCaregiverError(res.message);
        return;
      }
      setAuthSession(res.data.user);
      window.location.reload();
      return;
    }

    setCaregiverModalOpen(true);
  }

  async function confirmCaregiverMode(relationship: CaregiverRelationship) {
    setCaregiverSaving(true);
    setCaregiverError(null);
    const res = await apiFetch<{ user: NonNullable<typeof user> }>("/caregiver-mode", {
      method: "PATCH",
      body: JSON.stringify({ enabled: true, relationship }),
    });
    setCaregiverSaving(false);
    if (!res.ok) {
      setCaregiverError(res.message);
      return;
    }
    setCaregiverModalOpen(false);
    setAuthSession(res.data.user);
    window.location.reload();
  }

  return (
    <PageLoadingGate loading={loading} message={t("dashboardLoading")}>
    <div className="min-h-[calc(100vh-0px)] bg-transparent">
      <AppHeader
        title={t("dashboardTitle")}
        backHref="/"
        userRole={user?.role}
      />

      <main className="mx-auto w-full max-w-5xl px-4 py-8">
        {error ? (
          <Alert variant="error">
            {error} — {t("serverErrorHint")} <span dir="ltr">:8000</span>
          </Alert>
        ) : null}

        <Card className="mt-4 overflow-hidden">
          <div className="h-1 bg-gradient-to-l from-(--gc-accent) to-[#0b6e7a]" />
          <CardBody>
            <h1 className="text-xl font-semibold text-zinc-900">
              {t("dashboardTitle")}
            </h1>

            {user?.role === "patient" ? (
              <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div className="text-xs text-(--muted)">
                  {user.caregiver_mode_enabled && user.caregiver_relationship ? (
                    <>
                      {t("caregiverActive")}{" "}
                      <span className="font-medium text-foreground">
                        {caregiverRelationshipLabel(user.caregiver_relationship, lang)}
                      </span>
                    </>
                  ) : (
                    t("caregiverHint")
                  )}
                </div>
                <Button
                  type="button"
                  variant={user.caregiver_mode_enabled ? "secondary" : "primary"}
                  size="sm"
                  className="shrink-0"
                  disabled={caregiverSaving}
                  onClick={toggleCaregiverMode}
                >
                  {caregiverSaving
                    ? t("saving")
                    : user.caregiver_mode_enabled
                      ? t("disableCaregiver")
                      : t("enableCaregiver")}
                </Button>
              </div>
            ) : null}

            {caregiverError ? (
              <Alert variant="error" className="mt-3">
                {caregiverError}
              </Alert>
            ) : null}

            <p className="mt-1 text-sm text-zinc-600">
              {user ? (
                <>
                  {t("welcome")} <span className="font-medium text-foreground">{user.name}</span>
                  <span className="mx-2 text-zinc-300">·</span>
                  <span className="inline-flex items-center rounded-full border border-(--border) bg-(--surface-2) px-2.5 py-0.5 text-xs font-medium text-(--muted)">
                    {roleLabel(user.role)}
                  </span>
                </>
              ) : (
                t("loadingUserData")
              )}
            </p>

            {user?.role === "patient" ? (
              <div className="mt-6 rounded-2xl border border-(--border) bg-(--surface-2) p-5">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h2 className="text-sm font-semibold text-foreground">{t("medicalSummaryTitle")}</h2>
                    <p className="mt-1 text-xs text-(--muted)">{t("medicalSummaryDesc")}</p>
                  </div>
                  <Link href="/profile" className="shrink-0">
                    <Button variant="secondary" size="sm" className="w-full sm:w-auto">
                      {t("editMedicalProfile")}
                    </Button>
                  </Link>
                </div>

                <ul className="mt-5 divide-y divide-(--border) list-none ps-0">
                  {(
                    [
                      {
                        label: t("genderLabel"),
                        value: genderLabel(profile?.gender, lang),
                      },
                      {
                        label: t("ageLabel"),
                        value: <AgeValue age={profile?.age} />,
                      },
                      {
                        label: t("heightLabel"),
                        value:
                          profile?.height_cm != null ? (
                            <span dir="ltr">{profile.height_cm} cm</span>
                          ) : (
                            t("notSpecified")
                          ),
                      },
                      {
                        label: t("weightLabel"),
                        value:
                          profile?.weight_kg != null ? (
                            <span dir="ltr">{profile.weight_kg} kg</span>
                          ) : (
                            t("notSpecified")
                          ),
                      },
                      {
                        label: t("chronicDiseasesLabel"),
                        value: profile?.chronic_diseases?.trim()
                          ? profile.chronic_diseases
                          : t("none"),
                      },
                      {
                        label: t("allergiesLabel"),
                        value: profile?.allergies?.trim() ? profile.allergies : t("none"),
                      },
                      {
                        label: t("medicationsLabel"),
                        value: profile?.current_medications?.trim()
                          ? profile.current_medications
                          : t("none"),
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
                    <div className="font-semibold text-zinc-900">{t("verifiedPhysiciansTitle")}</div>
                    <div className="mt-1 text-sm text-zinc-600">{t("verifiedPhysiciansDesc")}</div>
                    <div className="mt-4">
                      <Link href="/physicians">
                        <Button variant="secondary" size="sm">{t("browsePhysicians")}</Button>
                      </Link>
                    </div>
                  </CardBody>
                </Card>
              ) : null}

              {user?.role !== "patient" ? (
                <Card className="hover:brightness-[1.03]">
                  <CardBody className="p-5">
                    <div className="font-semibold text-zinc-900">{t("medicalProfileTitle")}</div>
                    <div className="mt-1 text-sm text-zinc-600">{t("medicalProfileDesc")}</div>
                    <div className="mt-4">
                      <Link href="/profile">
                        <Button variant="secondary" size="sm">{t("openMedicalProfile")}</Button>
                      </Link>
                    </div>
                  </CardBody>
                </Card>
              ) : null}

              {user?.role === "patient" ? (
              <Card className="hover:brightness-[1.03]">
                <CardBody className="p-5">
                    <div className="font-semibold text-zinc-900">{t("myConsultationsTitle")}</div>
                    <div className="mt-1 text-sm text-zinc-600">{t("myConsultationsDesc")}</div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Link href="/consultations">
                      <Button variant="secondary" size="sm">{t("viewConsultations")}</Button>
                    </Link>
                    <Link href="/consultations/new">
                      <Button variant="primary" size="sm">{t("newConsultation")}</Button>
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

      {user?.role === "patient" ? (
        <CaregiverModeModal
          open={caregiverModalOpen}
          initialRelationship={user.caregiver_relationship}
          saving={caregiverSaving}
          onConfirm={confirmCaregiverMode}
          onClose={() => {
            if (!caregiverSaving) setCaregiverModalOpen(false);
          }}
        />
      ) : null}
    </div>
    </PageLoadingGate>
  );
}

