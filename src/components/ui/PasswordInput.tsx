"use client";

import { useState } from "react";
import { FaIcon } from "@/components/FaIcon";
import { cn } from "@/lib/cn";

type Props = Omit<React.InputHTMLAttributes<HTMLInputElement>, "type">;

export function PasswordInput({ className, ...props }: Props) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative">
      <input
        {...props}
        type={visible ? "text" : "password"}
        className={cn(
          "h-11 w-full rounded-xl border border-(--border) bg-(--surface) px-3 pe-10 text-sm text-zinc-900 outline-none focus:ring-2 focus:ring-(--ring)",
          className,
        )}
      />
      <button
        type="button"
        tabIndex={-1}
        onClick={() => setVisible((v) => !v)}
        className="absolute inset-y-0 end-2 flex items-center rounded-lg px-2 text-(--muted) transition hover:text-foreground"
        aria-label={visible ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"}
      >
        <FaIcon icon={visible ? "eye-slash" : "eye"} className="text-sm" />
      </button>
    </div>
  );
}
