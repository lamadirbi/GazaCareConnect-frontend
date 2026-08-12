import { getAssignmentLabels, type Lang } from "@/lib/i18n";

export function queueAssignmentLabel(lang: Lang = "ar") {
  return getAssignmentLabels(lang).label;
}

/** @deprecated use getAssignmentLabels(lang) */
export const QUEUE_ASSIGNMENT_LABEL = "أرسلها لأول طبيب متاح";
export const QUEUE_ASSIGNMENT_LABEL_SHORT = "بانتظار طبيب";
export const QUEUE_ASSIGNMENT_SECTION_TITLE = "بانتظار طبيب";
export const QUEUE_ASSIGNMENT_SECTION_DESC =
  "ما زالت بانتظار أن يستلمها أول طبيب متاح.";
