"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { apiFetch, setToken } from "@/lib/api";
import { routeForRole, setAuthSession, type MeUser } from "@/lib/auth";
import { uploadMedicalFiles } from "@/lib/medicalFiles";
import { Card, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { BrandLogo } from "@/components/BrandLogo";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { LocalFilePicker } from "@/components/ui/LocalFilePicker";
import { ImageCropModal } from "@/components/ui/ImageCropModal";
import { PhysicianPhotoBox } from "@/features/physician/components/PhysicianPhotoBox";
import { SelectedLocalFilesList } from "@/features/consultations";
import { LanguageToggle } from "@/components/LanguageToggle";
import { useLang } from "@/lib/i18n";

type RegisterResponse = {
  user: { id: number; name: string; email: string; role: string };
  token: string;
};

export default function RegisterPage() {
  const { t } = useLang();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState<"patient" | "physician">("patient");
  const [password, setPassword] = useState("");
  const [physicianSpecialty, setPhysicianSpecialty] = useState("");
  const [physicianCertificate, setPhysicianCertificate] = useState("");
  const [certificateFiles, setCertificateFiles] = useState<File[]>([]);
  const [profilePhotoFile, setProfilePhotoFile] = useState<File | null>(null);
  const [profilePhotoPreview, setProfilePhotoPreview] = useState<string | null>(null);
  const [cropFile, setCropFile] = useState<File | null>(null);
  const [cropOpen, setCropOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isPhysician = role === "physician";

  const passwordHint = useMemo(() => {
    if (!password) return null;
    if (password.length < 8) return t("passwordTooShort");
    return null;
  }, [password, t]);

  const canSubmitPhysician = useMemo(() => {
    if (!isPhysician) return true;
    return (
      physicianSpecialty.trim().length > 0 &&
      physicianCertificate.trim().length > 0 &&
      certificateFiles.length > 0 &&
      profilePhotoFile !== null &&
      password.length >= 8
    );
  }, [isPhysician, physicianSpecialty, physicianCertificate, certificateFiles.length, profilePhotoFile, password.length]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (isPhysician && !profilePhotoFile) {
      setLoading(false);
      setError(t("photoRequired"));
      return;
    }

    if (isPhysician && certificateFiles.length === 0) {
      setLoading(false);
      setError(t("certRequired"));
      return;
    }

    const res = await apiFetch<RegisterResponse>("/auth/register", {
      method: "POST",
      body: JSON.stringify({
        name,
        email: email.trim().toLowerCase(),
        phone: phone || undefined,
        role,
        password,
        physician_specialty: isPhysician ? physicianSpecialty : undefined,
        physician_certificate: isPhysician ? physicianCertificate : undefined,
      }),
      auth: false,
    });

    if (!res.ok) {
      setLoading(false);
      setError(res.message);
      return;
    }

    setToken(res.data.token);
    setAuthSession(res.data.user as MeUser);

    if (isPhysician && (certificateFiles.length > 0 || profilePhotoFile)) {
      setUploading(true);
      const filesToUpload = [
        ...(profilePhotoFile ? [profilePhotoFile] : []),
        ...certificateFiles,
      ];
      const uploadRes = await uploadMedicalFiles(filesToUpload);
      setUploading(false);

      if (!uploadRes.ok) {
        setLoading(false);
        setError(uploadRes.message);
        window.location.href = routeForRole(res.data.user.role);
        return;
      }

      const uploaded = uploadRes.data.files;
      const photoFileId = profilePhotoFile ? uploaded[0]?.id ?? null : null;
      const certUploaded = profilePhotoFile ? uploaded.slice(1) : uploaded;
      const fileIds = certUploaded.map((f) => f.id);
      const profileRes = await apiFetch("/physician-profile", {
        method: "PUT",
        body: JSON.stringify({
          specialty: physicianSpecialty,
          certificate: physicianCertificate,
          certificate_file_ids: fileIds,
          profile_photo_file_id: photoFileId,
        }),
      });

      if (!profileRes.ok) {
        setLoading(false);
        setError(profileRes.message);
        window.location.href = routeForRole(res.data.user.role);
        return;
      }
    }

    setLoading(false);
    window.location.href = routeForRole(res.data.user.role);
  }

  const roles = [
    { value: "patient" as const, label: t("rolePatient") },
    { value: "physician" as const, label: t("rolePhysician") },
  ];

  return (
    <div className="relative flex flex-1 items-center justify-center bg-zinc-50 px-4 py-10">
      <div className="absolute inset-0 -z-10">
        <div className="absolute -top-24 right-1/2 h-72 w-72 translate-x-1/2 rounded-full bg-teal-200/30 blur-3xl" />
        <div className="absolute -top-12 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-indigo-200/40 blur-3xl" />
      </div>
      <main className="w-full max-w-md">
        <div className="mb-4 flex items-center justify-between gap-2">
          <BrandLogo href="/" size="xl" showTitle showTagline />
          <div className="flex shrink-0 items-center gap-2">
            <LanguageToggle />
            <Link
              href="/"
              className="rounded-lg px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-100"
            >
              {t("backToHome")}
            </Link>
          </div>
        </div>

        <Card>
          <CardBody>
            <h1 className="text-xl font-semibold text-zinc-900">
              {t("registerPageTitle")}
            </h1>
            <p className="mt-1 text-sm text-zinc-600">
              {t("registerPageSubtitle")}
            </p>

            <form onSubmit={onSubmit} className="mt-6 grid gap-4">
              <label className="grid gap-1">
                <span className="text-sm font-medium text-zinc-800">{t("nameLabel")}</span>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder={t("namePlaceholder")}
                  className="h-11 rounded-xl border border-zinc-200 bg-white px-3 text-sm text-zinc-900 outline-none focus:ring-2 focus:ring-zinc-900/10"
                />
              </label>

              <label className="grid gap-1">
                <span className="text-sm font-medium text-zinc-800">{t("emailLabel")}</span>
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  type="email"
                  required
                  placeholder={t("emailPlaceholder")}
                  className="h-11 rounded-xl border border-zinc-200 bg-white px-3 text-sm text-zinc-900 outline-none focus:ring-2 focus:ring-zinc-900/10"
                />
              </label>

              <label className="grid gap-1">
                <span className="text-sm font-medium text-zinc-800">{t("phoneLabel")}</span>
                <input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  inputMode="tel"
                  className="h-11 rounded-xl border border-zinc-200 bg-white px-3 text-sm text-zinc-900 outline-none focus:ring-2 focus:ring-zinc-900/10"
                />
              </label>

              <label className="grid gap-1">
                <span className="text-sm font-medium text-zinc-800">{t("roleLabel")}</span>
                <select
                  value={role}
                  onChange={(e) => {
                    const next = e.target.value as "patient" | "physician";
                    setRole(next);
                    if (next !== "physician") {
                      setPhysicianSpecialty("");
                      setPhysicianCertificate("");
                      setCertificateFiles([]);
                      setProfilePhotoFile(null);
                      if (profilePhotoPreview) URL.revokeObjectURL(profilePhotoPreview);
                      setProfilePhotoPreview(null);
                    }
                  }}
                  className="h-11 rounded-xl border border-zinc-200 bg-white px-3 text-sm text-zinc-900 outline-none focus:ring-2 focus:ring-zinc-900/10"
                >
                  {roles.map((r) => (
                    <option key={r.value} value={r.value}>
                      {r.label}
                    </option>
                  ))}
                </select>
              </label>

              {isPhysician ? (
                <>
                  <div className="rounded-xl border border-teal-200 bg-teal-50 px-3 py-2 text-xs text-teal-900">
                    {t("physicianInfoNotice")}
                  </div>

                  <div className="rounded-2xl border border-(--border) bg-(--surface-2) p-4">
                    <div className="text-sm font-medium text-zinc-800">{t("profilePhotoTitle")}</div>
                    <p className="mt-1 text-xs text-zinc-500">{t("profilePhotoDesc")}</p>
                    <div className="mt-3 flex flex-wrap items-center gap-4">
                      <PhysicianPhotoBox
                        previewUrl={profilePhotoPreview}
                        alt={t("profilePhotoTitle")}
                        size="lg"
                      />
                      <div className="flex flex-wrap gap-2">
                        <LocalFilePicker
                          accept="image/*"
                          multiple={false}
                          buttonLabel={profilePhotoFile ? t("changePhoto") : t("choosePhoto")}
                          hint={t("photoHint")}
                          onPick={(picked) => {
                            const file = picked[0];
                            if (!file) return;
                            if (!file.type.startsWith("image/")) {
                              setError(t("photoOnlyImageError"));
                              return;
                            }
                            setError(null);
                            setCropFile(file);
                            setCropOpen(true);
                          }}
                        />
                        {profilePhotoFile ? (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setProfilePhotoFile(null);
                              if (profilePhotoPreview) URL.revokeObjectURL(profilePhotoPreview);
                              setProfilePhotoPreview(null);
                            }}
                          >
                            {t("removePhoto")}
                          </Button>
                        ) : null}
                      </div>
                    </div>
                  </div>

                  <label className="grid gap-1">
                    <span className="text-sm font-medium text-zinc-800">{t("specialtyLabel")}</span>
                    <input
                      value={physicianSpecialty}
                      onChange={(e) => setPhysicianSpecialty(e.target.value)}
                      required={isPhysician}
                      placeholder={t("specialtyPlaceholder")}
                      className="h-11 rounded-xl border border-zinc-200 bg-white px-3 text-sm text-zinc-900 outline-none focus:ring-2 focus:ring-zinc-900/10"
                    />
                  </label>

                  <label className="grid gap-1">
                    <span className="text-sm font-medium text-zinc-800">{t("certificateLabel")}</span>
                    <textarea
                      value={physicianCertificate}
                      onChange={(e) => setPhysicianCertificate(e.target.value)}
                      required={isPhysician}
                      rows={3}
                      placeholder={t("certificatePlaceholder")}
                      className="rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:ring-2 focus:ring-zinc-900/10"
                    />
                    <span className="text-xs text-zinc-500">{t("certificateHint")}</span>
                  </label>

                  <div className="grid gap-1">
                    <span className="text-sm font-medium text-zinc-800">{t("certFilesLabel")}</span>
                    <LocalFilePicker
                      accept=".pdf,image/*"
                      multiple
                      buttonLabel={t("certFilesBtn")}
                      hint={t("certFilesHint")}
                      onPick={(picked) => {
                        if (picked.length) {
                          setCertificateFiles((prev) => [...prev, ...picked]);
                        }
                      }}
                    />
                  </div>

                  {certificateFiles.length > 0 ? (
                    <Card className="min-w-0 overflow-hidden bg-white">
                      <CardBody className="min-w-0 p-4 text-sm">
                        <div className="mb-2 text-sm font-semibold text-zinc-900">
                          {t("selectedFiles")} ({certificateFiles.length})
                        </div>
                        <SelectedLocalFilesList
                          files={certificateFiles}
                          onRemoveAt={(idx) =>
                            setCertificateFiles((prev) => prev.filter((_, i) => i !== idx))
                          }
                        />
                      </CardBody>
                    </Card>
                  ) : null}
                </>
              ) : null}

              <label className="grid gap-1">
                <span className="text-sm font-medium text-zinc-800">{t("passwordLabel")}</span>
                <PasswordInput
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="border-zinc-200 bg-white focus:ring-zinc-900/10"
                />
                {passwordHint ? (
                  <span className="text-xs text-zinc-500">{passwordHint}</span>
                ) : null}
              </label>

              {error ? <Alert variant="error">{error}</Alert> : null}

              <Button
                type="submit"
                disabled={loading || uploading || (isPhysician && !canSubmitPhysician)}
                className="w-full"
              >
                {uploading
                  ? t("uploadingLoading")
                  : loading
                    ? t("registerLoading")
                    : t("registerBtn")}
              </Button>
            </form>

            <ImageCropModal
              open={cropOpen}
              file={cropFile}
              title={t("cropTitle")}
              onClose={() => {
                setCropOpen(false);
                setCropFile(null);
              }}
              onConfirm={(cropped) => {
                setCropOpen(false);
                setCropFile(null);
                setProfilePhotoFile(cropped);
                if (profilePhotoPreview) URL.revokeObjectURL(profilePhotoPreview);
                setProfilePhotoPreview(URL.createObjectURL(cropped));
                setError(null);
              }}
            />

            <div className="mt-6 text-sm text-zinc-600">
              {t("hasAccount")}{" "}
              <Link className="font-medium text-zinc-900" href="/login">
                {t("loginLinkText")}
              </Link>
            </div>
          </CardBody>
        </Card>
      </main>
    </div>
  );
}
