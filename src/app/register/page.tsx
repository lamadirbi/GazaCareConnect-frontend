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
      password.length >= 8
    );
  }, [isPhysician, physicianSpecialty, physicianCertificate, certificateFiles.length, password.length]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

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

    if (isPhysician && certificateFiles.length > 0) {
      setUploading(true);
      const uploadRes = await uploadMedicalFiles(certificateFiles);
      setUploading(false);

      if (!uploadRes.ok) {
        setLoading(false);
        setError(uploadRes.message);
        window.location.href = routeForRole(res.data.user.role);
        return;
      }

      const fileIds = uploadRes.data.files.map((f) => f.id);
      const profileRes = await apiFetch("/physician-profile", {
        method: "PUT",
        body: JSON.stringify({
          specialty: physicianSpecialty,
          certificate: physicianCertificate,
          certificate_file_ids: fileIds,
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
    <div className="relative flex flex-1 items-center justify-center bg-zinc-50 px-4 py-10 dark:bg-black">
      <div className="absolute inset-0 -z-10">
        <div className="absolute -top-24 right-1/2 h-72 w-72 translate-x-1/2 rounded-full bg-teal-200/30 blur-3xl dark:bg-teal-500/10" />
        <div className="absolute -top-12 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-indigo-200/40 blur-3xl dark:bg-indigo-500/10" />
      </div>
      <main className="w-full max-w-md">
        <div className="mb-4 flex items-center justify-between">
          <BrandLogo href="/" size="xl" showTitle showTagline />
          <Link
            href="/"
            className="rounded-lg px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-zinc-900"
          >
            الصفحة الرئيسية
          </Link>
        </div>

        <Card>
          <CardBody>
            <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
              انضم إلى GazaCare Connect
            </h1>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              أنشئ حسابك للوصول إلى الاستشارات والملف الطبي.
              {isPhysician ? " حساب الطبيب يخضع لمراجعة الإدارة قبل استقبال الحالات." : ""}
            </p>

            <form onSubmit={onSubmit} className="mt-6 grid gap-4">
            <label className="grid gap-1">
              <span className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
                الاسم
              </span>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="h-11 rounded-xl border border-zinc-200 bg-white px-3 text-sm text-zinc-900 outline-none focus:ring-2 focus:ring-zinc-900/10 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50 dark:focus:ring-white/10"
              />
            </label>

            <label className="grid gap-1">
              <span className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
                البريد الإلكتروني
              </span>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                required
                className="h-11 rounded-xl border border-zinc-200 bg-white px-3 text-sm text-zinc-900 outline-none focus:ring-2 focus:ring-zinc-900/10 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50 dark:focus:ring-white/10"
              />
            </label>

            <label className="grid gap-1">
              <span className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
                رقم الجوال (اختياري)
              </span>
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                inputMode="tel"
                className="h-11 rounded-xl border border-zinc-200 bg-white px-3 text-sm text-zinc-900 outline-none focus:ring-2 focus:ring-zinc-900/10 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50 dark:focus:ring-white/10"
              />
            </label>

            <label className="grid gap-1">
              <span className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
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
                  }
                }}
                className="h-11 rounded-xl border border-zinc-200 bg-white px-3 text-sm text-zinc-900 outline-none focus:ring-2 focus:ring-zinc-900/10 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50 dark:focus:ring-white/10"
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
                <div className="rounded-xl border border-teal-200 bg-teal-50 px-3 py-2 text-xs text-teal-900 dark:border-teal-900/40 dark:bg-teal-950/30 dark:text-teal-100">
                  أدخل تخصصك ومؤهلك، ثم أرفق شهاداتك (PDF أو صورة). ستُراجعها الإدارة قبل تفعيل حسابك.
                </div>

                <label className="grid gap-1">
                  <span className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
                    التخصص
                  </span>
                  <input
                    value={physicianSpecialty}
                    onChange={(e) => setPhysicianSpecialty(e.target.value)}
                    required={isPhysician}
                    placeholder="مثال: طب الأطفال، جراحة عامة، قلب..."
                    className="h-11 rounded-xl border border-zinc-200 bg-white px-3 text-sm text-zinc-900 outline-none focus:ring-2 focus:ring-zinc-900/10 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50 dark:focus:ring-white/10"
                  />
                </label>

                <label className="grid gap-1">
                  <span className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
                    الشهادة / المؤهل
                  </span>
                  <textarea
                    value={physicianCertificate}
                    onChange={(e) => setPhysicianCertificate(e.target.value)}
                    required={isPhysician}
                    rows={3}
                    placeholder="مثال: بكالوريوس طب وجراحة، بورد/زمالة، جامعة..."
                    className="rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:ring-2 focus:ring-zinc-900/10 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50 dark:focus:ring-white/10"
                  />
                  <span className="text-xs text-zinc-500 dark:text-zinc-400">
                    اكتبها بشكل مختصر وواضح (الحد الأقصى 5000 حرف).
                  </span>
                </label>
                <label className="grid gap-1">
                  <span className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
                    مرفقات الشهادة
                  </span>
                  <input
                    type="file"
                    multiple
                    accept=".pdf,image/*"
                    onChange={(e) => {
                      const picked = Array.from(e.target.files ?? []);
                      e.target.value = "";
                      if (!picked.length) return;
                      setCertificateFiles((prev) => [...prev, ...picked]);
                    }}
                    className="block w-full text-sm text-zinc-700 file:mr-2 file:rounded-lg file:border-0 file:bg-zinc-100 file:px-3 file:py-2 file:text-sm file:font-medium file:text-zinc-900 hover:file:bg-zinc-200 dark:text-zinc-200 dark:file:bg-zinc-800 dark:file:text-zinc-50 dark:hover:file:bg-zinc-700"
                  />
                  <span className="text-xs text-zinc-500 dark:text-zinc-400">
                    أرفق شهادة التخرج أو البورد (PDF أو صورة). يمكنك اختيار أكثر من ملف.
                  </span>
                </label>

                {certificateFiles.length > 0 ? (
                  <Card className="bg-white dark:bg-zinc-950">
                    <CardBody className="p-4 text-sm">
                      <div className="mb-2 text-sm font-semibold text-zinc-900 dark:text-zinc-50">
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
              <span className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
                كلمة المرور
              </span>
              <input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type="password"
                required
                className="h-11 rounded-xl border border-zinc-200 bg-white px-3 text-sm text-zinc-900 outline-none focus:ring-2 focus:ring-zinc-900/10 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50 dark:focus:ring-white/10"
              />
              {passwordHint ? (
                <span className="text-xs text-zinc-500 dark:text-zinc-400">
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
                ? "جاري رفع الشهادات..."
                : loading
                  ? "جاري إنشاء الحساب..."
                  : "إنشاء حساب"}
            </Button>
          </form>

          <div className="mt-6 text-sm text-zinc-600 dark:text-zinc-400">
            لديك حساب؟{" "}
            <Link className="font-medium text-zinc-900 dark:text-zinc-50" href="/login">
              تسجيل الدخول
            </Link>
          </div>
          </CardBody>
        </Card>
      </main>
    </div>
  );
}

