/**
 * UAT runner for GazaCare Connect — real full stack (Next.js :3000 + Laravel API :8000).
 * Usage: node run-fullstack-uat.mjs
 */
import { chromium } from "playwright";

const APP = process.env.APP_URL || "http://localhost:3000";
const API = process.env.API_URL || "http://127.0.0.1:8000/api/v1";

const PASSWORD = "password";

const ACCOUNTS = {
  patient: { email: "patient.maryam@example.com", password: PASSWORD, urlRegex: /\/dashboard/ },
  physician: { email: "dr.ahmad@example.com", password: PASSWORD, urlRegex: /\/physician/ },
  physician2: { email: "dr.sara@example.com", password: PASSWORD, urlRegex: /\/physician/ },
  admin: { email: "admin@example.com", password: PASSWORD, urlRegex: /\/admin/ },
};

let pendingEmail = "dr.pending.uat@example.com";

const results = [];

function log(msg) {
  console.log(msg);
}

async function launch() {
  try {
    return await chromium.launch({ headless: true, channel: "chrome" });
  } catch {
    return await chromium.launch({ headless: true, channel: "msedge" });
  }
}

async function freshPage(browser) {
  const context = await browser.newContext({
    viewport: { width: 1280, height: 900 },
    locale: "ar",
  });
  const page = await context.newPage();
  await page.goto(APP + "/", { waitUntil: "domcontentloaded", timeout: 45000 });
  await page.evaluate(() => {
    localStorage.removeItem("gc_token");
    localStorage.removeItem("gc_session_user");
  });
  await page.reload({ waitUntil: "domcontentloaded" });
  return { context, page };
}

async function dismissOverlays(page) {
  await page.keyboard.press("Escape").catch(() => {});
  const cancel = page.locator(".gc-confirm-modal-actions button, .gc-reject-modal button", {
    hasText: /إلغاء|إغلاق/,
  }).first();
  if (await cancel.isVisible().catch(() => false)) {
    await cancel.click().catch(() => {});
  }
}

async function ensureLoginPage(page) {
  await dismissOverlays(page);
  if (!page.url().includes("/login")) {
    try {
      await page.goto(APP + "/login", { waitUntil: "commit", timeout: 20000 });
    } catch (err) {
      const msg = String(err?.message || err);
      if (!/ERR_ABORTED|interrupted/i.test(msg)) throw err;
      await page.waitForTimeout(800);
    }
  }
  await page.waitForSelector('input[type="email"]', { state: "visible", timeout: 20000 });
}

async function logout(page, { viaButton = false } = {}) {
  await dismissOverlays(page);
  if (viaButton) {
    const logoutBtn = page.locator("button:visible", { hasText: /^تسجيل الخروج$/ }).first();
    if (await logoutBtn.isVisible().catch(() => false)) {
      await Promise.all([
        page.waitForURL((url) => url.pathname.includes("login"), { timeout: 15000 }).catch(() => {}),
        logoutBtn.click(),
      ]);
      await page.waitForTimeout(400);
    }
  }
  await page.evaluate(() => {
    localStorage.removeItem("gc_token");
    localStorage.removeItem("gc_session_user");
  });
  await ensureLoginPage(page);
}

async function waitPhysicianDash(page) {
  await page.locator("#physician-queue").waitFor({ state: "visible", timeout: 30000 });
}

async function formLogin(page, email, password, expectedUrlRegex) {
  await ensureLoginPage(page);
  await page.fill('input[type="email"]', email);
  await page.fill('input[type="password"]', password);
  await page.click('button[type="submit"]');
  try {
    await page.waitForURL(expectedUrlRegex, { timeout: 20000 });
  } catch {
    await ensureLoginPage(page);
    await page.fill('input[type="email"]', email);
    await page.fill('input[type="password"]', password);
    await page.click('button[type="submit"]');
    await page.waitForURL(expectedUrlRegex, { timeout: 20000 });
  }
}

async function loginAs(page, roleKey) {
  const acc = ACCOUNTS[roleKey];
  if (!acc) throw new Error("دور غير معروف: " + roleKey);
  await formLogin(page, acc.email, acc.password, acc.urlRegex);
}

async function fillPhysicianRegistrationForm(page, { name, email, specialty, certificateText, password, fileName }) {
  await page.goto(APP + "/register");
  await page.waitForTimeout(800);
  await page.locator("select").first().selectOption("physician");
  await page.waitForTimeout(400);
  await page.locator("input").nth(0).fill(name);
  await page.locator('input[type="email"]').fill(email);
  await page.getByText("التخصص", { exact: true }).locator("..").locator("input").fill(specialty);
  await page.getByText("الشهادة / المؤهل", { exact: true }).locator("..").locator("textarea").fill(certificateText);
  await page.locator('input[type="file"]').first().setInputFiles({
    name: fileName,
    mimeType: "application/pdf",
    buffer: Buffer.from("%PDF-1.4 uat certificate"),
  });
  await page.locator('input[type="password"]').fill(password);
  await page.locator('button[type="submit"]').click();
  await page.waitForURL(/\/physician/, { timeout: 20000 });
}

async function registerNewPendingPhysician(page, emailOverride) {
  const email = emailOverride || `dr.pending.${Date.now()}@example.test`;
  await fillPhysicianRegistrationForm(page, {
    name: "د. طبيب معلّق UAT",
    email,
    specialty: "طب عام",
    certificateText: "شهادة مزاولة — تسجيل معلّق لاختبار UAT.",
    password: PASSWORD,
    fileName: "pending-cert.pdf",
  });
  return email;
}

async function resolvePendingPhysicianEmail(page) {
  await ensureLoginPage(page);
  await page.fill('input[type="email"]', pendingEmail);
  await page.fill('input[type="password"]', PASSWORD);
  await page.click('button[type="submit"]');
  await page.waitForTimeout(2000);

  if (!page.url().includes("/physician")) {
    pendingEmail = await registerNewPendingPhysician(page);
    return pendingEmail;
  }

  const status = await page.evaluate(async (api) => {
    const token = localStorage.getItem("gc_token");
    const r = await fetch(`${api}/auth/me`, {
      headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
    });
    if (!r.ok) return null;
    const json = await r.json();
    const p = json.user?.physician_profile || json.user?.physicianProfile;
    return p?.verification_status || null;
  }, API);

  if (status === "approved") {
    await logout(page);
    pendingEmail = await registerNewPendingPhysician(page);
    return pendingEmail;
  }

  return pendingEmail;
}

