"use client";

import { AppLoadingScreen } from "@/components/AppLoadingScreen";

type Props = {
  loading: boolean;
  message?: string;
  children: React.ReactNode;
};

export function PageLoadingGate({ loading, message, children }: Props) {
  if (loading) return <AppLoadingScreen message={message} />;
  return <>{children}</>;
}
