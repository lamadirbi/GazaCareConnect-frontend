"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { PhysicianPhotoBox } from "@/features/physician/components/PhysicianPhotoBox";
import type { ConsultationMessage } from "../types";
import { useLang } from "@/lib/i18n";

type Props = {
  messages: ConsultationMessage[];
  canReply: boolean;
  physicianPhotoFileId?: number | null;
  physicianName?: string | null;
  replyPlaceholder?: string;
  submitting?: boolean;
  onSubmitReply?: (body: string) => Promise<void> | void;
};

function formatTime(iso: string, locale: string) {
  try {
    return new Date(iso).toLocaleString(locale, {
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
  physicianPhotoFileId,
  physicianName,
  replyPlaceholder,
  submitting = false,
  onSubmitReply,
}: Props) {
  const { t, lang } = useLang();
  const [draft, setDraft] = useState("");
  const [localError, setLocalError] = useState<string | null>(null);
  const locale = lang === "ar" ? "ar-EG" : "en-US";
  const placeholder = replyPlaceholder ?? t("replyPlaceholder");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const body = draft.trim();
    if (body.length < 2) {
      setLocalError(t("replyTooShort"));
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
        <div className="gc-section-label">{t("conversation")}</div>
        <p className="mt-1 text-xs text-(--muted)">{t("conversationDesc")}</p>
      </div>

      <div className="grid gap-3">
        {messages.length === 0 ? (
          <p className="text-sm text-(--muted)">{t("noMessagesYet")}</p>
        ) : (
          messages.map((m) => {
            const isPhysician = m.sender_role === "physician";
            return (
              <div
                key={m.id}
                className={`rounded-2xl border px-4 py-3 ${
                  isPhysician
                    ? "border-emerald-200/80 bg-emerald-50/80"
                    : "border-(--border) bg-(--surface-2)"
                }`}
              >
                <div className="flex items-start gap-3">
                  {isPhysician ? (
                    <PhysicianPhotoBox
                      fileId={physicianPhotoFileId}
                      alt={physicianName ?? m.sender?.name ?? t("doctorRole")}
                      size="md"
                    />
                  ) : null}
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                      <span
                        className={`font-semibold ${
                          isPhysician ? "text-emerald-800" : "text-foreground"
                        }`}
                      >
                        {isPhysician ? t("doctorRole") : t("patientRole")}
                        {m.sender?.name ? ` — ${m.sender.name}` : ""}
                      </span>
                      <span className="text-(--muted)" dir="ltr">
                        {formatTime(m.created_at, locale)}
                      </span>
                    </div>
                    <p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-foreground">
                      {m.body}
                    </p>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {canReply && onSubmitReply ? (
        <form onSubmit={handleSubmit} className="grid gap-2">
          <label className="text-sm font-medium text-foreground" htmlFor="consultation-reply">
            {t("followUpReplyLabel")}
          </label>
          <textarea
            id="consultation-reply"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            rows={4}
            placeholder={placeholder}
            className="w-full rounded-xl border border-(--border) bg-(--surface) px-3 py-2 text-sm leading-6 outline-none focus:ring-2 focus:ring-(--ring)"
            disabled={submitting}
          />
          {localError ? <p className="text-sm text-red-600">{localError}</p> : null}
          <div>
            <Button type="submit" size="sm" disabled={submitting}>
              {submitting ? t("sendingReply") : t("sendReply")}
            </Button>
          </div>
        </form>
      ) : null}
    </div>
  );
}
