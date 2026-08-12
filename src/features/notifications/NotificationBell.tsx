"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  fetchNotifications,
  formatNotificationTime,
  localizedNotification,
  markAllNotificationsRead,
  markNotificationRead,
  type AppNotification,
} from "@/lib/notifications";
import { FaIcon } from "@/components/FaIcon";
import { useLang } from "@/lib/i18n";

export function NotificationBell() {
  const { t, lang } = useLang();
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<AppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    const res = await fetchNotifications();
    setLoading(false);
    if (!res.ok) return;
    setItems(res.data.data ?? []);
    setUnreadCount(res.data.unread_count ?? 0);
  }, []);

  useEffect(() => {
    refresh();
    const timer = window.setInterval(refresh, 45000);
    const onFocus = () => refresh();
    window.addEventListener("focus", onFocus);
    return () => {
      window.clearInterval(timer);
      window.removeEventListener("focus", onFocus);
    };
  }, [refresh]);

  useEffect(() => {
    if (!open) return;
    function onDocClick(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const root = rootRef.current;
    const btn = root?.querySelector(".gc-notif-bell-btn");
    if (!root || !(btn instanceof HTMLElement)) return;

    const place = () => {
      const rect = btn.getBoundingClientRect();
      root.style.setProperty("--gc-notif-top", `${Math.round(rect.bottom + 8)}px`);
    };

    place();
    window.addEventListener("resize", place);
    window.addEventListener("scroll", place, true);
    return () => {
      window.removeEventListener("resize", place);
      window.removeEventListener("scroll", place, true);
    };
  }, [open]);

  async function handleItemClick(n: AppNotification) {
    if (!n.read_at) {
      const res = await markNotificationRead(n.id);
      if (res.ok) setUnreadCount(res.data.unread_count);
      setItems((prev) =>
        prev.map((x) => (x.id === n.id ? { ...x, read_at: new Date().toISOString() } : x)),
      );
    }
    setOpen(false);
  }

  async function handleMarkAll() {
    const res = await markAllNotificationsRead();
    if (!res.ok) return;
    setUnreadCount(0);
    setItems((prev) => prev.map((x) => ({ ...x, read_at: x.read_at ?? new Date().toISOString() })));
  }

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => {
          setOpen((v) => !v);
          if (!open) refresh();
        }}
        className="gc-notif-bell-btn"
        aria-label={t("notifications")}
        aria-expanded={open}
        title={t("notifications")}
      >
        <FaIcon icon="bell" className="text-base" />
        {unreadCount > 0 ? (
          <span className="gc-notif-badge" aria-hidden>
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        ) : null}
      </button>

      {open ? (
        <div className="gc-notif-panel" role="dialog" aria-label={t("notificationsList")}>
          <div className="gc-notif-panel-head">
            <span className="text-sm font-semibold text-foreground">{t("notifications")}</span>
            {unreadCount > 0 ? (
              <button type="button" onClick={handleMarkAll} className="gc-notif-mark-all">
                {t("markAllRead")}
              </button>
            ) : null}
          </div>

          <div className="gc-notif-panel-body">
            {loading && items.length === 0 ? (
              <p className="px-4 py-6 text-center text-xs text-(--muted)">{t("loading")}</p>
            ) : items.length === 0 ? (
              <p className="px-4 py-6 text-center text-xs text-(--muted)">{t("noNotifications")}</p>
            ) : (
              <ul className="divide-y divide-(--border)">
                {items.map((n) => {
                  const text = localizedNotification(n, lang);
                  return (
                  <li key={n.id}>
                    <Link
                      href={n.href || "/"}
                      onClick={() => handleItemClick(n)}
                      className={`gc-notif-item ${n.read_at ? "gc-notif-item-read" : ""}`}
                    >
                      <div className="font-medium text-foreground">{text.title}</div>
                      <div className="mt-0.5 text-xs leading-5 text-(--muted)">{text.body}</div>
                      <div className="mt-1 text-[10px] text-(--muted)" dir="ltr">
                        {formatNotificationTime(n.created_at, lang)}
                      </div>
                    </Link>
                  </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