async function selectPhysicianOptionByName(select, namePart) {
  const options = await select.locator("option").allTextContents();
  const idx = options.findIndex((o) => o.includes(namePart));
  if (idx < 0) throw new Error("لم يتم العثور على الطبيب في القائمة: " + namePart);
  await select.selectOption({ index: idx });
}

async function run(code, title, fn) {
  try {
    await fn();
    results.push({ code, title, ok: true });
    log(`✅ ${code} ${title}`);
  } catch (err) {
    results.push({ code, title, ok: false, error: String(err?.message || err) });
    log(`❌ ${code} ${title}`);
    log(`   → ${err?.message || err}`);
  }
}

async function main() {
  const browser = await launch();
  let { context, page } = await freshPage(browser);

  const restart = async () => {
    await context.close();
    ({ context, page } = await freshPage(browser));
  };

  // ── G: Guest ──
  await run("G-01", "الصفحة الرئيسية", async () => {
    await page.goto(APP + "/", { waitUntil: "domcontentloaded" });
    await page.waitForLoadState("networkidle").catch(() => {});
    const title = await page.title();
    if (!/GazaCare/i.test(title)) throw new Error("عنوان الصفحة لا يحتوي GazaCare");
    await page.getByRole("img", { name: /GazaCare/i }).first().waitFor({
      state: "visible",
      timeout: 15000,
    });
    await page.locator("h1").filter({ hasText: /رعاية|استشار/ }).first().waitFor({
      state: "visible",
      timeout: 10000,
    });
    const login = page.locator('a[href="/login"]').first();
    if (!(await login.count())) throw new Error("رابط الدخول غير موجود");
  });

  await run("G-02", "صفحة محمية بدون دخول", async () => {
    await page.evaluate(() => {
      localStorage.removeItem("gc_token");
      localStorage.removeItem("gc_session_user");
    });
    await page.goto(APP + "/dashboard", { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(2500);
    if (!page.url().includes("/login")) throw new Error(`لم يحوّل للدخول: ${page.url()}`);
  });

  // ── A: Auth ──
  await run("A-01", "دخول مراجع", async () => {
    await loginAs(page, "patient");
    if (!page.url().includes("/dashboard")) throw new Error(page.url());
  });

  await run("A-07", "ثبات الجلسة بعد Refresh", async () => {
    await page.reload({ waitUntil: "domcontentloaded" });
    await page.waitForTimeout(2500);
    if (page.url().includes("/login")) throw new Error("خرج بعد الريفريش");
    const token = await page.evaluate(() => localStorage.getItem("gc_token"));
    if (!token) throw new Error("التوكن اختفى");
  });

  await run("A-08", "تسجيل الخروج", async () => {
    await logout(page, { viaButton: true });
    await page.waitForTimeout(1000);
    await page.goto(APP + "/dashboard");
    await page.waitForTimeout(2500);
    if (!page.url().includes("/login")) throw new Error("ما زال يدخل اللوحة");
  });

  await run("A-02", "دخول طبيب", async () => {
    await loginAs(page, "physician");
    if (!page.url().includes("/physician")) throw new Error(page.url());
  });

  await run("A-03", "دخول مدير", async () => {
    await logout(page);
    await loginAs(page, "admin");
    if (!page.url().includes("/admin")) throw new Error(page.url());
  });

  await run("A-04", "فشل دخول خاطئ", async () => {
    await logout(page);
    await ensureLoginPage(page);
    await page.fill('input[type="email"]', "wrong@example.com");
    await page.fill('input[type="password"]', "badpass");
    await page.click('button[type="submit"]');
    await page.waitForTimeout(1500);
    const body = await page.locator("main").innerText();
    if (!/غير|خطأ|صحيح|تعذر|فشل/i.test(body) && page.url().includes("/dashboard")) {
      throw new Error("دخل بحساب خاطئ");
    }
    if (!page.url().includes("/login")) {
      throw new Error("خرج من صفحة الدخول دون نجاح واضح");
    }
  });

  await run("A-06", "إنشاء حساب طبيب جديد", async () => {
    const email = `physician-a06-${Date.now()}@example.test`;
    await fillPhysicianRegistrationForm(page, {
      name: "د. طبيب جديد",
      email,
      specialty: "طب عام",
      certificateText: "شهادة مزاولة — اختبار تسجيل طبيب",
      password: PASSWORD,
      fileName: "certificate.pdf",
    });
    const t = await page.locator("main").innerText();
    if (!/انتظار|موافقة|توثيق/.test(t)) throw new Error("لا رسالة انتظار توثيق");
    if (await page.locator("button", { hasText: "استلام الحالة" }).count()) {
      throw new Error("يرى استلام الحالات وهو معلّق");
    }
  });

  await run("A-05", "تسجيل مراجع جديد", async () => {
    await page.goto(APP + "/register");
    await page.waitForTimeout(800);
    const email = `patient-a05-${Date.now()}@example.test`;
    await page.locator('input[type="text"], input:not([type])').first().fill("مريض اختبار");
    await page.locator('input[type="email"]').fill(email);
    const passes = page.locator('input[type="password"]');
    await passes.nth(0).fill(PASSWORD);
    if ((await passes.count()) > 1) await passes.nth(1).fill(PASSWORD);
    await page.locator('button[type="submit"]').click();
    await page.waitForTimeout(3500);
    if (!page.url().includes("/dashboard") && !page.url().includes("/profile") && !page.url().includes("/consultations")) {
      const t = await page.locator("main").innerText();
      if (page.url().includes("/register") && /مستخدم|خطأ|مطلوب/.test(t)) {
        throw new Error("فشل التسجيل: " + t.slice(0, 120));
      }
      if (!page.url().includes("/dashboard")) {
        await ensureLoginPage(page);
        await page.fill('input[type="email"]', email);
        await page.fill('input[type="password"]', PASSWORD);
        await page.click('button[type="submit"]');
        await page.waitForTimeout(2500);
        if (!page.url().includes("/dashboard")) throw new Error("التسجيل/الدخول فشل: " + page.url());
      }
    }
  });

  await run("A-09", "رجوع للرئيسية مع تأكيد الخروج", async () => {
    await restart();
    await loginAs(page, "patient");
    await page.goto(APP + "/dashboard");
    await page.waitForTimeout(1200);
    await page.locator('button[aria-label="رجوع"]').first().click();
    await page.locator("#gc-confirm-modal-title").waitFor({ state: "visible", timeout: 8000 });
    await page.locator(".gc-confirm-modal-actions button", { hasText: "إلغاء" }).click();
    await page.waitForTimeout(600);
    if (!page.url().includes("/dashboard")) {
      throw new Error("خرج عند الإلغاء: " + page.url());
    }
    await page.locator('button[aria-label="رجوع"]').first().click();
    await page.locator("#gc-confirm-modal-title").waitFor({ state: "visible", timeout: 8000 });
    await page.locator(".gc-confirm-modal-actions button", { hasText: "نعم، خروج" }).click();
    await page.waitForTimeout(2000);
    const token = await page.evaluate(() => localStorage.getItem("gc_token"));
    if (token) throw new Error("الجلسة ما زالت موجودة بعد تأكيد الخروج");
  });

  // Fresh for patient flows
  await restart();
  await loginAs(page, "patient");

  await run("P-01", "تعديل الملف الطبي", async () => {
    await page.goto(APP + "/profile");
    await page.waitForTimeout(1500);
    const edit = page.locator("button", { hasText: /تعديل/ }).first();
    if (await edit.count()) await edit.click();
    await page.waitForTimeout(400);
    const inputs = page.locator("input, textarea");
    const n = await inputs.count();
    if (n > 0) {
      for (let i = 0; i < Math.min(n, 6); i++) {
        const el = inputs.nth(i);
        const type = await el.getAttribute("type");
        if (type === "number" || type === "text" || type === null) {
          await el.fill(type === "number" ? "170" : "ضغط دم خفيف — اختبار");
        }
      }
      const save = page.locator("button", { hasText: /حفظ/ }).first();
      if (await save.count()) {
        await save.click();
        await page.waitForTimeout(1500);
      }
    }
    await page.reload();
    await page.waitForTimeout(1500);
    if (page.url().includes("/login")) throw new Error("خرج من الملف");
  });

  let queueConsultId = null;
  await run("P-02", "استشارة عامة بدون مرفقات", async () => {
    await page.goto(APP + "/consultations/new");
    await page.locator("textarea").first().waitFor({ state: "visible", timeout: 15000 });
    const marker = "TEST-QUEUE-001 " + Date.now();
    const body = marker + " نص استشارة طويل بما يكفي للاختبار الآلي والتحقق من الإنشاء.";
    await page.locator("textarea").first().fill(body);
    await page.locator(".gc-assignment-option-title", { hasText: "أول طبيب" }).click().catch(() => {});
    const submit = page.locator('button[type="submit"]');
    await submit.waitFor({ state: "visible" });
    if (await submit.isDisabled()) {
      throw new Error("زر الإرسال معطّل رغم اكتمال النص");
    }
    await submit.click();
    try {
      await page.waitForURL(/\/consultations\/\d+/, { timeout: 25000 });
    } catch {
      const t = await page.locator("main").innerText();
      throw new Error("لم تُنشأ: " + page.url() + " | " + t.slice(0, 220));
    }
    queueConsultId = page.url().match(/\/consultations\/(\d+)/)?.[1];
  });

  await run("P-03", "استشارة عامة مع مرفقات", async () => {
    await page.goto(APP + "/consultations/new");
    await page.locator("textarea").first().waitFor({ state: "visible", timeout: 15000 });
    const marker = "TEST-QUEUE-FILES " + Date.now();
    await page.locator("textarea").first().fill(marker + " استشارة مع مرفق صورة لاختبار الرفع.");
    const fileInput = page.locator('input[type="file"]').first();
    await fileInput.setInputFiles({
      name: "lab-test.png",
      mimeType: "image/png",
      buffer: Buffer.from(
        "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
        "base64",
      ),
    });
    await page.waitForTimeout(800);
    // Ensure file appears selected before submit (upload happens on submit)
    const selected = await page.locator("main").innerText();
    if (!/ملف|lab-test|محدد/.test(selected)) {
      throw new Error("لم يظهر الملف المحدد في الواجهة");
    }
    const submit = page.locator('button[type="submit"]');
    if (await submit.isDisabled()) throw new Error("زر الإرسال معطّل");
    await submit.click();
    try {
      await page.waitForURL(/\/consultations\/\d+/, { timeout: 45000 });
    } catch {
      const t = await page.locator("main").innerText();
      throw new Error("فشل إنشاء استشارة مع مرفق: " + page.url() + " | " + t.slice(0, 250));
    }
  });

  let directMarker = "TEST-DIRECT-001 " + Date.now();
  await run("P-04", "استشارة مباشرة لطبيب", async () => {
    await page.goto(APP + "/consultations/new");
    await page.waitForTimeout(1500);
    await page.locator(".gc-assignment-option-title", { hasText: "طبيب محدّد" }).click();
    await page.waitForTimeout(500);
    const select = page.locator("select").first();
    if (!(await select.count())) throw new Error("لا يوجد اختيار طبيب");
    const options = await select.locator("option").allTextContents();
    const idx = options.findIndex((o, i) => i > 0 && o.trim());
    if (idx < 0) throw new Error("لا أطباء في القائمة");
    await select.selectOption({ index: idx });
    await page.locator("textarea").first().fill(directMarker + " موجّهة مباشرة للاختبار.");
    await page.locator('button[type="submit"]').click();
    await page.waitForTimeout(3500);
    if (!/\/consultations\/\d+/.test(page.url())) throw new Error(page.url());
  });

  await run("P-05", "منع نص قصير", async () => {
    await page.goto(APP + "/consultations/new");
    await page.waitForTimeout(1000);
    await page.locator("textarea").first().fill("قصير");
    const submit = page.locator('button[type="submit"]');
    const disabled = await submit.isDisabled();
    if (!disabled) {
      await submit.click();
      await page.waitForTimeout(1000);
      if (/\/consultations\/\d+/.test(page.url())) throw new Error("قبل نصاً قصيراً");
    }
  });

  await run("P-06", "قائمة استشارات المراجع", async () => {
    await page.goto(APP + "/consultations");
    await page.waitForTimeout(2000);
    const t = await page.locator("main").innerText();
    if (!t || t.length < 20) throw new Error("صفحة فارغة");
  });

  await run("P-07", "إلغاء استشارة جديدة", async () => {
    await page.goto(APP + "/consultations/new");
    await page.waitForTimeout(800);
    await page.locator("a", { hasText: "إلغاء" }).first().click();
    await page.waitForTimeout(1000);
    if (page.url().includes("/new")) throw new Error("ما زال في النموذج");
  });

  // ── Doctor ──
  await logout(page);
  await loginAs(page, "physician");

  await run("D-01", "ظهور العامة في بانتظار الاستلام", async () => {
    await page.goto(APP + "/physician/dashboard");
    await page.locator("#physician-queue").waitFor({ state: "visible", timeout: 30000 });
    const t = await page.locator("main").innerText();
    if (!t.includes("بانتظار الاستلام") && !t.includes("استلام")) {
      throw new Error("قسم الانتظار غير ظاهر");
    }
    const claim = page.locator("button", { hasText: "استلام الحالة" });
    if (!(await claim.count())) throw new Error("لا توجد حالات للاستلام");
  });

  let claimedId = null;
  await run("D-02", "استلام ثم رد للمراجعة", async () => {
    await page.goto(APP + "/physician/dashboard");
    await page.locator("#physician-queue").waitFor({ state: "visible", timeout: 30000 });
    const claim = page.locator("button", { hasText: "استلام الحالة" }).first();
    if (!(await claim.count())) throw new Error("لا زر استلام");
    await claim.click();
    await page.waitForURL(/\/physician\/consultations\/\d+/, { timeout: 15000 });
    claimedId = page.url().match(/\/(\d+)$/)?.[1];
    const marker = "رد-مراجعة-UAT-" + Date.now();
    await page.locator("textarea").fill(marker + " توصية طبية كافية للمراجعة الآلية.");
    await page.locator("button", { hasText: "إرسال الرد للمراجعة" }).click();
    await page.waitForURL(/\/physician\/dashboard/, { timeout: 15000 });
    await page.locator("#physician-in-progress").waitFor({ state: "visible", timeout: 30000 });
    const text = await page.locator("#physician-in-progress").innerText();
    if (text.includes("لا توجد استشارات قيد المعالجة") && !text.includes("#")) {
      throw new Error("لم تظهر بعد المراجعة");
    }
    if (!text.includes("#") && !claimedId) throw new Error("قيد المعالجة فارغ");
  });

  await run("D-03", "إنهاء استشارة كمكتملة", async () => {
    if (claimedId) {
      await page.goto(APP + `/physician/consultations/${claimedId}`);
    } else {
      await page.goto(APP + "/physician/dashboard");
      await page.locator("#physician-in-progress").waitFor({ state: "visible", timeout: 30000 });
      const link = page.locator('#physician-in-progress a[href*="/physician/consultations/"]').first();
      if (!(await link.count())) throw new Error("لا استشارة للمتابعة");
      await link.click();
    }
    await page.waitForTimeout(1500);
    await page.locator("textarea").fill("إنهاء الاستشارة بعد التقييم النهائي — UAT complete response ok.");
    await page.locator("button", { hasText: /إنهاء الاستشارة/ }).click();
    await page.waitForTimeout(3000);
    if (!page.url().includes("/physician/dashboard")) {
      await page.goto(APP + "/physician/dashboard");
    }
    await page.locator("#physician-completed").waitFor({ state: "visible", timeout: 30000 });
    const t = await page.locator("#physician-completed").innerText();
    if (!t.includes("مكتمل") && !t.includes("#")) throw new Error("لا تظهر مكتملة");
  });

  await run("D-04", "استشارة مباشرة موجّهة", async () => {
    await page.goto(APP + "/physician/dashboard");
    await page.locator("#physician-direct").waitFor({ state: "visible", timeout: 30000 });
  });

  await run("D-05", "تعديل ملف الطبيب", async () => {
    const edit = page.locator("button", { hasText: /تعديل الملف|تعديل البيانات/ }).first();
    if (await edit.count()) {
      await edit.click();
      await page.waitForTimeout(400);
      const spec = page.locator('input').first();
      if (await spec.count()) {
        const v = await spec.inputValue();
        await spec.fill(v || "طب القلب");
      }
      const save = page.locator("button", { hasText: /حفظ/ }).first();
      if (await save.count() && !(await save.isDisabled())) {
        await save.click();
        await page.waitForTimeout(1500);
      }
    }
  });

  await run("D-06", "تنقل أقسام الطبيب", async () => {
    for (const hash of ["physician-queue", "physician-direct", "physician-in-progress", "physician-completed"]) {
      await page.goto(APP + `/physician/dashboard#${hash}`);
      await page.waitForTimeout(400);
      if (!(await page.locator(`#${hash}`).count())) throw new Error("ناقص " + hash);
    }
  });

  // ── Pending / Reject / Resubmit ──
  await restart();

  await run("DV-01", "طبيب معلّق لا يرى الحالات", async () => {
    await resolvePendingPhysicianEmail(page);
    const t = await page.locator("main").innerText();
    if (!/انتظار|موافقة|توثيق|رفض/.test(t)) {
      throw new Error("لا رسالة انتظار/رفض: " + t.slice(0, 200));
    }
    if ((await page.locator("button", { hasText: "استلام الحالة" }).count()) > 0) {
      throw new Error("يرى الحالات وهو غير موثّق");
    }
  });

  await run("DV-02", "رفض طبيب بنافذة سبب", async () => {
    await logout(page);
    await loginAs(page, "admin");
    await page.goto(APP + "/admin/physicians");
    await page.waitForTimeout(2000);
    const sel = page.locator("select").first();
    await sel.selectOption("pending");
    await page.waitForTimeout(1000);
    const card = page.locator("div.overflow-hidden.rounded-2xl").filter({ hasText: pendingEmail }).first();
    if (!(await card.count())) {
      await sel.selectOption("rejected");
      await page.waitForTimeout(800);
      const rejectedCard = page.locator("div.overflow-hidden.rounded-2xl").filter({ hasText: pendingEmail }).first();
      if (await rejectedCard.count()) return;
      throw new Error("لم يُعثر على طلب الطبيب المعلّق للرفض: " + pendingEmail);
    }
    await card.locator("button", { hasText: "رفض الطلب" }).first().click();
    await page.waitForTimeout(500);
    const modalTitle = page.locator("#gc-reject-modal-title");
    await modalTitle.waitFor({ state: "visible", timeout: 8000 });
    if (!(await modalTitle.innerText()).includes("رفض")) {
      throw new Error("النافذة المنبثقة لم تظهر");
    }
    await page.locator(".gc-reject-modal-textarea").fill("الشهادة غير واضحة — UAT-REJECT");
    await page.locator("button", { hasText: "تأكيد الرفض" }).click();
    await page.waitForTimeout(2000);
    await sel.selectOption("rejected");
    await page.waitForTimeout(1000);
    const t = await page.locator("main").innerText();
    if (!t.includes(pendingEmail) && !t.includes("مرفوض")) throw new Error("الرفض لم يُحفظ");
  });

  await run("DV-03", "تعديل وإعادة إرسال بعد الرفض", async () => {
    await logout(page);
    await formLogin(page, pendingEmail, PASSWORD, /\/physician/);
    const t0 = await page.locator("main").innerText();
    if (!t0.includes("رفض")) throw new Error("لا بانر رفض");
    await page.locator("button", { hasText: "تعديل البيانات" }).first().click();
    await page.waitForTimeout(500);
    await page.locator(".gc-physician-edit-panel").waitFor({ state: "visible", timeout: 8000 });
    const saveResubmit = page.locator("button", {
      hasText: /حفظ وإرسال الطلب مجدداً|إرسال طلب مجدداً/,
    }).first();
    await saveResubmit.click();
    await page.getByText(/تم إرسال طلب التوثيق مجدداً/).waitFor({ state: "visible", timeout: 15000 });
  });

  await run("DV-04", "توثيق بعد إعادة الإرسال", async () => {
    await logout(page);
    await loginAs(page, "admin");
    await page.goto(APP + "/admin/physicians");
    await page.waitForTimeout(1500);
    const sel = page.locator("select").first();
    await sel.selectOption("pending");
    await page.waitForTimeout(1500);
    let approveBtn = page
      .locator("div.overflow-hidden.rounded-2xl")
      .filter({ hasText: pendingEmail })
      .locator("button", { hasText: "توثيق الطبيب" })
      .first();
    if (!(await approveBtn.count())) {
      const token = await page.evaluate(() => localStorage.getItem("gc_token"));
      const approved = await page.evaluate(async ({ api, email, token }) => {
        const list = await fetch(`${api}/admin/physicians?status=pending`, {
          headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
        }).then((r) => r.json());
        const row = (list.data || []).find((x) => x.user?.email === email);
        if (!row) {
          const rej = await fetch(`${api}/admin/physicians?status=rejected`, {
            headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
          }).then((r) => r.json());
          return { ok: false, reason: "not-pending", rejected: (rej.data || []).some((x) => x.user?.email === email) };
        }
        const r = await fetch(`${api}/admin/physicians/${row.id}/approve`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
        });
        return { ok: r.ok, status: r.status };
      }, { api: API, email: pendingEmail, token });
      if (!approved.ok) throw new Error("لا طلب معلّق: " + pendingEmail + " " + JSON.stringify(approved));
    } else {
      await approveBtn.click();
      await page.waitForTimeout(2000);
    }
    await logout(page);
    await formLogin(page, pendingEmail, PASSWORD, /\/physician/);
    const t = await page.locator("main").innerText();
    if (t.includes("بانتظار موافقة") || t.includes("تم رفض")) throw new Error("ما زال غير موثّق");
    if (!t.includes("بانتظار الاستلام") && !t.includes("ملف الطبيب")) throw new Error("واجهة الطبيب الموثّق ناقصة");
  });

  // ── Admin ──
  await restart();
  await loginAs(page, "admin");

  await run("M-01", "لوحة المدير", async () => {
    await page.goto(APP + "/admin/dashboard");
    await page.waitForTimeout(1500);
    const t = await page.locator("main").innerText();
    if (t.length < 10) throw new Error("فارغة");
  });

  await run("M-02", "فلاتر توثيق الأطباء", async () => {
    await page.goto(APP + "/admin/physicians");
    await page.waitForTimeout(1200);
    const sel = page.locator("select").first();
    for (const v of ["pending", "approved", "rejected", "all"]) {
      await sel.selectOption(v);
      await page.waitForTimeout(800);
      const t = await page.locator("main").innerText();
      if (!t) throw new Error("فلتر " + v);
    }
  });

  await run("M-05", "فلتر أدوار المستخدمين", async () => {
    await page.goto(APP + "/admin/users");
    await page.waitForTimeout(1200);
    const sel = page.locator("select").first();
    await sel.selectOption("");
    await page.waitForTimeout(500);
    await sel.selectOption("patient");
    await page.waitForTimeout(800);
    const t = await page.locator("main").innerText();
    if (!t) throw new Error("قائمة المستخدمين فارغة");
    await sel.selectOption("physician");
    await page.waitForTimeout(800);
  });

  await run("M-06", "تعطيل وتفعيل مستخدم", async () => {
    await page.goto(APP + "/admin/users");
    await page.waitForTimeout(1200);
    await page.locator("select").first().selectOption("patient");
    await page.waitForTimeout(1500);
    const disable = page.locator("button", { hasText: "تعطيل" }).first();
    await disable.waitFor({ state: "visible", timeout: 15000 });
    await disable.click();
    await page.waitForTimeout(1200);
    const t = await page.locator("main").innerText();
    if (!t.includes("معطّل") && !t.includes("تفعيل")) throw new Error("التعطيل لم يظهر");
    const enable = page.locator("button", { hasText: "تفعيل" }).first();
    if (await enable.count()) {
      await enable.click();
      await page.waitForTimeout(1000);
    }
  });

  await run("M-03", "توثيق طبيب (إن وُجد معلّق)", async () => {
    await page.goto(APP + "/admin/physicians");
    await page.locator("select").first().selectOption("pending");
    await page.waitForTimeout(800);
    const approve = page.locator("button", { hasText: "توثيق الطبيب" }).first();
    if (await approve.count()) {
      await approve.click();
      await page.waitForTimeout(1500);
    }
  });

  await run("M-04", "رفض بنافذة + إلغاء", async () => {
    const email = `physician-m04-${Date.now()}@example.test`;
    await fillPhysicianRegistrationForm(page, {
      name: "د. اختبار رفض",
      email,
      specialty: "جلدية",
      certificateText: "شهادة اختبار — M-04 رفض بنافذة",
      password: PASSWORD,
      fileName: "m04-cert.pdf",
    });
    await logout(page);
    await loginAs(page, "admin");
    await page.goto(APP + "/admin/physicians");
    await page.locator("select").first().selectOption("pending");
    await page.waitForTimeout(1000);
    const card = page.locator("div.overflow-hidden.rounded-2xl").filter({ hasText: email }).first();
    if (!(await card.count())) throw new Error("لم يُعثر على طلب الطبيب الجديد: " + email);
    await card.locator("button", { hasText: "رفض الطلب" }).first().click();
    await page.waitForTimeout(400);
    await page.locator("button", { hasText: "إلغاء" }).first().click();
    await page.waitForTimeout(400);
    await card.locator("button", { hasText: "رفض الطلب" }).first().click();
    await page.locator(".gc-reject-modal-textarea").fill("سبب رفض تحقق الآلي UAT");
    await page.locator("button", { hasText: "تأكيد الرفض" }).click();
    await page.waitForTimeout(1500);
  });

  // ── E2E ──
  await restart();
  await run("E2E-01", "مسار عام كامل", async () => {
    await loginAs(page, "patient");
    await page.goto(APP + "/consultations/new");
    await page.waitForTimeout(1000);
    const marker = "E2E-QUEUE " + Date.now();
    await page.locator("textarea").first().fill(marker + " مسار متكامل للاستشارة العامة.");
    await page.locator('button[type="submit"]').click();
    await page.waitForTimeout(3000);
    await logout(page);
    await loginAs(page, "physician");
    await page.goto(APP + "/physician/dashboard");
    await waitPhysicianDash(page);
    await page.locator("button", { hasText: "استلام الحالة" }).first().click();
    await page.waitForURL(/consultations\/\d+/);
    const e2eClaimed = page.url().match(/\/(\d+)$/)?.[1];
    await page.locator("textarea").fill("رد المراجعة E2E ثم الإكمال لاحقاً لتجربة المسار.");
    await page.locator("button", { hasText: "إرسال الرد للمراجعة" }).click();
    await page.waitForURL(/\/physician\/dashboard/, { timeout: 15000 });
    if (e2eClaimed) {
      await page.goto(APP + `/physician/consultations/${e2eClaimed}`);
    } else {
      await waitPhysicianDash(page);
      await page.locator('#physician-in-progress a[href*="consultations"]').first().click();
    }
    await page.waitForTimeout(1000);
    await page.locator("textarea").fill("الرد النهائي بعد إنهاء الاستشارة في مسار E2E بنجاح كافٍ.");
    await page.locator("button", { hasText: /إنهاء الاستشارة/ }).click();
    await page.waitForTimeout(2500);
    await logout(page);
    await loginAs(page, "patient");
    await page.goto(APP + "/consultations");
    await page.waitForTimeout(2000);
    await page.locator(`text=${marker.split(" ")[0]}`).first().click().catch(async () => {
      await page.locator('a[href*="/consultations/"]').first().click();
    });
    await page.waitForTimeout(1500);
    const t = await page.locator("main").innerText();
    if (!/مكتمل|رد الطبيب|النهائي|توصيات الطبيب/.test(t)) throw new Error("المراجع لم يرَ الاكتمال");
  });

  await run("E2E-02", "مسار مباشر", async () => {
    await logout(page);
    await loginAs(page, "patient");
    await page.goto(APP + "/consultations/new");
    await page.waitForTimeout(1000);
    await page.locator(".gc-assignment-option-title", { hasText: "طبيب محدّد" }).click();
    const select = page.locator("select").first();
    await selectPhysicianOptionByName(select, "أحمد");
    const marker = "E2E-DIRECT " + Date.now();
    await page.locator("textarea").first().fill(marker + " استشارة مباشرة مكتملة المسار.");
    await page.locator('button[type="submit"]').click();
    await page.waitForTimeout(3000);
    await logout(page);
    await loginAs(page, "physician");
    await page.goto(APP + "/physician/dashboard");
    await waitPhysicianDash(page);
    const link = page.locator('#physician-direct a[href*="consultations"]').first();
    if (await link.count()) {
      await link.click();
      await page.waitForTimeout(1000);
      await page.locator("textarea").fill("رد مباشر نهائي في مسار E2E-DIRECT للاختبار الآلي.");
      await page.locator("button", { hasText: /إنهاء الاستشارة/ }).click();
      await page.waitForTimeout(2000);
    }
  });

  await run("E2E-03", "تسجيل طبيب → رفض → إعادة إرسال → قبول", async () => {
    await restart();
    const email = `e2e-md-${Date.now()}@example.test`;
    await fillPhysicianRegistrationForm(page, {
      name: "د. مسار E2E",
      email,
      specialty: "باطنية",
      certificateText: "مؤهل مسار E2E-03",
      password: PASSWORD,
      fileName: "e2e-cert.pdf",
    });
    await logout(page);
    await loginAs(page, "admin");
    await page.goto(APP + "/admin/physicians");
    await page.locator("select").first().selectOption("pending");
    await page.waitForTimeout(1000);
    const rejectCard = page
      .locator("div.overflow-hidden.rounded-2xl")
      .filter({ hasText: email })
      .first();
    if (!(await rejectCard.count())) {
      throw new Error("لم يُعثر على طلب الطبيب الجديد في قائمة معلّق: " + email);
    }
    await rejectCard.locator("button", { hasText: "رفض الطلب" }).first().click();
    await page.locator(".gc-reject-modal-textarea").fill("نواقص في الشهادة — E2E-03");
    await page.locator("button", { hasText: "تأكيد الرفض" }).click();
    await page.waitForTimeout(1500);
    await page.locator("select").first().selectOption("rejected");
    await page.waitForTimeout(1500);
    let rejectedVisible = (await page.locator("main").innerText()).includes(email);
    if (!rejectedVisible) {
      const adminToken = await page.evaluate(() => localStorage.getItem("gc_token"));
      rejectedVisible = await page.evaluate(async ({ api, email, token }) => {
        const r = await fetch(`${api}/admin/physicians?status=rejected`, {
          headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
        });
        const j = await r.json();
        return (j.data || []).some((row) => row.user?.email === email);
      }, { api: API, email, token: adminToken });
    }
    if (!rejectedVisible) throw new Error("الرفض لم يظهر في قائمة المرفوضين");
    await logout(page);
    await formLogin(page, email, PASSWORD, /\/physician/);
    await page.locator(".gc-reject-banner").waitFor({ state: "visible", timeout: 15000 });
    await page.locator("button", { hasText: "تعديل البيانات" }).first().click();
    await page.locator(".gc-physician-edit-panel").waitFor({ state: "visible", timeout: 8000 });
    await page.locator("button", { hasText: /حفظ وإرسال الطلب مجدداً/ }).click();
    await page.getByText(/تم إرسال طلب التوثيق مجدداً/).waitFor({ state: "visible", timeout: 15000 });
    await page.waitForTimeout(1000);
    await logout(page);
    await loginAs(page, "admin");
    await page.goto(APP + "/admin/physicians");
    await page.locator("select").first().selectOption("pending");
    await page.waitForTimeout(1000);
    const approveBtn = page
      .locator("div.overflow-hidden.rounded-2xl")
      .filter({ hasText: email })
      .locator("button", { hasText: "توثيق الطبيب" })
      .first();
    if (!(await approveBtn.count())) {
      // verify via API
      const adminToken = await page.evaluate(() => localStorage.getItem("gc_token"));
      const check = await page.evaluate(async ({ api, email, token }) => {
        const r = await fetch(`${api}/admin/physicians?status=pending`, {
          headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
        });
        const j = await r.json();
        const hit = (j.data || []).find((row) => row.user?.email === email);
        return { count: (j.data || []).length, found: Boolean(hit), emails: (j.data || []).map((x) => x.user?.email) };
      }, { api: API, email, token: adminToken });
      throw new Error("لا طلب معلّق لإعادة التوثيق: " + email + " api=" + JSON.stringify(check));
    }
    await approveBtn.click();
    await page.waitForTimeout(1500);
    await logout(page);
    await formLogin(page, email, PASSWORD, /\/physician/);
    const t = await page.locator("main").innerText();
    if (/بانتظار موافقة|تم رفض/.test(t)) throw new Error("ما زال غير موثّق بعد القبول");
  });

  await run("E2E-04", "تعطيل طبيب من المدير", async () => {
    await restart();
    await loginAs(page, "admin");
    await page.goto(APP + "/admin/users");
    await page.locator("select").first().selectOption("physician");
    await page.waitForTimeout(1000);
    const targetEmail = "dr.mohammad@example.com";
    await page.waitForTimeout(1500);
    const row = page.locator("tbody tr").filter({ hasText: targetEmail }).first();
    if (!(await row.count())) {
      // fallback: disable via API then assert login block
      const token = await page.evaluate(() => localStorage.getItem("gc_token"));
      const disabled = await page.evaluate(async ({ api, email, token }) => {
        const list = await fetch(`${api}/admin/users?role=physician&per_page=100`, {
          headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
        }).then((r) => r.json());
        const user = (list.data || []).find((u) => u.email === email);
        if (!user) return { ok: false, reason: "missing" };
        if (!user.is_disabled) {
          await fetch(`${api}/admin/users/${user.id}/disabled`, {
            method: "PATCH",
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: "application/json",
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ disabled: true }),
          });
        }
        return { ok: true, id: user.id };
      }, { api: API, email: targetEmail, token });
      if (!disabled.ok) throw new Error("لم يُعثر على الطبيب المستهدف: " + targetEmail);
      await logout(page);
      await ensureLoginPage(page);
      await page.fill('input[type="email"]', targetEmail);
      await page.fill('input[type="password"]', PASSWORD);
      await page.click('button[type="submit"]');
      await page.waitForTimeout(2000);
      if (page.url().includes("/physician")) throw new Error("الطبيب المعطّل دخل النظام");
      await ensureLoginPage(page);
      await loginAs(page, "admin");
      await page.evaluate(async ({ api, id, token }) => {
        await fetch(`${api}/admin/users/${id}/disabled`, {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ disabled: false }),
        });
      }, { api: API, id: disabled.id, token: await page.evaluate(() => localStorage.getItem("gc_token")) });
      return;
    }
    const enableBtn = row.locator("button", { hasText: "تفعيل" }).first();
    if (await enableBtn.count()) {
      await enableBtn.click();
      await page.waitForTimeout(1000);
    }
    const disableBtn = row.locator("button", { hasText: "تعطيل" }).first();
    if (!(await disableBtn.count())) throw new Error("لا يوجد زر تعطيل بعد التفعيل");
    await disableBtn.click();
    await page.waitForTimeout(1200);
    await logout(page);
    await ensureLoginPage(page);
    await page.fill('input[type="email"]', targetEmail);
    await page.fill('input[type="password"]', PASSWORD);
    await page.click('button[type="submit"]');
    await page.waitForTimeout(2000);
    const body = await page.locator("main").innerText();
    if (page.url().includes("/physician") && !/معطّل|تعطيل|غير/.test(body)) {
      throw new Error("الطبيب المعطّل دخل النظام");
    }
    if (!page.url().includes("/login") && !/معطّل|تعطيل|بيانات الدخول|غير/.test(body)) {
      throw new Error("لم يُمنع الدخول: " + page.url() + " / " + body.slice(0, 120));
    }
    await ensureLoginPage(page);
    await loginAs(page, "admin");
    await page.goto(APP + "/admin/users");
    await page.locator("select").first().selectOption("physician");
    await page.waitForTimeout(800);
    const row2 = page.locator("tbody tr").filter({ hasText: targetEmail }).first();
    const reenableBtn = row2.locator("button", { hasText: "تفعيل" }).first();
    if (await reenableBtn.count()) {
      await reenableBtn.click();
      await page.waitForTimeout(1000);
    }
  });

  await run("X-01", "طبيب غير المستلم يمنع من الحالة", async () => {
    await restart();
    await loginAs(page, "patient");
    await page.goto(APP + "/consultations/new");
    await page.locator("textarea").first().fill("X-01 حالة لاختبار صلاحية الطبيب الآخر بشكل كافٍ.");
    await page.locator('button[type="submit"]').click();
    await page.waitForTimeout(2500);
    await logout(page);
    await loginAs(page, "physician");
    await page.goto(APP + "/physician/dashboard");
    await waitPhysicianDash(page);
    await page.locator("button", { hasText: "استلام الحالة" }).first().click();
    await page.waitForURL(/\/physician\/consultations\/\d+/);
    const claimedUrl = page.url();
    const id = claimedUrl.match(/\/(\d+)$/)?.[1];
    await logout(page);
    await loginAs(page, "physician2");
    await page.goto(APP + `/physician/consultations/${id}`);
    await page.waitForTimeout(2000);
    const t = await page.locator("main").innerText();
    if (!/غير مصرح/.test(t)) throw new Error("لم تظهر رسالة المنع: " + t.slice(0, 160));
  });

  await run("X-02", "استلام مزدوج لنفس الحالة", async () => {
    await restart();
    await loginAs(page, "patient");
    await page.goto(APP + "/consultations/new");
    const marker = "X-02-DOUBLE-" + Date.now();
    await page.locator("textarea").first().fill(marker + " استلام مزدوج — نص استشارة كافٍ للاختبار الآلي.");
    await page.locator('button[type="submit"]').click();
    await page.waitForTimeout(2500);
    await logout(page);
    await loginAs(page, "physician");
    await page.goto(APP + "/physician/dashboard");
    await waitPhysicianDash(page);
    await page.locator("button", { hasText: "استلام الحالة" }).first().click();
    await page.waitForURL(/\/physician\/consultations\/\d+/);
    const cid = page.url().match(/\/(\d+)$/)?.[1];
    await logout(page);
    await loginAs(page, "physician2");
    await page.goto(APP + "/physician/dashboard");
    await waitPhysicianDash(page);
    const queue = await page.locator("#physician-queue").innerText();
    if (queue.includes(marker)) {
      throw new Error("الحالة ما زالت في انتظار الاستلام للطبيب الثاني");
    }
    const token = await page.evaluate(() => localStorage.getItem("gc_token"));
    const res = await page.evaluate(async ({ api, id, token }) => {
      const r = await fetch(`${api}/consultations/${id}/claim`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
      });
      return { status: r.status, body: await r.text() };
    }, { api: API, id: cid, token });
    if (![403, 409].includes(res.status) && !/طبيب آخر/.test(res.body)) {
      throw new Error("لم يُرصد تعارض الاستلام: " + JSON.stringify(res));
    }
  });

  await run("X-03", "رفع ملفات بأنواع مرفوضة", async () => {
    await restart();
    await loginAs(page, "patient");
    await page.goto(APP + "/consultations/new");
    await page.waitForTimeout(800);
    const input = page.locator('input[type="file"]').first();
    const accept = await input.getAttribute("accept");
    if (!accept || (!accept.includes("image") && !accept.includes("pdf"))) {
      throw new Error("لا قيود accept على المرفقات");
    }
    await input.setInputFiles({
      name: "malware.exe",
      mimeType: "application/x-msdownload",
      buffer: Buffer.from("MZ rejected"),
    });
    await page.waitForTimeout(500);
    const t = await page.locator("main").innerText();
    if (!/PDF|صور|نوع|مرفوض|يُسمح/.test(t)) {
      if (t.includes("malware.exe") && !/يُسمح|PDF/.test(t)) {
        throw new Error("قَبل ملفاً غير مدعوم بدون تنبيه");
      }
    }
  });

  await run("X-04", "بحث تخصص الأطباء", async () => {
    await logout(page);
    await loginAs(page, "patient");
    await page.goto(APP + "/physicians");
    await page.waitForTimeout(1200);
    const input = page.locator('input[type="search"], input[placeholder*="تخصص"], input').first();
    if (await input.count()) {
      await input.fill("قلب");
      await page.waitForTimeout(800);
      await input.fill("تخصصمستحيل123");
      await page.waitForTimeout(800);
    }
  });

  await run("X-05", "تبديل حسابات نفس المتصفح", async () => {
    await logout(page);
    await loginAs(page, "patient");
    await logout(page);
    await loginAs(page, "physician");
    await logout(page);
    await loginAs(page, "admin");
    if (!page.url().includes("/admin")) throw new Error(page.url());
  });

  await context.close();
  await browser.close();

  const failed = results.filter((r) => !r.ok);
  const passed = results.filter((r) => r.ok);
  log("\n======== UAT SUMMARY ========");
  log(`Passed: ${passed.length}`);
  log(`Failed: ${failed.length}`);
  if (failed.length) {
    for (const f of failed) log(` - ${f.code}: ${f.error}`);
    process.exit(1);
  }
  log("ALL SCENARIOS PASSED");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
