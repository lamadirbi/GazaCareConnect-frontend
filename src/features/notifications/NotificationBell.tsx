"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  fetchNotifications,
  formatNotificationTime,
  markAllNotificationsRead,
  markNotificationRead,
  type AppNotification,
} from "@/lib/notifications";

function BellIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 3.75a4.25 4.25 0 0 0-4.25 4.25v1.9c0 .98-.39 1.92-1.09 2.61L5.4 14.8A1.5 1.5 0 0 0 6.6 17.25h10.8a1.5 1.5 0 0 0 1.2-2.45l-1.26-2.29a3.7 3.7 0 0 1-1.09-2.61V8c0-2.35-1.9-4.25-4.25-4.25Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M9.75 17.25a2.25 2.25 0 0 0 4.5 0"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function NotificationBell() {
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
        aria-label="الإشعارات"
        aria-expanded={open}
        title="الإشعارات"
      >
        <BellIcon />
        {unreadCount > 0 ? (
          <span className="gc-notif-badge" aria-hidden>
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        ) : null}
      </button>

      {open ? (
        <div className="gc-notif-panel" role="dialog" aria-label="قائمة الإشعارات">
          <div className="gc-notif-panel-head">
            <span className="text-sm font-semibold text-foreground">الإشعارات</span>
            {unreadCount > 0 ? (
              <button type="button" onClick={handleMarkAll} className="gc-notif-mark-all">
                تعليم الكل كمقروء
              </button>
            ) : null}
          </div>

          <div className="gc-notif-panel-body">
            {loading && items.length === 0 ? (
              <p className="px-4 py-6 text-center text-xs text-(--muted)">جاري التحميل...</p>
            ) : items.length === 0 ? (
              <p className="px-4 py-6 text-center text-xs text-(--muted)">لا توجد إشعارات.</p>
            ) : (
              <ul className="divide-y divide-(--border)">
                {items.map((n) => (
                  <li key={n.id}>
                    <Link
                      href={n.href || "/"}
                      onClick={() => handleItemClick(n)}
                      className={`gc-notif-item ${n.read_at ? "gc-notif-item-read" : ""}`}
                    >
                      <div className="font-medium text-foreground">{n.title}</div>
                      <div className="mt-0.5 text-xs leading-5 text-(--muted)">{n.body}</div>
                      <div className="mt-1 text-[10px] text-(--muted)" dir="ltr">
                        {formatNotificationTime(n.created_at)}
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
