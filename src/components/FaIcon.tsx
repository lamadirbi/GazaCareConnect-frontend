type Props = {
  icon: string;
  className?: string;
  /** solid (default) | regular | brands */
  variant?: "solid" | "regular" | "brands";
};

export function FaIcon({ icon, className, variant = "solid" }: Props) {
  const prefix = variant === "brands" ? "fa-brands" : variant === "regular" ? "fa-regular" : "fa-solid";
  return <i className={`${prefix} fa-${icon} ${className ?? ""}`.trim()} aria-hidden />;
}
