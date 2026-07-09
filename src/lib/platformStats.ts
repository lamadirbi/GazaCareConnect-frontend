export type PlatformStats = {
  completed_consultations: number;
  verified_physicians: number;
  registered_patients: number;
};

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000/api/v1";

const emptyStats: PlatformStats = {
  completed_consultations: 0,
  verified_physicians: 0,
  registered_patients: 0,
};

export async function fetchPlatformStats(): Promise<PlatformStats> {
  try {
    const res = await fetch(`${API_BASE}/platform-stats`, {
      next: { revalidate: 30 },
    });
    if (!res.ok) return emptyStats;
    const json = (await res.json()) as { stats?: PlatformStats };
    return json.stats ?? emptyStats;
  } catch {
    return emptyStats;
  }
}

export function formatStatValue(n: number): string {
  return new Intl.NumberFormat("ar").format(n);
}

export function buildStatCards(stats: PlatformStats) {
  return [
    {
      value: formatStatValue(stats.completed_consultations),
      label: "استشارة مكتملة",
    },
    {
      value: formatStatValue(stats.verified_physicians),
      label: "طبيب موثّق",
    },
    {
      value: formatStatValue(stats.registered_patients),
      label: "مراجع مسجّل",
    },
  ];
}
