export const PHYSICIAN_DASHBOARD_HOME = "/physician/dashboard";

export const physicianDashboardSections = [
  {
    id: "physician-direct",
    label: "حالات موجّهة بشكل خاص",
    href: `${PHYSICIAN_DASHBOARD_HOME}#physician-direct`,
  },
  {
    id: "physician-queue",
    label: "حالات عامة",
    href: `${PHYSICIAN_DASHBOARD_HOME}#physician-queue`,
  },
  {
    id: "physician-in-progress",
    label: "حالات قيد المراجعة",
    href: `${PHYSICIAN_DASHBOARD_HOME}#physician-in-progress`,
  },
  {
    id: "physician-completed",
    label: "حالات مكتملة",
    href: `${PHYSICIAN_DASHBOARD_HOME}#physician-completed`,
  },
] as const;

export function scrollToPhysicianSection(sectionId: string) {
  const el = document.getElementById(sectionId);
  if (!el) return false;
  el.scrollIntoView({ behavior: "smooth", block: "start" });
  return true;
}
