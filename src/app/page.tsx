import { fetchPlatformStats } from "@/lib/platformStats";
import { LandingContent } from "@/components/LandingContent";

export default async function Home() {
  const platformStats = await fetchPlatformStats();

  return <LandingContent platformStats={platformStats} />;
}
