type Props = {
  age: number | null | undefined;
  emptyLabel?: string;
};

export function AgeValue({ age, emptyLabel = "غير محدد" }: Props) {
  if (age == null) return <>{emptyLabel}</>;

  return (
    <span className="inline-flex items-center gap-1" dir="rtl">
      <span dir="ltr">{age}</span>
      <span>سنة</span>
    </span>
  );
}
