import { apiFetch, type ApiResult } from "@/lib/api";

const MOCK_MODE = process.env.NEXT_PUBLIC_MOCK_API === "true";

export type ForgotPasswordResponse = {
  message: string;
  demo_reset_token?: string;
  demo_reset_url?: string;
};

export type ForgotPasswordSuccessView = {
  variant: "success" | "info";
  message: string;
  showDemoDetails: boolean;
};

export function getForgotPasswordFormHint(): string {
  if (MOCK_MODE) {
    return "في النسخة التجريبية لا نُرسل بريداً حقيقياً. أدخل بريد حساب تجريبي وسيظهر رابط إعادة التعيين هنا مباشرة.";
  }
  return "أدخل بريدك الإلكتروني. إذا كان مسجّلاً لدينا سنرسل إليه رابط إعادة تعيين كلمة المرور.";
}

export function getForgotPasswordSuccessView(
  demoToken: string | null,
  demoUrl: string | null,
): ForgotPasswordSuccessView {
  if (MOCK_MODE) {
    if (demoToken || demoUrl) {
      return {
        variant: "success",
        message:
          "تم تجهيز رابط إعادة التعيين. في النسخة التجريبية لا يُرسل بريد حقيقي — استخدم الرابط أو الرمز أدناه.",
        showDemoDetails: true,
      };
    }
    return {
      variant: "info",
      message:
        "لم يُعثر على بريد مسجّل بهذا الاسم. جرّب أحد حسابات «دخول سريع» من صفحة تسجيل الدخول (مثل sara.ahmad@gazacare.ps).",
      showDemoDetails: false,
    };
  }

  const isLocal =
    typeof window !== "undefined" &&
    (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1");

  let message =
    "إذا كان بريدك مسجّلاً لدينا، أرسلنا إليه رسالة تحتوي رابط إعادة تعيين كلمة المرور. راجعي صندوق الوارد والرسائل غير المرغوب فيها.";

  if (isLocal) {
    message +=
      " على السيرفر المحلي: إن لم يصل بريد، ابحثي عن الرابط في ملف storage/logs/laravel.log.";
  }

  return {
    variant: "success",
    message,
    showDemoDetails: !!(demoToken || demoUrl),
  };
}

export type ResetPasswordPayload = {
  email: string;
  token: string;
  password: string;
  password_confirmation: string;
};

export type ChangePasswordPayload = {
  current_password: string;
  password: string;
  password_confirmation: string;
};

export async function requestPasswordReset(
  email: string,
): Promise<ApiResult<ForgotPasswordResponse>> {
  return apiFetch<ForgotPasswordResponse>("/auth/forgot-password", {
    method: "POST",
    body: JSON.stringify({ email: email.trim().toLowerCase() }),
    auth: false,
  });
}

export async function resetPassword(
  payload: ResetPasswordPayload,
): Promise<ApiResult<{ message: string }>> {
  return apiFetch<{ message: string }>("/auth/reset-password", {
    method: "POST",
    body: JSON.stringify({
      ...payload,
      email: payload.email.trim().toLowerCase(),
    }),
    auth: false,
  });
}

export async function changePassword(
  payload: ChangePasswordPayload,
): Promise<ApiResult<{ message: string }>> {
  return apiFetch<{ message: string }>("/auth/change-password", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
