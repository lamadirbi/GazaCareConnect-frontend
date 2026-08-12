"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { genderLabel } from "@/lib/medicalProfile";
import { AgeValue } from "@/components/AgeValue";
import { useLang } from "@/lib/i18n";

export type MedicalProfileSummary = {
  gender?: string | null;
  age?: number | null;
  height_cm: number | null;
  weight_kg: number | null;
  chronic_diseases: string | null;
  medical_history?: string | null;
  allergies: string | null;
  current_medications: string | null;
};

type Props = {
  title?: string;
  subtitle?: string;
  profile: MedicalProfileSummary;
  editHref?: string;
  embedded?: boolean;
};

function fieldOrDash(value: string | null | undefined, fallback: string) {
  const v = value?.trim();
  return v ? v : fallback;
}

function ProfileField({
  label,
  value,
  wide,
}: {
  label: string;
  value: ReactNode;
  wide?: boolean;
}) {
  return (
    <div className={`gc-profile-field ${wide ? "sm:col-span-2" : ""}`}>
      <div className="gc-profile-field-label">{label}</div>
      <div className="gc-profile-field-value">{value}</div>
    </div>
  );
}

export function MedicalProfileSummaryCard({
  title,
  subtitle,
  profile,
  editHref,
  embedded = false,
}: Props) {
  const { t, lang } = useLang();
  const resolvedTitle = title ?? t("profileSummaryTitle");
  const resolvedSubtitle = subtitle ?? t("profileSummarySubtitle");
  const notSpecified = t("notSpecified");

  const fields = (
    <div className="grid gap-2.5 sm:grid-cols-2">
      <ProfileField label={t("genderLabel")} value={genderLabel(profile.gender, lang)} />
      <ProfileField label={t("ageLabel")} value={<AgeValue age={profile.age} />} />
      <ProfileField
        label={t("heightLabel")}
        value={
          profile.height_cm != null ? (
            <span dir="ltr">{profile.height_cm} cm</span>
          ) : (
            notSpecified
          )
        }
      />
      <ProfileField
        label={t("weightLabel")}
        value={
          profile.weight_kg != null ? (
            <span dir="ltr">{profile.weight_kg} kg</span>
          ) : (
            notSpecified
          )
        }
      />
      <ProfileField
        label={t("chronicDiseasesLabel")}
        wide
        value={
          <span className="whitespace-pre-wrap">
            {fieldOrDash(profile.chronic_diseases, notSpecified)}
          </span>
        }
      />
      {"medical_history" in profile ? (
        <ProfileField
          label={t("medicalHistoryLabel")}
          wide
          value={
            <span className="whitespace-pre-wrap">
              {fieldOrDash(profile.medical_history, notSpecified)}
            </span>
          }
        />
      ) : null}
      <ProfileField
        label={t("allergiesLabel")}
        wide
        value={
          <span className="whitespace-pre-wrap">{fieldOrDash(profile.allergies, notSpecified)}</span>
        }
      />
      <ProfileField
        label={t("medicationsLabel")}
        wide
        value={
          <span className="whitespace-pre-wrap">
            {fieldOrDash(profile.current_medications, notSpecified)}
          </span>
        }
      />
    </div>
  );

  if (embedded) {
    return (
      <div className="gc-profile-embedded">
        {editHref ? (
          <div className="mb-3 flex justify-end">
            <Link href={editHref}>
              <Button variant="secondary" size="sm" type="button">
                {t("editProfile")}
              </Button>
            </Link>
          </div>
        ) : null}
        {fields}
      </div>
    );
  }

  const body = (
    <>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="text-sm font-semibold text-foreground">{resolvedTitle}</div>
          {resolvedSubtitle ? (
            <p className="mt-1 text-xs text-(--muted)">{resolvedSubtitle}</p>
          ) : null}
        </div>
        {editHref ? (
          <Link href={editHref}>
            <Button variant="secondary" size="sm" type="button">
              {t("editProfile")}
            </Button>
          </Link>
        ) : null}
      </div>
      <div className="mt-4">{fields}</div>
    </>
  );

  return (
    <Card>
      <div className="p-5 sm:p-6">{body}</div>
    </Card>
  );
}
