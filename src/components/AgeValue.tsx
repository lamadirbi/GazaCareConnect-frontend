"use client";

import { useLang } from "@/lib/i18n";

type Props = {
  age: number | null | undefined;
  emptyLabel?: string;
};

export function AgeValue({ age, emptyLabel }: Props) {
  const { t } = useLang();
  const empty = emptyLabel ?? t("notSpecified");

  if (age == null) return <>{empty}</>;

  return (
    <span className="inline-flex items-center gap-1">
      <span dir="ltr">{age}</span>
      <span>{t("years")}</span>
    </span>
  );
}
