"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import type { ConsultationMessage } from "../types";

type Props = {
  messages: ConsultationMessage[];
  canReply: boolean;
  replyPlaceholder?: string;
  submitting?: boolean;
  onSubmitReply?: (body: string) => Promise<void> | void;
};

function formatTime(iso: string) {
  try {
    return new Date(iso).toLocaleString("ar-EG", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  } catch {
    return iso;
  }
}

export function ConsultationThread({
  messages,
  canReply,
  replyPlaceholder = "اكتب ردك هنا...",
  submitting = false,
  onSubmitReply,
}: Props) {
  const [draft, setDraft] = useState("");
  const [localError, setLocalError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const body = draft.trim();
    if (body.length < 2) {
      setLocalError("الرد قصير جداً.");
      return;
    }
    if (!onSubmitReply) return;
    setLocalError(null);
    await onSubmitReply(body);
    setDraft("");
  }

  if (!messages.length && !canReply) return null;

  return (
    <div className="grid gap-4">
      <div>
        <div className="gc-section-label">المحادثة</div>
        <p className="mt-1 text-xs text-(--muted)">ردود الاستشارة بين المراجع والطبيب</p>
      </div>

      <div className="grid gap-3">
        {messages.length === 0 ? (
          <p className="text-sm text-(--muted)">لا توجد رسائل بعد.</p>
        ) : (
          messages.map((m) => {
            const isPhysician = m.sender_role === "physician";
            return (
              <div
                key={m.id}
                className={`rounded-2xl border px-4 py-3 ${
                  isPhysician
                    ? "border-emerald-200/80 bg-emerald-50/80 dark:border-emerald-900/40 dark:bg-emerald-950/40"
                    : "border-(--border) bg-(--surface-2)"
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                  <span
                    className={`font-semibold ${
                      isPhysician
                        ? "text-emerald-800 dark:text-emerald-200"
                        : "text-foreground"
                    }`}
                  >
                    {isPhysician ? "الطبيب" : "المراجع"}
                    {m.sender?.name ? ` — ${m.sender.name}` : ""}
                  </span>
                  <span className="text-(--muted)" dir="ltr">
                    {formatTime(m.created_at)}
                  </span>
                </div>
                <p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-foreground">
                  {m.body}
                </p>
              </div>
            );
          })
        )}
      </div>

      {canReply && onSubmitReply ? (
        <form onSubmit={handleSubmit} className="grid gap-2">
          <label className="text-sm font-medium text-foreground" htmlFor="consultation-reply">
            متابعة الرد
          </label>
          <textarea
            id="consultation-reply"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            rows={4}
            placeholder={replyPlaceholder}
            className="w-full rounded-xl border border-(--border) bg-(--surface) px-3 py-2 text-sm leading-6 outline-none focus:ring-2 focus:ring-(--ring)"
            disabled={submitting}
          />
          {localError ? <p className="text-sm text-red-600">{localError}</p> : null}
          <div>
            <Button type="submit" size="sm" disabled={submitting}>
              {submitting ? "جاري الإرسال..." : "إرسال الرد"}
            </Button>
          </div>
        </form>
      ) : null}
    </div>
  );
}
