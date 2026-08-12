"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { BrandLogo } from "@/components/BrandLogo";
import { FaIcon } from "@/components/FaIcon";
import { LanguageToggle } from "@/components/LanguageToggle";
import { useLang } from "@/lib/i18n";

export function LandingHeader() {
  const { t } = useLang();
  const [open, setOpen] = useState(false);

  const navLinks = [
    { href: "#how", label: t("howItWorks") },
    { href: "#services", label: t("services") },
    { href: "#faq", label: t("faq") },
  ];

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
        {/* Mobile / tablet bar */}
        <div className="flex items-center justify-between gap-2 lg:hidden">
          <BrandLogo href="/" size="md" showTitle showTagline className="min-w-0 gap-2" />

          <div className="flex shrink-0 items-center gap-1.5">
            <LanguageToggle />
            <Link
              href="/login"
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-(--border) bg-(--surface) text-foreground transition hover:bg-(--surface-2)"
              aria-label={t("loginFull")}
              title={t("loginFull")}
            >
              <FaIcon icon="user" className="text-base" />
            </Link>
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="gc-nav-toggle"
              aria-label={t("navOpenMenu")}
              aria-expanded={open}
            >
              <FaIcon icon="bars" className="text-base" />
            </button>
          </div>
        </div>

        {/* Desktop bar */}
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
            <LanguageToggle />
            <Link href="/register" className="gc-pill-btn gc-pill-btn-outline text-sm">
              {t("createAccount")}
            </Link>
            <Link href="/login" className="gc-pill-btn gc-pill-btn-solid text-sm">
              {t("loginFull")}
            </Link>
          </div>
        </div>
      </div>

      {/* Backdrop */}
      <button
        type="button"
        aria-label={t("navCloseMenu")}
        className={`gc-side-nav-backdrop ${open ? "gc-side-nav-backdrop-open" : ""}`}
        onClick={closeMenu}
        tabIndex={open ? 0 : -1}
      />

      {/* Side drawer */}
      <aside
        className={`gc-side-nav ${open ? "gc-side-nav-open" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-label={t("navSidebarLabel")}
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
            aria-label={t("navCloseMenu")}
          >
            <FaIcon icon="xmark" />
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
              {t("loginFull")}
            </Link>
            <Link
              href="/register"
              onClick={closeMenu}
              className="gc-btn gc-btn-secondary w-full"
            >
              {t("createAccount")}
            </Link>
            <LanguageToggle className="w-full justify-center" />
          </div>
        </div>
      </aside>
    </header>
  );
}
