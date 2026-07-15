"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { BrandLogo } from "@/components/BrandLogo";

const navLinks = [
  { href: "#services", label: "الخدمات" },
  { href: "#how", label: "كيف تعمل" },
  { href: "#faq", label: "أسئلة شائعة" },
] as const;

function LoginIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
    >
      <path
        d="M15.75 7.5a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M4.5 19.5a7.5 7.5 0 0 1 15 0"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function LandingHeader() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  function closeMenu() {
    setOpen(false);
  }

  return (
    <header className="sticky top-0 z-30 border-b border-(--border) bg-[color-mix(in_srgb,var(--surface-2)_93%,transparent)] backdrop-blur-sm">
      <div className="mx-auto w-full max-w-6xl px-4 py-3">
        {/* شريط الموبايل والتابلت */}
        <div className="flex items-center justify-between gap-2 lg:hidden">
          <BrandLogo href="/" size="md" showTitle showTagline className="min-w-0 gap-2" />

          <div className="flex shrink-0 items-center gap-1.5">
            <Link
              href="/login"
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-(--border) bg-(--surface) text-foreground transition hover:bg-(--surface-2)"
              aria-label="تسجيل الدخول"
              title="تسجيل الدخول"
            >
              <LoginIcon />
            </Link>
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="gc-nav-toggle"
              aria-label="فتح القائمة"
              aria-expanded={open}
            >
              <span className="gc-nav-toggle-bar" />
              <span className="gc-nav-toggle-bar" />
              <span className="gc-nav-toggle-bar" />
            </button>
          </div>
        </div>

        {/* شريط سطح المكتب */}
        <div className="hidden lg:flex lg:items-center lg:justify-between lg:gap-4">
          <BrandLogo href="/" size="lg" showTitle showTagline className="gap-3" />

          <nav className="flex items-center gap-2">
            {navLinks.map((link) => (
              <a key={link.href} href={link.href} className="gc-pill-btn gc-pill-btn-outline h-9 text-sm">
                {link.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <Link href="/register" className="gc-pill-btn gc-pill-btn-outline text-sm">
              إنشاء حساب
            </Link>
            <Link href="/login" className="gc-pill-btn gc-pill-btn-solid text-sm">
              تسجيل الدخول
            </Link>
          </div>
        </div>
      </div>

      {/* خلفية معتمة */}
      <button
        type="button"
        aria-label="إغلاق القائمة"
        className={`gc-side-nav-backdrop ${open ? "gc-side-nav-backdrop-open" : ""}`}
        onClick={closeMenu}
        tabIndex={open ? 0 : -1}
      />

      {/* القائمة الجانبية */}
      <aside
        className={`gc-side-nav ${open ? "gc-side-nav-open" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-label="قائمة التنقل"
        aria-hidden={!open}
      >
        <div className="flex items-center justify-between border-b border-(--border) px-5 py-4">
          <Link href="/" onClick={closeMenu} className="inline-flex min-w-0">
            <BrandLogo withLink={false} size="md" showTitle />
          </Link>
          <button
            type="button"
            onClick={closeMenu}
            className="gc-side-nav-close"
            aria-label="إغلاق القائمة"
          >
            ×
          </button>
        </div>

        <nav className="flex flex-col gap-1 p-4">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={closeMenu}
              className="gc-side-nav-link"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="mt-auto border-t border-(--border) p-4">
          <div className="grid gap-2">
            <Link href="/login" onClick={closeMenu} className="gc-btn gc-btn-primary w-full">
              تسجيل الدخول
            </Link>
            <Link
              href="/register"
              onClick={closeMenu}
              className="gc-btn gc-btn-secondary w-full"
            >
              إنشاء حساب
            </Link>
          </div>
        </div>
      </aside>
    </header>
  );
}
