"use client";

import { BrandLogo } from "@/components/BrandLogo";
import { useLang } from "@/lib/i18n";

type Props = {
  message?: string;
};

export function AppLoadingScreen({ message }: Props) {
  const { t } = useLang();

  return (
    <div className="gc-loading-screen" role="status" aria-live="polite" aria-busy="true">
      <div className="gc-loading-screen-inner">
        <BrandLogo withLink={false} size="lg" showTitle showTagline />
        <div className="gc-loading-spinner" aria-hidden />
        <p className="gc-loading-message">{message ?? t("loading")}</p>
      </div>
    </div>
  );
}
