export type ConsultationStatus = "pending" | "completed";

export type Paginated<T> = {
  data: T[];
  current_page?: number;
  last_page?: number;
};

export type MedicalFile = {
  id: number;
  original_name: string;
  mime_type: string | null;
  size_bytes: number | null;
  file_kind: string;
  created_at: string;
};

export type CertificateFileRef = {
  id: number;
  original_name: string;
  mime_type: string | null;
  file_kind: string;
  size_bytes?: number | null;
};

export type PhysicianProfileData = {
  specialty: string;
  certificate: string;
  certificate_file_id?: number | null;
  certificate_file_ids?: number[];
  certificateFile?: CertificateFileRef | null;
  certificate_file?: CertificateFileRef | null;
  certificateFiles?: CertificateFileRef[] | null;
  certificate_files?: CertificateFileRef[] | null;
};

export type ConsultationListItem = {
  id: number;
  question_text: string;
  status: ConsultationStatus;
  submitted_at: string;
  responded_at?: string | null;
  physician_response?: string | null;
  physician_id?: number | null;
  assignment_mode?: "queue" | "direct";
  physician?: {
    id: number;
    name: string;
    role?: string;
  } | null;
};

export type ConsultationMessage = {
  id: number;
  consultation_id?: number;
  sender_id?: number;
  sender_role: "patient" | "physician";
  body: string;
  created_at: string;
  sender?: {
    id: number;
    name: string;
    role?: string;
  } | null;
};

export type ConsultationDetail = ConsultationListItem & {
  physician?: {
    id: number;
    name: string;
    role: string;
    physicianProfile?: PhysicianProfileData | null;
    physician_profile?: PhysicianProfileData | null;
  } | null;
  medical_files?: MedicalFile[];
  messages?: ConsultationMessage[];
};

