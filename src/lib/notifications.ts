import { apiFetch, type ApiResult } from "@/lib/api";
import { getNotificationText, type Lang } from "@/lib/i18n";

export type AppNotification = {
  id: string;
  title: string;
  body: string;
  href: string;
  kind: string;
  meta?: Record<string, unknown>;
  read_at: string | null;
  created_at: string;
};

export type NotificationsResponse = {
  data: AppNotification[];
  unread_count: number;
};

export async function fetchNotifications(
  unreadOnly = false,
): Promise<ApiResult<NotificationsResponse>> {
  const q = unreadOnly ? "?unread_only=1" : "";
  return apiFetch<NotificationsResponse>(`/notifications${q}`);
}

export async function markNotificationRead(
  id: string,
): Promise<ApiResult<{ notification: AppNotification; unread_count: number }>> {
  return apiFetch<{ notification: AppNotification; unread_count: number }>(
    `/notifications/${encodeURIComponent(id)}/read`,
    { method: "POST" },
  );
}

export async function markAllNotificationsRead(): Promise<
  ApiResult<{ message: string; unread_count: number }>
> {
  return apiFetch<{ message: string; unread_count: number }>("/notifications/read-all", {
    method: "POST",
  });
}

export function formatNotificationTime(iso: string, lang: Lang = "ar") {
  const locale = lang === "ar" ? "ar-EG" : "en-US";
  try {
    return new Date(iso).toLocaleString(locale, {
      dateStyle: "short",
      timeStyle: "short",
    });
  } catch {
    return iso;
  }
}

export function localizedNotification(n: AppNotification, lang: Lang) {
  return getNotificationText(lang, n);
}
