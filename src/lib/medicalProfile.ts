import { getGenderLabel, type Lang } from "@/lib/i18n";

export function genderLabel(value: string | null | undefined, lang: Lang = "ar") {
  return getGenderLabel(lang, value);
}
