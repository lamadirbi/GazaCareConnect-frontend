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

type RegisterResponse = {
  user: { id: number; name: string; email: string; role: string };
  token: string;
};

const roles = [
  { value: "patient", label: "مراجع" },
  { value: "physician", label: "طبيب" },
] as const;

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState<(typeof roles)[number]["value"]>("patient");
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
    if (password.length < 8) return "كلمة المرور يجب أن تكون 8 أحرف على الأقل.";
    return null;
  }, [password]);

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
      setError("يرجى إرفاق صورتك الشخصية كإثبات هوية.");
      return;
    }

    if (isPhysician && certificateFiles.length === 0) {
      setLoading(false);
      setError("يرجى إرفاق شهادة واحدة على الأقل (PDF أو صورة) لمراجعة الإدارة.");
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

  return (
    <div className="relative flex flex-1 items-center justify-center bg-zinc-50 px-4 py-10">
      <div className="absolute inset-0 -z-10">
        <div className="absolute -top-24 right-1/2 h-72 w-72 translate-x-1/2 rounded-full bg-teal-200/30 blur-3xl" />
        <div className="absolute -top-12 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-indigo-200/40 blur-3xl" />
      </div>
      <main className="w-full max-w-md">
        <div className="mb-4 flex items-center justify-between">
          <BrandLogo href="/" size="xl" showTitle showTagline />
          <Link
            href="/"
            className="rounded-lg px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-100"
          >
            الصفحة الرئيسية
          </Link>
        </div>

        <Card>
          <CardBody>
            <h1 className="text-xl font-semibold text-zinc-900">
              انضم إلى GazaCare Connect
            </h1>
            <p className="mt-1 text-sm text-zinc-600">
              أنشئ حسابك للوصول إلى الاستشارات والملف الطبي.
              {isPhysician ? " حساب الطبيب يخضع لمراجعة الإدارة قبل استقبال الحالات." : ""}
            </p>

            <form onSubmit={onSubmit} className="mt-6 grid gap-4">
            <label className="grid gap-1">
              <span className="text-sm font-medium text-zinc-800">
                الاسم
              </span>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="h-11 rounded-xl border border-zinc-200 bg-white px-3 text-sm text-zinc-900 outline-none focus:ring-2 focus:ring-zinc-900/10"
              />
            </label>

            <label className="grid gap-1">
              <span className="text-sm font-medium text-zinc-800">
                البريد الإلكتروني
              </span>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                required
                className="h-11 rounded-xl border border-zinc-200 bg-white px-3 text-sm text-zinc-900 outline-none focus:ring-2 focus:ring-zinc-900/10"
              />
            </label>

            <label className="grid gap-1">
              <span className="text-sm font-medium text-zinc-800">
                رقم الجوال (اختياري)
              </span>
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                inputMode="tel"
                className="h-11 rounded-xl border border-zinc-200 bg-white px-3 text-sm text-zinc-900 outline-none focus:ring-2 focus:ring-zinc-900/10"
              />
            </label>

            <label className="grid gap-1">
              <span className="text-sm font-medium text-zinc-800">
                نوع الحساب
              </span>
              <select
                value={role}
                onChange={(e) => {
                  const next = e.target.value as any;
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
                  أدخل تخصصك ومؤهلك، ثم أرفق صورتك الشخصية كإثبات هوية وشهاداتك (PDF أو صورة). ستُراجعها الإدارة قبل تفعيل حسابك.
                </div>

                <div className="rounded-2xl border border-(--border) bg-(--surface-2) p-4">
                  <div className="text-sm font-medium text-zinc-800">الصورة الشخصية (إلزامية)</div>
                  <p className="mt-1 text-xs text-zinc-500">
                    صورة واضحة لوجهك — تُستخدم كإثبات هوية عند مراجعة طلب التوثيق.
                  </p>
                  <div className="mt-3 flex flex-wrap items-center gap-4">
                    <PhysicianPhotoBox
                      previewUrl={profilePhotoPreview}
                      alt="صورة الطبيب"
                      size="lg"
                    />
                    <div className="flex flex-wrap gap-2">
                      <LocalFilePicker
                        accept="image/*"
                        multiple={false}
                        buttonLabel={profilePhotoFile ? "تغيير الصورة" : "اختيار الصورة"}
                        hint="صورة وجه واضحة (JPG أو PNG)"
                        onPick={(picked) => {
                          const file = picked[0];
                          if (!file) return;
                          if (!file.type.startsWith("image/")) {
                            setError("يُرجى اختيار صورة فقط للصورة الشخصية.");
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
                          إزالة
                        </Button>
                      ) : null}
                    </div>
                  </div>
                </div>

                <label className="grid gap-1">
                  <span className="text-sm font-medium text-zinc-800">
                    التخصص
                  </span>
                  <input
                    value={physicianSpecialty}
                    onChange={(e) => setPhysicianSpecialty(e.target.value)}
                    required={isPhysician}
                    placeholder="مثال: طب الأطفال، جراحة عامة، قلب..."
                    className="h-11 rounded-xl border border-zinc-200 bg-white px-3 text-sm text-zinc-900 outline-none focus:ring-2 focus:ring-zinc-900/10"
                  />
                </label>

                <label className="grid gap-1">
                  <span className="text-sm font-medium text-zinc-800">
                    الشهادة / المؤهل
                  </span>
                  <textarea
                    value={physicianCertificate}
                    onChange={(e) => setPhysicianCertificate(e.target.value)}
                    required={isPhysician}
                    rows={3}
                    placeholder="مثال: بكالوريوس طب وجراحة، بورد/زمالة، جامعة..."
                    className="rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:ring-2 focus:ring-zinc-900/10"
                  />
                  <span className="text-xs text-zinc-500">
                    اكتبها بشكل مختصر وواضح (الحد الأقصى 5000 حرف).
                  </span>
                </label>
                <div className="grid gap-1">
                  <span className="text-sm font-medium text-zinc-800">
                    مرفقات الشهادة
                  </span>
                  <LocalFilePicker
                    accept=".pdf,image/*"
                    multiple
                    buttonLabel="اختيار ملفات الشهادة"
                    hint="أرفق شهادة التخرج أو البورد (PDF أو صورة). يمكنك اختيار أكثر من ملف."
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
                        الملفات المختارة ({certificateFiles.length})
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
              <span className="text-sm font-medium text-zinc-800">
                كلمة المرور
              </span>
              <PasswordInput
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="border-zinc-200 bg-white focus:ring-zinc-900/10"
              />
              {passwordHint ? (
                <span className="text-xs text-zinc-500">
                  {passwordHint}
                </span>
              ) : null}
            </label>

            {error ? (
              <Alert variant="error">{error}</Alert>
            ) : null}

            <Button
              type="submit"
              disabled={loading || uploading || (isPhysician && !canSubmitPhysician)}
              className="w-full"
            >
              {uploading
                ? "جاري رفع الملفات..."
                : loading
                  ? "جاري إنشاء الحساب..."
                  : "إنشاء حساب"}
            </Button>
          </form>

          <ImageCropModal
            open={cropOpen}
            file={cropFile}
            title="قص الصورة الشخصية"
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
            لديك حساب؟{" "}
            <Link className="font-medium text-zinc-900" href="/login">
              تسجيل الدخول
            </Link>
          </div>
          </CardBody>
        </Card>
      </main>
    </div>
  );
}

