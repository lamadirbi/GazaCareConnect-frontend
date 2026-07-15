import { apiFetch, type ApiResult } from "@/lib/api";

const GENERIC_RESET_MESSAGE =
  "إذا كان البريد مسجّلاً، أُرسلت تعليمات إعادة التعيين.";

export type ForgotPasswordResponse = {
  message: string;
  demo_reset_token?: string;
  demo_reset_url?: string;
};

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

export { GENERIC_RESET_MESSAGE };
