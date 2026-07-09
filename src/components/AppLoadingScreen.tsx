import { BrandLogo } from "@/components/BrandLogo";

type Props = {
  message?: string;
};

export function AppLoadingScreen({ message = "جاري التحميل..." }: Props) {
  return (
    <div className="gc-loading-screen" role="status" aria-live="polite" aria-busy="true">
      <div className="gc-loading-screen-inner">
        <BrandLogo withLink={false} size="lg" showTitle showTagline />
        <div className="gc-loading-spinner" aria-hidden />
        <p className="gc-loading-message">{message}</p>
      </div>
    </div>
  );
}
