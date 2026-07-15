import { apiFetch, type ApiResult } from "@/lib/api";
import type {
  ConsultationDetail,
  ConsultationListItem,
  ConsultationMessage,
  Paginated,
} from "./types";

export async function getMyConsultations(): Promise<ApiResult<Paginated<ConsultationListItem>>> {
  return apiFetch<Paginated<ConsultationListItem>>("/consultations");
}

export async function getConsultationDetail(
  id: number,
): Promise<ApiResult<{ consultation: ConsultationDetail }>> {
  return apiFetch<{ consultation: ConsultationDetail }>(`/consultations/${id}`);
}

export async function updateConsultation(
  id: number,
  questionText: string,
): Promise<ApiResult<{ consultation: ConsultationDetail }>> {
  return apiFetch<{ consultation: ConsultationDetail }>(`/consultations/${id}`, {
    method: "PATCH",
    body: JSON.stringify({ question_text: questionText }),
  });
}

export async function postConsultationMessage(
  id: number,
  body: string,
): Promise<
  ApiResult<{ message: ConsultationMessage; consultation: ConsultationDetail }>
> {
  return apiFetch<{ message: ConsultationMessage; consultation: ConsultationDetail }>(
    `/consultations/${id}/messages`,
    {
      method: "POST",
      body: JSON.stringify({ body }),
    },
  );
}

