import type { PhysicianProfileData } from "@/features/consultations/types";

export function physicianPhotoFileId(
  profile: PhysicianProfileData | { profile_photo_file_id?: number | null } | null | undefined,
): number | null {
  if (!profile) return null;
  return profile.profile_photo_file_id ?? null;
}
