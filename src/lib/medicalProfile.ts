export function genderLabel(value: string | null | undefined) {
  if (value === "male") return "ذكر";
  if (value === "female") return "أنثى";
  return "غير محدد";
}
