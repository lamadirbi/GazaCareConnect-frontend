"use client";

import { useEffect, useState } from "react";
import { apiFetch, getToken, setToken } from "@/lib/api";

export type MeUser = {
  id: number;
  name: string;
  email: string;
  role: string;
  is_disabled?: boolean;
  physician_profile?: {
    specialty: string;
    certificate: string;
    verification_status?: string;
    rejection_reason?: string | null;
  } | null;
  physicianProfile?: {
    specialty: string;
    certificate: string;
    verification_status?: string;
    rejection_reason?: string | null;
  } | null;
};
type MeResponse = { user: MeUser };

let sessionUser: MeUser | null = null;

export function getAuthSession() {
  return sessionUser;
}

export function setAuthSession(user: MeUser | null) {
  sessionUser = user;
}

export function clearAuthSession() {
  sessionUser = null;
}

export function logoutAndRedirect(to = "/login") {
  setToken(null);
  clearAuthSession();
  window.location.href = to;
}

export function routeForRole(role: string | undefined | null) {
  if (role === "physician") return "/physician/dashboard";
  if (role === "admin") return "/admin/dashboard";
  return "/dashboard";
}

export function physicianProfileOf(user: MeUser | null | undefined) {
  return user?.physician_profile ?? user?.physicianProfile ?? null;
}

export function isVerifiedPhysician(user: MeUser | null | undefined) {
  const profile = physicianProfileOf(user);
  return profile?.verification_status === "approved";
}

export function useRequireAuth(options?: {
  allowedRoles?: string[];
  redirectTo?: string;
}) {
  const redirectTo = options?.redirectTo ?? "/login";
  const allowedRoles = options?.allowedRoles;

  const [user, setUser] = useState<MeUser | null>(sessionUser);
  const [loading, setLoading] = useState(() => {
    if (sessionUser) return false;
    if (typeof window === "undefined") return true;
    return Boolean(getToken());
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const token = getToken();
    if (!token) {
      clearAuthSession();
      setToken(null);
      window.location.href = redirectTo;
      return;
    }

    if (sessionUser) {
      if (allowedRoles && !allowedRoles.includes(sessionUser.role)) {
        window.location.href = routeForRole(sessionUser.role);
        return;
      }
      setUser(sessionUser);
      setLoading(false);
    }

    apiFetch<MeResponse>("/auth/me")
      .then((res) => {
        if (!mounted) return;

        if (!res.ok) {
          clearAuthSession();
          setToken(null);
          window.location.href = redirectTo;
          return;
        }

        const u = res.data.user;
        if (allowedRoles && !allowedRoles.includes(u.role)) {
          window.location.href = routeForRole(u.role);
          return;
        }

        setAuthSession(u);
        setUser(u);
        setLoading(false);
      })
      .catch(() => {
        if (!mounted) return;
        if (!sessionUser) {
          setLoading(false);
          setError("فشل التحقق من الجلسة");
          return;
        }
        setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [allowedRoles, redirectTo]);

  return { user, loading, error };
}

