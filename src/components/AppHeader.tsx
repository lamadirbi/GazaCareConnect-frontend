"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { BrandLogo } from "@/components/BrandLogo";
import { LogoutButton } from "@/components/LogoutButton";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import {
  PHYSICIAN_DASHBOARD_HOME,
  physicianDashboardSections,
  scrollToPhysicianSection,
} from "@/features/physician/physicianNav";
import { logoutAndRedirect } from "@/lib/auth";

type Props = {
  title: string;
  backHref?: string;
  showBack?: boolean;
  rightSlot?: React.ReactNode;
  userRole?: string | null;
  primaryAction?: React.ReactNode;
};

type NavItem = { href: string; label: string; sectionId?: string };

function dashboardNavItems(role: string): NavItem[] {
  if (role === "patient") {
    return [
      { href: "/dashboard", label: "لوحة التحكم" },
      { href: "/consultations", label: "الاستشارات" },
      { href: "/physicians", label: "الأطباء" },
      { href: "/profile", label: "الملف الطبي" },
    ];
  }
  if (role === "admin") {
    return [
      { href: "/admin/dashboard", label: "لوحة المدير" },
      { href: "/admin/users", label: "المستخدمون" },
      { href: "/admin/physicians", label: "توثيق الأطباء" },
    ];
  }
  if (role === "physician") {
    return [
      { href: PHYSICIAN_DASHBOARD_HOME, label: "لوحة الطبيب" },
      ...physicianDashboardSections.map((s) => ({
        href: s.href,
        label: s.label,
        sectionId: s.id,
      })),
    ];
  }
  return [];
}

function splitHref(href: string) {
  const [path, hash = ""] = href.split("#");
  return { path, hash };
}

function isNavActive(href: string, pathname: string, currentHash: string) {
  const { path, hash } = splitHref(href);

  if (hash) {
    return pathname === path && currentHash === hash;
  }

  if (path === PHYSICIAN_DASHBOARD_HOME) {
    return pathname === path && !currentHash;
  }

  if (path === "/dashboard" || path === "/admin/dashboard") {
    return pathname === path && !currentHash;
  }

  return pathname === path || pathname.startsWith(`${path}/`);
}

function dashboardHomeHref(role: string) {
  if (role === "admin") return "/admin/dashboard";
  if (role === "physician") return PHYSICIAN_DASHBOARD_HOME;
  return "/dashboard";
}

