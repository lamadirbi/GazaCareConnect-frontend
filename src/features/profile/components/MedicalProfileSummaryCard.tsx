"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

export type MedicalProfileSummary = {
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

function fieldOrDash(value: string | null | undefined) {
  const v = value?.trim();
  return v ? v : "غير محدد";
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
  title = "ملفك الطبي",
  subtitle = "يُرفق تلقائياً مع كل استشارة.",
  profile,
  editHref,
  embedded = false,
}: Props) {
  const fields = (
    <div className="grid gap-2.5 sm:grid-cols-2">
      <ProfileField
        label="الطول"
        value={
          profile.height_cm != null ? <span dir="ltr">{profile.height_cm} cm</span> : "غير محدد"
        }
      />
      <ProfileField
        label="الوزن"
        value={
          profile.weight_kg != null ? <span dir="ltr">{profile.weight_kg} kg</span> : "غير محدد"
        }
      />
      <ProfileField
        label="أمراض مزمنة"
        wide
        value={<span className="whitespace-pre-wrap">{fieldOrDash(profile.chronic_diseases)}</span>}
      />
      {"medical_history" in profile ? (
        <ProfileField
          label="التاريخ الطبي"
          wide
          value={
            <span className="whitespace-pre-wrap">{fieldOrDash(profile.medical_history)}</span>
          }
        />
      ) : null}
      <ProfileField
        label="الحساسية"
        wide
        value={<span className="whitespace-pre-wrap">{fieldOrDash(profile.allergies)}</span>}
      />
      <ProfileField
        label="الأدوية الحالية"
        wide
        value={
          <span className="whitespace-pre-wrap">{fieldOrDash(profile.current_medications)}</span>
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
                تعديل الملف
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
          <div className="text-sm font-semibold text-foreground">{title}</div>
          {subtitle ? <p className="mt-1 text-xs text-(--muted)">{subtitle}</p> : null}
        </div>
        {editHref ? (
          <Link href={editHref}>
            <Button variant="secondary" size="sm" type="button">
              تعديل الملف
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
