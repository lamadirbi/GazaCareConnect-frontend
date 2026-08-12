import { getCaregiverRelationshipLabel, type Lang } from "@/lib/i18n";

export const CAREGIVER_RELATIONSHIPS = [
  { value: "son" },
  { value: "daughter" },
  { value: "spouse" },
  { value: "father" },
  { value: "mother" },
  { value: "brother" },
  { value: "sister" },
] as const;

export type CaregiverRelationship = (typeof CAREGIVER_RELATIONSHIPS)[number]["value"];

export function caregiverRelationshipLabel(
  value: string | null | undefined,
  lang: Lang = "ar",
): string | null {
  return getCaregiverRelationshipLabel(lang, value);
}

export type CaregiverPatientInfo = {
  name: string;
  caregiver_mode_enabled?: boolean;
  caregiver_relationship?: string | null;
};

export function formatPatientWithRelationship(
  patient: CaregiverPatientInfo,
  lang: Lang = "ar",
): string {
  if (patient.caregiver_mode_enabled && patient.caregiver_relationship) {
    const label = caregiverRelationshipLabel(patient.caregiver_relationship, lang);
    if (label) return `${patient.name} (${label})`;
  }
  return patient.name;
}