export function AppHeader({ title, backHref, showBack = true, rightSlot, userRole, primaryAction }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [currentHash, setCurrentHash] = useState("");
  const [backConfirming, setBackConfirming] = useState(false);

  const navItems = useMemo(
    () => (userRole ? dashboardNavItems(userRole) : []),
    [userRole],
  );

  const physicianSections = userRole === "physician" ? physicianDashboardSections : [];

  useEffect(() => {
    const syncHash = () => setCurrentHash(window.location.hash.replace(/^#/, ""));
    syncHash();
    window.addEventListener("hashchange", syncHash);
    return () => window.removeEventListener("hashchange", syncHash);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  function resolveBackTarget() {
    if (backHref) return backHref;
    if (userRole) return dashboardHomeHref(userRole);
    return "/";
  }

  function isHomepage(target: string) {
    return target.split("#")[0] === "/";
  }

  function goBack() {
    const target = resolveBackTarget();
    if (userRole && isHomepage(target)) {
      setBackConfirming(true);
      return;
    }
    router.push(target);
  }

  function confirmBackToHome() {
    setBackConfirming(false);
    logoutAndRedirect("/");
  }

  function cancelBack() {
    setBackConfirming(false);
  }

  function closeMenu() {
    setMenuOpen(false);
  }

  function handlePhysicianSectionNav(e: React.MouseEvent, item: NavItem) {
    if (!item.sectionId) return;
    const { path } = splitHref(item.href);
    if (pathname === path) {
      e.preventDefault();
      scrollToPhysicianSection(item.sectionId);
      window.history.replaceState(null, "", item.href);
      setCurrentHash(item.sectionId);
      closeMenu();
    } else {
      closeMenu();
    }
  }

  function renderSideNavLink(item: NavItem, onNavigate?: () => void) {
    const active = isNavActive(item.href, pathname, currentHash);
    return (
      <Link
        key={item.href}
        href={item.href}
        onClick={(e) => {
          handlePhysicianSectionNav(e, item);
          onNavigate?.();
        }}
        className={`gc-side-nav-link ${active ? "gc-side-nav-link-active" : ""}`}
      >
        {item.label}
      </Link>
    );
  }

  function renderTopNavLink(item: NavItem) {
    const active = isNavActive(item.href, pathname, currentHash);
    return (
      <Link
        key={item.href}
        href={item.href}
        onClick={(e) => handlePhysicianSectionNav(e, item)}
        className={`gc-top-nav-link ${active ? "gc-top-nav-link-active" : ""}`}
      >
        {item.label}
      </Link>
    );
  }

  const showMobileNav = !rightSlot && Boolean(userRole);
  const showDesktopNav = showMobileNav && navItems.length > 0;

  return (
    <header className="sticky top-0 z-30 overflow-visible border-b border-(--border) bg-(--surface) backdrop-blur">
      <div className="mx-auto flex w-full max-w-5xl items-center gap-2 px-4 py-3 lg:gap-3 lg:py-4">
        {showBack ? (
          <button
            type="button"
            onClick={goBack}
            className="gc-back-btn"
            aria-label="رجوع"
          >
            <span className="gc-back-btn-icon" aria-hidden>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path
                  d="M6.25 3.75L10.75 8L6.25 12.25"
                  stroke="currentColor"
                  strokeWidth="1.75"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
            <span className="gc-back-btn-label">رجوع</span>
          </button>
        ) : null}

        {showMobileNav ? (
          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            className="gc-nav-toggle lg:hidden"
            aria-label="فتح القائمة"
            aria-expanded={menuOpen}
          >
            <span className="gc-nav-toggle-bar" />
            <span className="gc-nav-toggle-bar" />
            <span className="gc-nav-toggle-bar" />
          </button>
        ) : null}

        <BrandLogo
          href={userRole ? dashboardHomeHref(userRole) : "/"}
          size="md"
          showTitle={false}
          className="shrink-0"
        />

        <div className="min-w-0 flex-1 truncate text-sm font-semibold text-foreground lg:text-base">
          {title}
        </div>

        {rightSlot ? (
          <div className="flex shrink-0 items-center gap-2">{rightSlot}</div>
        ) : (
          <div className="hidden shrink-0 items-center gap-2 lg:flex">
            {primaryAction ? <div>{primaryAction}</div> : null}
            {userRole ? <LogoutButton /> : null}
          </div>
        )}

        {showMobileNav ? (
          <div className="shrink-0 lg:hidden">
            <LogoutButton iconOnly />
          </div>
        ) : null}
      </div>

      {showDesktopNav ? (
        <div className="gc-top-nav hidden lg:block">
          <div className="mx-auto w-full max-w-5xl px-4">
            <nav className="gc-top-nav-inner" aria-label="تنقل لوحة التحكم">
              {navItems.map((item) => renderTopNavLink(item))}
            </nav>
          </div>
        </div>
      ) : null}

      {showMobileNav ? (
        <>
          <button
            type="button"
            aria-label="إغلاق القائمة"
            className={`gc-side-nav-backdrop lg:hidden ${menuOpen ? "gc-side-nav-backdrop-open" : ""}`}
            onClick={closeMenu}
            tabIndex={menuOpen ? 0 : -1}
          />

          <aside
            className={`gc-side-nav lg:hidden ${menuOpen ? "gc-side-nav-open" : ""}`}
            role="dialog"
            aria-modal="true"
            aria-label="قائمة لوحة التحكم"
            aria-hidden={!menuOpen}
          >
            <div className="flex items-center justify-between border-b border-(--border) px-5 py-4">
              <Link href={dashboardHomeHref(userRole!)} onClick={closeMenu} className="inline-flex min-w-0">
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
              {userRole === "physician" ? (
                <>
                  <div className="gc-section-label mb-2 px-1">لوحة الطبيب</div>
                  {renderSideNavLink(
                    { href: PHYSICIAN_DASHBOARD_HOME, label: "الرئيسية" },
                    closeMenu,
                  )}

                  <div className="gc-section-label mb-2 mt-4 px-1">أقسام الحالات</div>
                  {physicianSections.map((section) =>
                    renderSideNavLink(
                      {
                        href: section.href,
                        label: section.label,
                        sectionId: section.id,
                      },
                      closeMenu,
                    ),
                  )}
                </>
              ) : (
                <>
                  <div className="gc-section-label mb-2 px-1">التنقل</div>
                  {primaryAction ? <div className="mb-2">{primaryAction}</div> : null}
                  {navItems.map((item) => renderSideNavLink(item, closeMenu))}
                </>
              )}
            </nav>

            <div className="mt-auto border-t border-(--border) p-4">
              <LogoutButton className="w-full" />
            </div>
          </aside>
        </>
      ) : null}

      <ConfirmModal
        open={backConfirming}
        title="تسجيل الخروج"
        message="العودة للصفحة الرئيسية تتطلّب تسجيل الخروج. هل تريد المتابعة؟"
        confirmLabel="نعم، خروج"
        cancelLabel="إلغاء"
        onConfirm={confirmBackToHome}
        onClose={cancelBack}
      />
    </header>
  );
}
