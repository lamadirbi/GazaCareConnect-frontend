"use client";

import { createContext, useContext, useEffect, useState } from "react";

export type Lang = "ar" | "en";

export const translations = {
  ar: {
    // Meta
    siteTitle: "GazaCare Connect — استشارات طبية عن بُعد",
    siteDescription: "استشارات طبية عن بُعد من غزة — ملف طبي، مرفقات، ورد الطبيب بمكان واحد.",

    // Brand
    brandTagline: "استشارات طبية عن بُعد",

    // Landing nav
    howItWorks: "كيف يعمل",
    services: "الخدمات",
    faq: "أسئلة شائعة",
    createAccount: "إنشاء حساب",
    login: "تسجيل الدخول",
    loginFull: "تسجيل الدخول",
    backToHome: "الصفحة الرئيسية",

    // Hero
    heroBadge: "استشارات طبية عن بُعد — غزة",
    heroTitle: "احصل على رعاية طبية من المتخصصين",
    heroTitleHighlight: "من أي مكان وزمان",
    heroDesc: "منصة تجمع المرضى في قطاع غزة مع أطباء متخصصين يمكنهم تقديم مشورة طبية عن بُعد.",
    heroCta1: "أنشئ حسابك",
    heroCta2: "سجّل دخولك",

    // Stats
    statCompletedConsultations: "استشارات مكتملة",
    statVerifiedPhysicians: "أطباء موثّقون",
    statRegisteredPatients: "مرضى مسجّلون",

    // Hero card
    cardConsultationTitle: "استشارة كارديولوجي",
    cardConsultationStatus: "مكتملة",
    cardConsultationDate: "في انتظار الرد منذ يومين",
    cardPatientComplaint: "شكوى المريض",
    cardPatientComplaintText:
      "أعاني من ألم في الصدر متقطع منذ ثلاثة أسابيع تقريبًا. يزداد الألم عند المجهود ويخف عند الراحة.",
    cardAttachments: "المرفقات",
    cardDoctorReply: "رد الطبيب المتخصص",
    cardDoctorReplyText:
      "بناءً على الأعراض المذكورة، أنصح بإجراء تخطيط القلب الكهربائي في أقرب وقت ممكن. هذه الأعراض قد تستدعي فحصًا دقيقًا.",

    // How it works
    howTitle: "كيف يعمل",
    howSubtitle: "خطوات بسيطة لتحصل على مشورة طبية متخصصة في أقرب وقت ممكن",
    step1Title: "سجّل حسابك",
    step1Desc: "أنشئ حسابًا مجانيًا في دقيقة وأدخل بياناتك الأساسية وسجّلك الصحي.",
    step2Title: "أنشئ استشارة",
    step2Desc: "اشرح حالتك الصحية للطبيب وأرفق الصور والتقارير الطبية ذات الصلة.",
    step3Title: "اختر المتخصص",
    step3Desc: "اختر طبيبًا متخصصًا من قائمة أطباء موثّقين في التخصص الذي تحتاجه.",
    step4Title: "احصل على الرد",
    step4Desc: "يراجع الطبيب استشارتك ويرسل توصيات طبية واضحة ومفصّلة.",

    // Services
    servicesTitle: "ما نقدّمه لمجتمعنا",
    servicesSubtitle: "كل ما تحتاجه لتلقّي رعاية طبية متخصصة عن بُعد",
    service1Title: "استشارات متخصصة",
    service1Desc: "تواصل مع أطباء معتمدين في مختلف التخصصات الطبية عن بُعد.",
    service2Title: "ملف طبي آمن",
    service2Desc: "احتفظ بسجلاتك الطبية منظّمة وآمنة ومتاحة للطبيب دائمًا.",
    service3Title: "مرفقات موثوقة",
    service3Desc: "أرسل صور ووثائق طبية مباشرة في الاستشارة.",
    service4Title: "ردود واضحة",
    service4Desc: "احصل على إجابات مفصّلة وتوصيات من طبيبك المختار.",
    service5Title: "وصول فوري",
    service5Desc: "ابدأ استشارتك في أي وقت من أي مكان حتى في أصعب الظروف.",
    service6Title: "دعم الأسرة",
    service6Desc: "يمكن لمقدّم الرعاية المساعدة في إدارة ملف مريض آخر عنه.",

    // FAQ
    faqTitle: "أسئلة شائعة",
    faqSubtitle: "أبرز الأسئلة التي يطرحها المستخدمون",
    faq1Q: "هل الاستشارات الطبية مدفوعة الأجر؟",
    faq1A: "لا. المنصة تعمل بشكل تطوعي والاستشارات الطبية تقدّم مجانًا.",
    faq2Q: "كيف يمكنني تحميل التقارير الطبية في الاستشارة؟",
    faq2A: "بإمكانك رفع الملفات مباشرة. يدعم النظام ملفات PDF والصور بحدّ أقصى 20 ميجابايت للملف الواحد.",
    faq3Q: "ما أنواع الملفات المسموح برفعها؟",
    faq3A: "مسموح برفع ملفات PDF وصور JPG وPNG وصيغ الصور الشائعة.",
    faq4Q: "هل بياناتي الطبية آمنة؟",
    faq4A: "نعم، يتم تخزين بياناتك بشكل آمن ومشفّر. لا يمكن الاطلاع عليها إلا من الطبيب المختار.",

    // CTA
    ctaTitle: "ابدأ استشارتك الطبية الآن",
    ctaSubtitle: "انضم إلى الآلاف من المرضى الذين يتلقّون رعاية طبية عن بُعد.",
    ctaBtn: "أنشئ حسابًا مجانيًا",

    // Login page
    loginPageTitle: "تسجيل الدخول",
    loginPageSubtitle: "أدخل بياناتك للوصول إلى حساب الرعاية.",
    emailLabel: "البريد الإلكتروني",
    emailPlaceholder: "أدخل بريدك الإلكتروني",
    passwordLabel: "كلمة المرور",
    passwordPlaceholder: "••••••••",
    forgotPassword: "نسيت كلمة المرور؟",
    loginBtn: "دخول",
    loginLoading: "جارٍ التحقق...",
    noAccount: "ليس لديك حساب؟",
    registerLink: "إنشاء حساب جديد",
    loginError422: "البريد الإلكتروني أو كلمة المرور غير صحيحة. تحقق من البيانات وحاول مجددًا.",

    // Register page
    registerPageTitle: "إنشاء حساب",
    registerPageSubtitle: "أنشئ حسابك للبدء في تلقّي الاستشارات الطبية.",
    nameLabel: "الاسم الكامل",
    namePlaceholder: "أدخل اسمك الكامل",
    phoneLabel: "رقم الجوال (اختياري)",
    roleLabel: "نوع الحساب",
    rolePatient: "مريض",
    rolePhysician: "طبيب",
    physicianInfoNotice: "سيتم مراجعة بياناتك من قِبَل الفريق قبل تفعيل الحساب. يُرجى رفع صورتك الشخصية والشهادات الطبية (PDF أو صورة). الاستشارات متاحة بعد التفعيل.",
    profilePhotoTitle: "الصورة الشخصية للطبيب (مطلوبة)",
    profilePhotoDesc: "ستظهر صورتك للمرضى عند استعراض قائمة الأطباء المتاحين.",
    changePhoto: "تغيير الصورة",
    choosePhoto: "اختيار الصورة",
    photoHint: "صورة واضحة للوجه (JPG أو PNG)",
    removePhoto: "إزالة",
    specialtyLabel: "التخصص",
    specialtyPlaceholder: "مثال: طب القلب، طب الأطفال، طب الأعصاب...",
    certificateLabel: "الشهادات / السيرة المهنية",
    certificatePlaceholder: "مثال: بكالوريوس طب جامعة ..../دكتوراه طب دولي...",
    certificateHint: "اذكر أبرز مؤهلاتك المهنية (بحدّ أقصى 5000 حرف).",
    certFilesLabel: "ملفات الشهادات",
    certFilesBtn: "اختيار ملفات الشهادات",
    certFilesHint: "يمكن رفع ملفات متعددة أو صور (PDF أو صورة). الحدّ الأقصى 20 ميغا للملف.",
    selectedFiles: "الملفات المختارة",
    registerBtn: "إنشاء الحساب",
    registerLoading: "جارٍ إنشاء الحساب...",
    uploadingLoading: "جارٍ رفع الملفات...",
    hasAccount: "لديك حساب؟",
    loginLinkText: "تسجيل الدخول",
    photoOnlyImageError: "يُرجى اختيار ملف صورة فقط لصورة الطبيب.",
    photoRequired: "يُرجى إضافة صورة شخصية للطبيب.",
    certRequired: "يُرجى إضافة ملف شهادة طبية واحدة على الأقل (PDF أو صورة).",
    cropTitle: "قصّ صورة الطبيب الشخصية",
    passwordTooShort: "كلمة المرور يجب أن لا تقل عن 8 أحرف على الأقل.",

    // AppHeader nav
    navDashboard: "لوحة التحكم",
    navUsers: "المستخدمون",
    navPhysiciansAdmin: "توثيق الأطباء",
    navPhysicianDashboard: "لوحة الطبيب",
    navPhysicians: "الأطباء",
    navProfile: "الملف الشخصي",
    navPassword: "كلمة المرور",
    navBack: "رجوع",
    navOpenMenu: "فتح القائمة الجانبية",
    navCloseMenu: "إغلاق القائمة الجانبية",
    navSidebarLabel: "القائمة الجانبية الرئيسية",
    navMainNav: "التنقل في لوحة التحكم",
    navMyDashboard: "ملاحظاتي",
    navDashboardSections: "أقسام اللوحة",
    navLogout: "تسجيل الخروج",
    navConfirmLogoutTitle: "العودة للرئيسية",
    navConfirmLogoutMsg: "سيتم تسجيل خروجك من الحساب الحالي. هل تريد المتابعة؟",
    navConfirmLogoutBtn: "العودة للرئيسية",
    navCancelBtn: "إلغاء",
    navConsultations: "الاستشارات",

    // Common
    loading: "جاري التحميل...",
    saving: "جاري الحفظ...",
    cancel: "إلغاء",
    confirm: "تأكيد",
    notSpecified: "غير محدد",
    none: "لا يوجد",
    years: "سنة",
    showPassword: "إظهار كلمة المرور",
    hidePassword: "إخفاء كلمة المرور",
    viewDetails: "عرض التفاصيل",
    serverErrorHint: "تأكد أن الخادم يعمل على المنفذ",
    newConsultation: "استشارة جديدة",

    // Roles
    rolePatientLabel: "مراجع مسجّل",
    rolePhysicianLabel: "طبيب مسجّل",
    roleAdminLabel: "مدير النظام",
    roleUserLabel: "مستخدم",
    welcome: "مرحباً،",
    loadingUserData: "جاري تحميل بياناتك...",

    // Dashboard
    dashboardTitle: "لوحة التحكم",
    dashboardLoading: "جاري تجهيز لوحة التحكم...",
    redirectingAdmin: "جاري التحويل إلى لوحة المدير...",
    caregiverActive: "وضع مرافق المريض مفعّل — صلة القرابة:",
    caregiverHint: "يمكنك تفعيل وضع مرافق المريض إذا كنت تقدّم استشارات نيابة عن قريب.",
    enableCaregiver: "تفعيل وضع مرافق المريض",
    disableCaregiver: "إيقاف وضع مرافق المريض",
    medicalSummaryTitle: "ملخص الملف الطبي",
    medicalSummaryDesc: "يظهر للطبيب عند مراجعة الاستشارة. يمكنك تعديله من الزر أدناه.",
    editMedicalProfile: "تعديل الملف الطبي",
    genderLabel: "الجنس",
    ageLabel: "العمر",
    heightLabel: "الطول",
    weightLabel: "الوزن",
    chronicDiseasesLabel: "أمراض مزمنة",
    allergiesLabel: "الحساسية",
    medicationsLabel: "الأدوية الحالية",
    verifiedPhysiciansTitle: "الأطباء الموثّقون",
    verifiedPhysiciansDesc: "تصفّح الأطباء وأرسل استشارة مباشرة لمن تختاره.",
    browsePhysicians: "عرض الأطباء",
    medicalProfileTitle: "الملف الطبي",
    medicalProfileDesc: "عدّل بياناتك الصحية.",
    openMedicalProfile: "فتح الملف الطبي",
    myConsultationsTitle: "استشاراتي",
    myConsultationsDesc: "أرسل استشارة جديدة أو راجع السابقة.",
    viewConsultations: "عرض الاستشارات",

    // Caregiver modal
    caregiverModalTitle: "تفعيل وضع مرافق المريض",
    caregiverModalDesc: "حدّد صلة قرابتك بالمريض الذي ترافقه. ستظهر هذه المعلومة للطبيب والإدارة عند إرسال الاستشارات.",
    caregiverRelationshipLabel: "صلة القرابة",
    caregiverRelationshipPlaceholder: "اختر صلة القرابة...",
    caregiverActivate: "تفعيل",
    relSon: "ابن",
    relDaughter: "ابنة",
    relSpouse: "زوج/ة",
    relFather: "أب",
    relMother: "أم",
    relBrother: "أخ",
    relSister: "أخت",

    // Gender
    genderMale: "ذكر",
    genderFemale: "أنثى",

    // Case severity
    severityMild: "بسيطة",
    severityModerate: "متوسطة",
    severityCritical: "حرجة",

    // Consultation status
    statusCompleted: "مكتملة",
    statusInReview: "قيد المراجعة",
    statusPending: "قيد الانتظار",

    // Assignment
    queueAssignmentLabel: "أرسلها لأول طبيب متاح",
    queueAssignmentShort: "بانتظار طبيب",
    queueAssignmentTitle: "بانتظار طبيب",
    queueAssignmentDesc: "ما زالت بانتظار أن يستلمها أول طبيب متاح.",

    // Physician dashboard sections
    physicianQueue: "استشارات بانتظار الاستلام",
    physicianDirect: "حالات موجّهة بشكل خاص",
    physicianInProgress: "حالات قيد المراجعة",
    physicianCompleted: "حالات مكتملة",

    // Consultations page
    consultationsLoading: "جاري تحميل الاستشارات...",
    consultationsHistory: "سجل الاستشارات",
    consultationsHistoryDesc: "كل استشاراتك هنا",
    consultationsDirectTitle: "موجّهة لطبيب محدّد",
    consultationsDirectDesc: "أرسلتها لطبيب معيّن وهي بانتظار رده.",
    consultationsQueuePending: "قيد الانتظار",
    consultationsCompletedTitle: "مكتملة",
    consultationsCompletedDesc: "الطبيب رد عليها.",
    consultationsEmpty: "لم تُرسل أي استشارة بعد.",
    consultationsEmptyCta: "أرسل أول استشارة",
    consultationsLoadError: "فشل تحميل الاستشارات",

    // Forgot password
    forgotPasswordTitle: "نسيت كلمة المرور؟",
    forgotPasswordSending: "جاري الإرسال...",
    forgotPasswordSubmit: "إرسال رابط إعادة التعيين",
    forgotPasswordBack: "العودة لتسجيل الدخول",
    forgotPasswordOpenMailpit: "فتح Mailpit",
    forgotPasswordToken: "الرمز:",
    forgotPasswordOpenReset: "فتح صفحة إعادة التعيين",
    forgotHintDefault: "أدخل بريدك الإلكتروني لإرسال رابط إعادة التعيين.",
    forgotHintMock: "أدخل بريد حساب تجريبي ليظهر رابط إعادة التعيين هنا.",
    forgotSuccessMock: "تم تجهيز الرابط. استخدميه أدناه.",
    forgotInfoMock: "البريد غير مسجّل. جرّبي حساباً من «دخول سريع».",
    forgotSuccessLocal: "تم الإرسال. افتحي Mailpit لرؤية الرسالة.",
    forgotSuccessEmail: "تم الإرسال. راجعي بريدك.",
    // Change password
    changePasswordTitle: "تغيير كلمة المرور",
    changePasswordSubtitle: "بعد التغيير ستحتاج لتسجيل الدخول من جديد.",
    currentPasswordLabel: "كلمة المرور الحالية",
    newPasswordLabel: "كلمة المرور الجديدة",
    confirmNewPasswordLabel: "تأكيد كلمة المرور الجديدة",
    passwordNewTooShort: "كلمة المرور الجديدة يجب أن تكون 8 أحرف على الأقل.",
    passwordConfirmMismatch: "تأكيد كلمة المرور غير متطابق.",
    changePasswordSubmit: "حفظ كلمة المرور",
    // Profile
    profileTitle: "الملف الطبي",
    profileLoadError: "فشل تحميل الملف الطبي",
    profileSaveSuccess: "تم حفظ التحديثات",
    profileLoading: "جاري تحميل الملف الطبي...",
    profileDesc: "هذه البيانات يراها الطبيب عند مراجعة استشارتك.",
    medicalHistoryLabel: "التاريخ الطبي",
    hideEdit: "إخفاء التعديل",
    editInfo: "تعديل المعلومات",
    heightCmLabel: "الطول (سم)",
    weightKgLabel: "الوزن (كغ)",
    saveChanges: "حفظ التعديل",
    profileSummaryTitle: "ملفك الطبي",
    profileSummarySubtitle: "يُرفق تلقائياً مع كل استشارة.",
    editProfile: "تعديل الملف",

    // Physicians list
    physiciansTitle: "الأطباء الموثّقون",
    physiciansLoading: "جاري تحميل الأطباء...",
    physiciansLoadError: "فشل تحميل الأطباء",
    physiciansDesc: "تصفّح الأطباء وأرسل استشارة لمن تختاره، أو أرسلها لأول طبيب متاح من صفحة استشارة جديدة.",
    specialtySearchPlaceholder: "بحث بالتخصص...",
    noVerifiedPhysicians: "لا يوجد أطباء موثّقون حالياً.",
    sendConsultationToDoctor: "إرسال استشارة لهذا الطبيب",
    doctorDefault: "طبيب",

    // New consultation
    newConsultationOpening: "جاري فتح الصفحة...",
    newConsultationLoading: "جاري تجهيز نموذج الاستشارة...",
    sendConsultationTitle: "إرسال استشارة",
    sendConsultationDesc: "اختر طريقة الإرسال، اكتب سؤالك، وأرفق الملفات عند الحاجة.",
    assignmentMethod: "طريقة الإرسال",
    assignmentMethodDesc: "لأول طبيب متاح، أو لطبيب تختاره.",
    queueAssignmentHint: "تبقى بانتظار أول طبيب متاح لاستلامها.",
    directAssignmentTitle: "طبيب محدّد",
    directAssignmentDesc: "تُرسل مباشرة إلى الطبيب الذي تختاره.",
    choosePhysician: "اختر الطبيب",
    chooseFromList: "— اختر من القائمة —",
    browseVerifiedPhysicians: "تصفح الأطباء الموثّقين",
    willSendToDr: "ستُرسل إلى د.",
    profileAttachedTitle: "ملفك الطبي",
    profileAttachedDesc: "يُرفق مع الاستشارة. راجع البيانات قبل الإرسال.",
    consultationQuestionTitle: "سؤال الاستشارة",
    consultationQuestionDesc: "صف أعراضك أو اكتب سؤالك الطبي.",
    consultationQuestionPlaceholder: "مثال: صداع منذ أسبوعين مع دوخة عند الوقوف. هل أحتاج فحوصات؟",
    minCharsHint: "أدخل 10 أحرف على الأقل",
    charCount: "حرف",
    attachmentsOptional: "مرفقات (اختياري)",
    attachmentsDesc: "تقارير، أشعة، أو تحاليل — PDF أو صورة.",
    chooseFiles: "اختيار ملفات",
    filesSelected: "ملف محدد",
    filesUploaded: "تم رفع",
    noFilesSelected: "لم تُختَر ملفات بعد",
    pdfImagesOnly: "يُسمح فقط بصور أو ملفات PDF.",
    selectedFilesTitle: "الملفات المحددة",
    sendingConsultation: "جاري الإرسال...",
    sendConsultationBtn: "إرسال الاستشارة",

    // Consultation detail
    consultationDetailTitle: "تفاصيل الاستشارة",
    consultationDetailLoading: "جاري تحميل تفاصيل الاستشارة...",
    consultationLoadError: "فشل تحميل الاستشارة",
    consultationNotFound: "لم يتم العثور على الاستشارة.",
    questionMinLength: "نص الاستشارة يجب أن يكون 10 أحرف على الأقل.",
    editConsultation: "تعديل الاستشارة",
    consultationTextLabel: "نص الاستشارة",
    medicalAttachments: "المرفقات الطبية",
    editAttachmentsHint: "احذف مرفقاً أو أضف تقارير/صور قبل رد الطبيب.",
    attachment: "مرفق",
    remove: "إزالة",
    noAttachmentsNow: "لا توجد مرفقات حالياً.",
    newFilesAdding: "ملف جديد قيد الإضافة",
    addNewAttachments: "أضف مرفقات جديدة (اختياري)",
    newFilesTitle: "ملفات جديدة",
    filesAttachedCount: "ملف(ات) مرفقة مع الاستشارة",
    doctorPrefix: "الدكتور/ة:",
    followUpPlaceholder: "اكتب سؤالاً متابعة أو توضيحاً للطبيب...",
    backToConsultations: "العودة إلى قائمة الاستشارات",

    // Physician dashboard
    physicianDashboardTitle: "لوحة الطبيب",
    physicianDashboardLoading: "جاري تحميل لوحة الطبيب...",
    physicianLoadError: "فشل تحميل الحالات",
    patientLabel: "المراجع:",
    patientMedicalProfile: "الملف الطبي للمراجع",
    noPatientProfile: "لا يوجد ملف طبي مكتمل لهذا المراجع.",
    attachedFiles: "الملفات المرفقة",
    continueReply: "تابع الرد مع المراجع...",

    // Physician sections
    physicianQueueTitle: "استشارات بانتظار الاستلام",
    physicianQueueDesc: "استشارات لم يستلمها أي طبيب بعد — يمكنك استلام أي منها للمراجعة.",
    newCase: "جديد",
    claimingCase: "جاري الاستلام...",
    claimCase: "استلام الحالة",
    noQueueCases: "لا توجد استشارات بانتظار الاستلام حالياً.",
    physicianInProgressTitle: "استشارات قيد المعالجة",
    physicianInProgressDesc: "استشارات استلمتها وما زالت بحاجة إلى إكمال الرد.",
    continueReplyBtn: "متابعة الرد",
    noInProgressCases: "لا توجد استشارات قيد المعالجة.",
    physicianDirectTitle: "حالات موجّهة إليك مباشرة",
    physicianDirectDesc: "استشارات وجّهها المراجع إليك مباشرة.",
    reviewAndReply: "مراجعة والرد",
    noDirectCases: "لا توجد استشارات موجّهة إليك مباشرة حالياً.",
    physicianCompletedTitle: "استشارات منتهية",
    physicianCompletedDesc: "الاستشارات التي أكملت الرد فيها.",
    noCompletedCases: "لا توجد استشارات منتهية بعد.",

    // Physician profile panel
    verificationResent: "تم إرسال طلب التوثيق مجدداً. ستظهر حالتك بانتظار المراجعة.",
    physicianInfoSaved: "تم حفظ معلومات الطبيب",
    certUploadSavedPlural: "تم رفع {count} مرفقات وحفظها.",
    certUploadSavedSingle: "تم رفع مرفق الشهادة وحفظه.",
    uploadThenSave: "تم الرفع؛ اضغط حفظ لإرفاق الملفات.",
    uploadThenSetSpecialty: "تم رفع الملفات. عيّن التخصص ثم احفظ لتثبيت المرفقات.",
    photoSaved: "تم حفظ الصورة الشخصية.",
    photoRemoved: "تمت إزالة الصورة الشخصية.",
    photoUploadFailed: "تعذّر رفع الصورة.",
    physicianFileLabel: "ملف الطبيب",
    physicianFileDesc: "تظهر للمراجع عند الرد على الاستشارة.",
    closeEdit: "إغلاق التعديل",
    editFile: "تعديل الملف",
    pendingVerification: "حسابك بانتظار موافقة الإدارة. لن تتمكن من عرض الحالات أو استلام الاستشارات حتى يتم توثيقك.",
    physicianPhoto: "صورة الطبيب",
    idPhotoTitle: "الصورة الشخصية (إثبات الهوية)",
    idPhotoDesc: "صورة واضحة لوجهك. تظهر للإدارة عند التوثيق وللمراجعين في الاستشارات.",
    uploading: "جاري الرفع...",
    removePhotoBtn: "إزالة الصورة",
    certCountLabel: "عدد مرفقات الشهادة",
    attachmentSingular: "مرفق",
    noAttachments: "لا توجد مرفقات",
    qualificationDesc: "وصف المؤهل",
    noQualificationYet: "لم يُضف وصف بعد.",
    certPreview: "معاينة",
    attachmentNumber: "مرفق #",
    noCertsAttached: "لا توجد شهادات مرفقة. يمكنك إضافتها من «تعديل البيانات».",
    verificationRejected: "تم رفض طلب التوثيق",
    noRejectionDetails: "لم تُذكر تفاصيل إضافية من الإدارة.",
    editData: "تعديل البيانات",
    resubmitRequest: "إرسال طلب مجدداً",
    editFileInfo: "تعديل معلومات الملف",
    qualificationOptional: "وصف المؤهل (اختياري)",
    certAttachmentsOptional: "مرفقات الشهادة (صور أو PDF)",
    multiFileHint: "يمكنك اختيار أكثر من ملف",
    saveAndResubmit: "حفظ وإرسال الطلب مجدداً",
    physicianInfoLoading: "جاري تحميل معلومات الطبيب...",
    cropProfilePhoto: "قص الصورة الشخصية",

    // Consultation thread & response
    replyPlaceholder: "اكتب ردك هنا...",
    replyTooShort: "الرد قصير جداً.",
    conversation: "المحادثة",
    conversationDesc: "ردود الاستشارة بين المراجع والطبيب",
    noMessagesYet: "لا توجد رسائل بعد.",
    doctorRole: "الطبيب",
    patientRole: "المراجع",
    sendReply: "إرسال الرد",
    sendingReply: "جاري الإرسال...",
    physicianReplyTitle: "رد الطبيب",
    caseSeverityLabel: "مدى خطورة الحالة",
    chooseSeverity: "اختر مستوى الحالة...",
    severityHint: "«للمراجعة» تُبقي الاستشارة قيد المعالجة. «إنهاء» يحوّلها إلى مكتملة ويرسل الرد للمراجع.",
    sendForReview: "إرسال الرد للمراجعة",
    completeConsultation: "إنهاء الاستشارة (مكتملة)",

    // Physician info modal
    physicianInfoTitle: "معلومات الطبيب —",
    certLoadError: "تعذر تحميل بعض مرفقات الشهادة",
    close: "إغلاق",
    specialtyColon: "التخصص:",
    noSpecialty: "لا يوجد تخصص مسجّل.",
    certificateColon: "الشهادة / المؤهل:",
    loadingPreviews: "جاري تحميل المعاينات...",
    certPreviewTitle: "معاينة الشهادة",
    downloadPrefix: "تنزيل —",
    noCertFile: "لا يوجد مرفق مسجّل لهذه الشهادة.",

    // Medical files
    fileTypeImage: "صورة",
    fileTypePdf: "ملف PDF",
    fileTypeAttachment: "مرفق",
    pdfPreview: "معاينة ملف PDF",
    fileBadge: "ملف",
    loadingPreview: "جاري تحميل المعاينة...",
    sizeLabel: "الحجم:",

    // Notifications
    notifications: "الإشعارات",
    notificationsList: "قائمة الإشعارات",
    markAllRead: "تعليم الكل كمقروء",
    noNotifications: "لا توجد إشعارات.",
    notifAccountDisabledTitle: "تم تعطيل حسابك",
    notifAccountDisabledBody: "تم تعطيل حسابك من قبل الإدارة. تواصل مع الدعم إذا كان ذلك بالخطأ.",
    notifPhysicianApprovedTitle: "تم توثيق حسابك",
    notifPhysicianApprovedBody: "وافقت الإدارة على طلب توثيق حسابك كطبيب. يمكنك الآن استقبال الاستشارات.",
    notifPhysicianRejectedTitle: "تم رفض طلب التوثيق",
    notifPhysicianRejectedBody: "رُفض طلب توثيق حسابك. يمكنك مراجعة السبب وإعادة الإرسال.",
    notifPhysicianPendingTitle: "طلب توثيق طبيب جديد",
    notifPhysicianPendingBody: "الدكتور {name} سجّل وينتظر مراجعة الشهادة.",
    notifPhysicianResubmitTitle: "إعادة إرسال طلب توثيق",
    notifPhysicianResubmitBody: "الدكتور {name} أعاد إرسال طلب التوثيق للمراجعة.",
    notifConsultationClaimedTitle: "تم استلام استشارتك",
    notifConsultationClaimedBody: "الدكتور {name} استلم استشارتك #{id}.",
    notifPatientMessageTitle: "رد جديد من المراجع",
    notifPatientMessageBody: "{name} أرسل متابعة على الاستشارة #{id}.",
    notifPhysicianMessageTitle: "رد جديد من الطبيب",
    notifPhysicianMessageBody: "الدكتور {name} أرسل متابعة على استشارتك #{id}.",
    notifConsultationRepliedTitle: "رد الطبيب على استشارتك",
    notifConsultationRepliedBody: "الدكتور {name} أرسل توصياته للاستشارة #{id}.",
    notifConsultationDirectTitle: "استشارة جديدة موجّهة إليك",
    notifConsultationDirectBody: "استشارة جديدة من {name} (#{id}).",

    // Confirm modal defaults
    confirmLogoutDefault: "نعم، خروج",

    listRefreshing: "جاري تحديث القائمة...",
    paginationPrev: "السابق",
    paginationNext: "التالي",
    paginationOf: "من",
    paginationNavLabel: "تنقل الصفحات",
    paginationItemConsultation: "استشارة",
    download: "تنزيل",
    followUpReplyLabel: "متابعة الرد",
    rejectionReasonColon: "سبب الرفض:",
    certAttachmentsSection: "مرفقات الشهادة",
    minCharsProgress: "أدخل 10 أحرف على الأقل ({count}/10)",
    filesSelectedCount: "{count} ملف محدد",
    filesUploadedCount: "تم رفع {count}",
    filesSelectedUploaded: "{selected} ملف محدد · تم رفع {uploaded}",
    certUploadSavedCount: "تم رفع {count} مرفقات وحفظها.",
    certAttachmentsCount: "مرفقات الشهادة ({count})",
    attachmentIndex: "مرفق #",
    certPreviewNamed: "معاينة {name}",
    cropModalHint: "اسحب الصورة واضبط التكبير ثم احفظ.",
    cropZoomLabel: "التكبير",
    savePhoto: "حفظ الصورة",
    cropDefaultTitle: "قص الصورة",

    // Consultation card
    consultSubmitted: "أُرسلت",
    consultQuestion: "نص الاستشارة",
    consultDoctorReply: "توصيات الطبيب",
    consultWaitingPatient: "بانتظار رد الطبيب",
    consultInReviewPatient: "الطبيب يراجع حالتك",
    consultWaitingPhysician: "بانتظار ردك",
    consultPatient: "المراجع:",
    consultTagDirectToYou: "موجّهة إليك",
    consultTagClaimed: "مستلَمة",
    consultTagDirect: "طبيب محدّد",
    consultTagGeneral: "إرسال عام",
    caseSeverityPrefix: "مستوى الحالة:",

    // Admin
    adminDashboardTitle: "لوحة المدير",
    adminDashboardLoading: "جاري تحميل لوحة المدير...",
    adminWelcomeDesc: "إدارة المستخدمين وتوثيق الأطباء.",
    adminPendingPhysicians: "طلبات توثيق أطباء",
    adminReviewRequests: "مراجعة الطلبات",
    adminUsersCard: "المستخدمون",
    adminManageUsers: "إدارة المستخدمين",
    adminInfoAlert: "يمكنك تعطيل حسابات المراجعين والأطباء، ومراجعة شهادات الأطباء الجدد قبل السماح لهم بالعمل.",
    adminUsersLoading: "جاري تحميل المستخدمين...",
    adminAllRoles: "كل الأدوار",
    adminPatientsFilter: "مرضى",
    adminPhysiciansFilter: "أطباء",
    adminUpdatingList: "جاري تحديث القائمة...",
    adminColName: "الاسم",
    adminColEmail: "البريد",
    adminColRole: "الدور",
    adminColStatus: "الحالة",
    adminColAction: "إجراء",
    adminDisabled: "معطّل",
    adminActive: "نشط",
    adminVerification: "توثيق:",
    adminVerifiedBy: "بواسطة:",
    adminEnable: "تفعيل",
    adminDisable: "تعطيل",
    rolePatientShort: "مراجع",
    rolePhysicianShort: "طبيب",
    roleAdminShort: "مدير",
    adminPhysiciansTitle: "توثيق الأطباء",
    adminPhysiciansLoading: "جاري تحميل طلبات الأطباء...",
    adminReviewPhysiciansTitle: "مراجعة طلبات الأطباء",
    adminReviewPhysiciansDesc: "راجع بيانات الطبيب وشهاداته، ثم وثّقه أو ارفض الطلب.",
    adminStatusPending: "بانتظار المراجعة",
    adminStatusApproved: "موثّق",
    adminStatusRejected: "مرفوض",
    adminStatusAll: "الكل",
    adminNoRequests: "لا توجد طلبات في هذا القسم.",
    adminAccountDisabled: "حساب معطّل",
    adminEmail: "البريد:",
    adminPhone: "الهاتف:",
    adminRegisteredAt: "تاريخ التسجيل:",
    adminVerifying: "جاري التوثيق...",
    adminApprovePhysician: "توثيق الطبيب",
    adminRejectRequest: "رفض الطلب",
    adminQualificationSection: "المؤهل والتخصص",
    adminSpecialty: "التخصص",
    adminCertificateDesc: "وصف الشهادة / المؤهل",
    adminCertAttachments: "مرفقات الشهادة",
    adminFilesCount: "ملف",
    adminNoAttachments: "لا توجد مرفقات مرفوعة لهذا الطبيب.",
    adminDownload: "تنزيل",
    adminRejectionReason: "سبب الرفض:",
    adminPhysicianDefault: "طبيب",
    fileKindImage: "صورة",
    fileKindFile: "ملف",
    rejectModalTitle: "رفض طلب التوثيق",
    rejectModalMessagePrefix: "أدخل سبب رفض طلب",
    rejectModalMessageSuffix: "سيظهر السبب للطبيب عند تسجيل الدخول.",
    rejectModalMessageGeneric: "أدخل سبب الرفض. سيظهر السبب للطبيب عند تسجيل الدخول.",
    rejectReasonLabel: "سبب الرفض",
    rejectReasonPlaceholder: "مثال: الشهادة غير واضحة أو التخصص غير مكتمل…",
    rejectConfirming: "جاري الرفض...",
    rejectConfirm: "تأكيد الرفض",
  },
  en: {
    // Meta
    siteTitle: "GazaCare Connect — Remote Medical Consultations",
    siteDescription: "Remote medical consultations from Gaza — medical record, attachments, and doctor response in one place.",

    // Brand
    brandTagline: "Remote Medical Consultations",

    // Landing nav
    howItWorks: "How It Works",
    services: "Services",
    faq: "FAQ",
    createAccount: "Sign Up",
    login: "Sign In",
    loginFull: "Sign In",
    backToHome: "Home",

    // Hero
    heroBadge: "Remote Medical Consultations — Gaza",
    heroTitle: "Get Medical Care from Specialists",
    heroTitleHighlight: "Anytime, Anywhere",
    heroDesc: "A platform connecting patients in Gaza with specialist doctors who can provide medical advice remotely.",
    heroCta1: "Create Account",
    heroCta2: "Sign In",

    // Stats
    statCompletedConsultations: "Completed Consultations",
    statVerifiedPhysicians: "Verified Physicians",
    statRegisteredPatients: "Registered Patients",

    // Hero card
    cardConsultationTitle: "Cardiology Consultation",
    cardConsultationStatus: "Completed",
    cardConsultationDate: "Waiting for reply for 2 days",
    cardPatientComplaint: "Patient Complaint",
    cardPatientComplaintText:
      "I have been experiencing intermittent chest pain for about three weeks. The pain increases with exertion and eases at rest.",
    cardAttachments: "Attachments",
    cardDoctorReply: "Specialist Doctor's Reply",
    cardDoctorReplyText:
      "Based on the symptoms described, I recommend an ECG as soon as possible. These symptoms may warrant a thorough examination.",

    // How it works
    howTitle: "How It Works",
    howSubtitle: "Simple steps to get specialized medical advice as quickly as possible",
    step1Title: "Create Your Account",
    step1Desc: "Create a free account in minutes, enter your basic information and medical history.",
    step2Title: "Start a Consultation",
    step2Desc: "Describe your condition to the doctor and attach relevant photos and medical reports.",
    step3Title: "Choose a Specialist",
    step3Desc: "Choose a verified doctor from our list of specialists in the field you need.",
    step4Title: "Get a Response",
    step4Desc: "The doctor reviews your consultation and sends clear, detailed medical recommendations.",

    // Services
    servicesTitle: "What We Offer Our Community",
    servicesSubtitle: "Everything you need to receive specialized medical care remotely",
    service1Title: "Specialist Consultations",
    service1Desc: "Connect with certified doctors in various medical specialties remotely.",
    service2Title: "Secure Medical Record",
    service2Desc: "Keep your medical records organized, secure, and always accessible to your doctor.",
    service3Title: "Reliable Attachments",
    service3Desc: "Send medical photos and documents directly in your consultation.",
    service4Title: "Clear Responses",
    service4Desc: "Get detailed answers and recommendations from your chosen doctor.",
    service5Title: "Instant Access",
    service5Desc: "Start your consultation anytime from anywhere, even in the most difficult circumstances.",
    service6Title: "Family Support",
    service6Desc: "A caregiver can help manage another patient's medical file on their behalf.",

    // FAQ
    faqTitle: "Frequently Asked Questions",
    faqSubtitle: "Common questions our users ask",
    faq1Q: "Are medical consultations paid?",
    faq1A: "No. The platform operates on a volunteer basis and medical consultations are provided for free.",
    faq2Q: "How can I upload medical reports in a consultation?",
    faq2A: "You can upload files directly. The system supports PDF files and images up to 20MB per file.",
    faq3Q: "What file types are allowed for upload?",
    faq3A: "PDF files, JPG, PNG images, and common image formats are supported.",
    faq4Q: "Is my medical data secure?",
    faq4A: "Yes, your data is stored securely and encrypted. Only the chosen doctor can access it.",

    // CTA
    ctaTitle: "Start Your Medical Consultation Now",
    ctaSubtitle: "Join thousands of patients receiving remote medical care.",
    ctaBtn: "Create a Free Account",

    // Login page
    loginPageTitle: "Sign In",
    loginPageSubtitle: "Enter your credentials to access your care account.",
    emailLabel: "Email Address",
    emailPlaceholder: "Enter your email address",
    passwordLabel: "Password",
    passwordPlaceholder: "••••••••",
    forgotPassword: "Forgot your password?",
    loginBtn: "Sign In",
    loginLoading: "Verifying...",
    noAccount: "Don't have an account?",
    registerLink: "Create a new account",
    loginError422: "Incorrect email or password. Please check your credentials and try again.",

    // Register page
    registerPageTitle: "Create Account",
    registerPageSubtitle: "Create your account to start receiving medical consultations.",
    nameLabel: "Full Name",
    namePlaceholder: "Enter your full name",
    phoneLabel: "Phone Number (optional)",
    roleLabel: "Account Type",
    rolePatient: "Patient",
    rolePhysician: "Physician",
    physicianInfoNotice: "Your information will be reviewed by the team before activating your account. Please upload your profile photo and medical certificates (PDF or image). Consultations are available after activation.",
    profilePhotoTitle: "Physician Profile Photo (Required)",
    profilePhotoDesc: "Your photo will be displayed to patients when browsing the list of available doctors.",
    changePhoto: "Change Photo",
    choosePhoto: "Choose Photo",
    photoHint: "A clear face photo (JPG or PNG)",
    removePhoto: "Remove",
    specialtyLabel: "Specialty",
    specialtyPlaceholder: "e.g. Cardiology, Pediatrics, Neurology...",
    certificateLabel: "Certificates / Professional Biography",
    certificatePlaceholder: "e.g. MD from ... University / International Medical PhD...",
    certificateHint: "List your key professional qualifications (max 5000 characters).",
    certFilesLabel: "Certificate Files",
    certFilesBtn: "Choose Certificate Files",
    certFilesHint: "You can upload multiple files or images (PDF or image). Max 20MB per file.",
    selectedFiles: "Selected Files",
    registerBtn: "Create Account",
    registerLoading: "Creating Account...",
    uploadingLoading: "Uploading Files...",
    hasAccount: "Already have an account?",
    loginLinkText: "Sign In",
    photoOnlyImageError: "Please select an image file for the doctor's profile photo.",
    photoRequired: "Please add a profile photo for the doctor.",
    certRequired: "Please add at least one medical certificate file (PDF or image).",
    cropTitle: "Crop Doctor Profile Photo",
    passwordTooShort: "Password must be at least 8 characters long.",

    // AppHeader nav
    navDashboard: "Dashboard",
    navUsers: "Users",
    navPhysiciansAdmin: "Physician verification",
    navPhysicianDashboard: "Physician Dashboard",
    navPhysicians: "Physicians",
    navProfile: "My Profile",
    navPassword: "Password",
    navBack: "Back",
    navOpenMenu: "Open side menu",
    navCloseMenu: "Close side menu",
    navSidebarLabel: "Main navigation sidebar",
    navMainNav: "Dashboard navigation",
    navMyDashboard: "My Notes",
    navDashboardSections: "Dashboard sections",
    navLogout: "Sign Out",
    navConfirmLogoutTitle: "Return to Home",
    navConfirmLogoutMsg: "You will be signed out of your current account. Do you want to continue?",
    navConfirmLogoutBtn: "Return to Home",
    navCancelBtn: "Cancel",
    navConsultations: "Consultations",

    // Common
    loading: "Loading...",
    saving: "Saving...",
    cancel: "Cancel",
    confirm: "Confirm",
    notSpecified: "Not specified",
    none: "None",
    years: "years",
    showPassword: "Show password",
    hidePassword: "Hide password",
    viewDetails: "View details",
    serverErrorHint: "Make sure the server is running on port",
    newConsultation: "New consultation",

    // Roles
    rolePatientLabel: "Registered patient",
    rolePhysicianLabel: "Registered physician",
    roleAdminLabel: "System administrator",
    roleUserLabel: "User",
    welcome: "Welcome,",
    loadingUserData: "Loading your data...",

    // Dashboard
    dashboardTitle: "Dashboard",
    dashboardLoading: "Preparing your dashboard...",
    redirectingAdmin: "Redirecting to admin dashboard...",
    caregiverActive: "Caregiver mode is on — relationship:",
    caregiverHint: "You can enable caregiver mode if you submit consultations on behalf of a relative.",
    enableCaregiver: "Enable caregiver mode",
    disableCaregiver: "Disable caregiver mode",
    medicalSummaryTitle: "Medical profile summary",
    medicalSummaryDesc: "Shown to the doctor when reviewing your consultation. You can edit it below.",
    editMedicalProfile: "Edit medical profile",
    genderLabel: "Gender",
    ageLabel: "Age",
    heightLabel: "Height",
    weightLabel: "Weight",
    chronicDiseasesLabel: "Chronic conditions",
    allergiesLabel: "Allergies",
    medicationsLabel: "Current medications",
    verifiedPhysiciansTitle: "Verified physicians",
    verifiedPhysiciansDesc: "Browse doctors and send a consultation directly to the one you choose.",
    browsePhysicians: "Browse physicians",
    medicalProfileTitle: "Medical profile",
    medicalProfileDesc: "Update your health information.",
    openMedicalProfile: "Open medical profile",
    myConsultationsTitle: "My consultations",
    myConsultationsDesc: "Start a new consultation or review previous ones.",
    viewConsultations: "View consultations",

    // Caregiver modal
    caregiverModalTitle: "Enable caregiver mode",
    caregiverModalDesc: "Select your relationship to the patient you are assisting. This will be shown to the doctor and admin when submitting consultations.",
    caregiverRelationshipLabel: "Relationship",
    caregiverRelationshipPlaceholder: "Select relationship...",
    caregiverActivate: "Enable",
    relSon: "Son",
    relDaughter: "Daughter",
    relSpouse: "Spouse",
    relFather: "Father",
    relMother: "Mother",
    relBrother: "Brother",
    relSister: "Sister",

    // Gender
    genderMale: "Male",
    genderFemale: "Female",

    // Case severity
    severityMild: "Mild",
    severityModerate: "Moderate",
    severityCritical: "Critical",

    // Consultation status
    statusCompleted: "Completed",
    statusInReview: "Under review",
    statusPending: "Pending",

    // Assignment
    queueAssignmentLabel: "Sent to first available doctor",
    queueAssignmentShort: "Waiting for doctor",
    queueAssignmentTitle: "Waiting for doctor",
    queueAssignmentDesc: "Still waiting to be picked up by the first available doctor.",

    // Physician dashboard sections
    physicianQueue: "Consultations awaiting pickup",
    physicianDirect: "Directly assigned cases",
    physicianInProgress: "Cases under review",
    physicianCompleted: "Completed cases",

    // Consultations page
    consultationsLoading: "Loading consultations...",
    consultationsHistory: "Consultation history",
    consultationsHistoryDesc: "All your consultations are here",
    consultationsDirectTitle: "Assigned to a specific doctor",
    consultationsDirectDesc: "Sent to a chosen doctor and waiting for a reply.",
    consultationsQueuePending: "Pending",
    consultationsCompletedTitle: "Completed",
    consultationsCompletedDesc: "The doctor has replied.",
    consultationsEmpty: "You haven't sent any consultations yet.",
    consultationsEmptyCta: "Send your first consultation",
    consultationsLoadError: "Failed to load consultations",

    // Forgot password
    forgotPasswordTitle: "Forgot your password?",
    forgotPasswordSending: "Sending...",
    forgotPasswordSubmit: "Send reset link",
    forgotPasswordBack: "Back to sign in",
    forgotPasswordOpenMailpit: "Open Mailpit",
    forgotPasswordToken: "Token:",
    forgotPasswordOpenReset: "Open reset page",
    forgotHintDefault: "Enter your email to receive a password reset link.",
    forgotHintMock: "Enter a demo account email to show the reset link here.",
    forgotSuccessMock: "The link is ready. Use it below.",
    forgotInfoMock: "Email not registered. Try an account from Quick Login.",
    forgotSuccessLocal: "Sent. Open Mailpit to view the message.",
    forgotSuccessEmail: "Sent. Check your email.",
    // Change password
    changePasswordTitle: "Change password",
    changePasswordSubtitle: "After changing your password, you will need to sign in again.",
    currentPasswordLabel: "Current password",
    newPasswordLabel: "New password",
    confirmNewPasswordLabel: "Confirm new password",
    passwordNewTooShort: "New password must be at least 8 characters long.",
    passwordConfirmMismatch: "Password confirmation does not match.",
    changePasswordSubmit: "Save password",
    // Profile
    profileTitle: "Medical profile",
    profileLoadError: "Failed to load medical profile",
    profileSaveSuccess: "Changes saved",
    profileLoading: "Loading medical profile...",
    profileDesc: "This information is shown to the doctor when reviewing your consultation.",
    medicalHistoryLabel: "Medical history",
    hideEdit: "Hide edit",
    editInfo: "Edit information",
    heightCmLabel: "Height (cm)",
    weightKgLabel: "Weight (kg)",
    saveChanges: "Save changes",
    profileSummaryTitle: "Your medical profile",
    profileSummarySubtitle: "Automatically attached to every consultation.",
    editProfile: "Edit profile",

    // Physicians list
    physiciansTitle: "Verified physicians",
    physiciansLoading: "Loading physicians...",
    physiciansLoadError: "Failed to load physicians",
    physiciansDesc: "Browse doctors and send a consultation to one you choose, or send to the first available doctor from the new consultation page.",
    specialtySearchPlaceholder: "Search by specialty...",
    noVerifiedPhysicians: "No verified physicians at the moment.",
    sendConsultationToDoctor: "Send consultation to this doctor",
    doctorDefault: "Physician",

    // New consultation
    newConsultationOpening: "Opening page...",
    newConsultationLoading: "Preparing consultation form...",
    sendConsultationTitle: "Send consultation",
    sendConsultationDesc: "Choose how to send, write your question, and attach files if needed.",
    assignmentMethod: "Sending method",
    assignmentMethodDesc: "To the first available doctor, or to a doctor you choose.",
    queueAssignmentHint: "Stays waiting until the first available doctor picks it up.",
    directAssignmentTitle: "Specific doctor",
    directAssignmentDesc: "Sent directly to the doctor you choose.",
    choosePhysician: "Choose physician",
    chooseFromList: "— Choose from list —",
    browseVerifiedPhysicians: "Browse verified physicians",
    willSendToDr: "Will be sent to Dr.",
    profileAttachedTitle: "Your medical profile",
    profileAttachedDesc: "Attached to the consultation. Review before sending.",
    consultationQuestionTitle: "Consultation question",
    consultationQuestionDesc: "Describe your symptoms or write your medical question.",
    consultationQuestionPlaceholder: "Example: Headache for two weeks with dizziness when standing. Do I need tests?",
    minCharsHint: "Enter at least 10 characters",
    charCount: "characters",
    attachmentsOptional: "Attachments (optional)",
    attachmentsDesc: "Reports, scans, or lab results — PDF or image.",
    chooseFiles: "Choose files",
    filesSelected: "file(s) selected",
    filesUploaded: "uploaded",
    noFilesSelected: "No files selected yet",
    pdfImagesOnly: "Only images or PDF files are allowed.",
    selectedFilesTitle: "Selected files",
    sendingConsultation: "Sending...",
    sendConsultationBtn: "Send consultation",

    // Consultation detail
    consultationDetailTitle: "Consultation details",
    consultationDetailLoading: "Loading consultation details...",
    consultationLoadError: "Failed to load consultation",
    consultationNotFound: "Consultation not found.",
    questionMinLength: "Consultation text must be at least 10 characters.",
    editConsultation: "Edit consultation",
    consultationTextLabel: "Consultation text",
    medicalAttachments: "Medical attachments",
    editAttachmentsHint: "Remove an attachment or add reports/images before the doctor replies.",
    attachment: "Attachment",
    remove: "Remove",
    noAttachmentsNow: "No attachments at the moment.",
    newFilesAdding: "new file(s) being added",
    addNewAttachments: "Add new attachments (optional)",
    newFilesTitle: "New files",
    filesAttachedCount: "file(s) attached to consultation",
    doctorPrefix: "Doctor:",
    followUpPlaceholder: "Write a follow-up question or clarification for the doctor...",
    backToConsultations: "Back to consultations list",

    // Physician dashboard
    physicianDashboardTitle: "Physician dashboard",
    physicianDashboardLoading: "Loading physician dashboard...",
    physicianLoadError: "Failed to load cases",
    patientLabel: "Patient:",
    patientMedicalProfile: "Patient medical profile",
    noPatientProfile: "No complete medical profile for this patient.",
    attachedFiles: "Attached files",
    continueReply: "Continue replying to the patient...",

    // Physician sections
    physicianQueueTitle: "Consultations awaiting pickup",
    physicianQueueDesc: "Consultations not yet picked up by any doctor — you can claim any for review.",
    newCase: "New",
    claimingCase: "Claiming...",
    claimCase: "Claim case",
    noQueueCases: "No consultations awaiting pickup at the moment.",
    physicianInProgressTitle: "Consultations in progress",
    physicianInProgressDesc: "Consultations you claimed that still need a completed reply.",
    continueReplyBtn: "Continue reply",
    noInProgressCases: "No consultations in progress.",
    physicianDirectTitle: "Directly assigned to you",
    physicianDirectDesc: "Consultations the patient sent directly to you.",
    reviewAndReply: "Review and reply",
    noDirectCases: "No consultations directly assigned to you at the moment.",
    physicianCompletedTitle: "Completed consultations",
    physicianCompletedDesc: "Consultations where you completed your reply.",
    noCompletedCases: "No completed consultations yet.",

    // Physician profile panel
    verificationResent: "Verification request sent again. Your status is pending review.",
    physicianInfoSaved: "Physician information saved",
    certUploadSavedPlural: "Uploaded {count} attachments and saved.",
    certUploadSavedSingle: "Certificate attachment uploaded and saved.",
    uploadThenSave: "Uploaded; click save to attach files.",
    uploadThenSetSpecialty: "Files uploaded. Set specialty then save to finalize attachments.",
    photoSaved: "Profile photo saved.",
    photoRemoved: "Profile photo removed.",
    photoUploadFailed: "Failed to upload photo.",
    physicianFileLabel: "Physician file",
    physicianFileDesc: "Shown to patients when replying to consultations.",
    closeEdit: "Close edit",
    editFile: "Edit file",
    pendingVerification: "Your account is pending admin approval. You cannot view or receive consultations until verified.",
    physicianPhoto: "Physician photo",
    idPhotoTitle: "Profile photo (ID verification)",
    idPhotoDesc: "A clear photo of your face. Shown to admin during verification and to patients in consultations.",
    uploading: "Uploading...",
    removePhotoBtn: "Remove photo",
    certCountLabel: "Certificate attachments",
    attachmentSingular: "attachment",
    noAttachments: "No attachments",
    qualificationDesc: "Qualification description",
    noQualificationYet: "No description added yet.",
    certPreview: "Preview",
    attachmentNumber: "Attachment #",
    noCertsAttached: "No certificates attached. You can add them from Edit data.",
    verificationRejected: "Verification request rejected",
    noRejectionDetails: "No additional details provided by admin.",
    editData: "Edit data",
    resubmitRequest: "Resubmit request",
    editFileInfo: "Edit file information",
    qualificationOptional: "Qualification description (optional)",
    certAttachmentsOptional: "Certificate attachments (images or PDF)",
    multiFileHint: "You can select multiple files",
    saveAndResubmit: "Save and resubmit request",
    physicianInfoLoading: "Loading physician information...",
    cropProfilePhoto: "Crop profile photo",

    // Consultation thread & response
    replyPlaceholder: "Write your reply here...",
    replyTooShort: "Reply is too short.",
    conversation: "Conversation",
    conversationDesc: "Consultation replies between patient and doctor",
    noMessagesYet: "No messages yet.",
    doctorRole: "Doctor",
    patientRole: "Patient",
    sendReply: "Send reply",
    sendingReply: "Sending...",
    physicianReplyTitle: "Doctor's reply",
    caseSeverityLabel: "Case severity",
    chooseSeverity: "Choose severity level...",
    severityHint: "For review keeps the consultation in progress. Complete marks it done and sends the reply to the patient.",
    sendForReview: "Send reply for review",
    completeConsultation: "Complete consultation",

    // Physician info modal
    physicianInfoTitle: "Physician info —",
    certLoadError: "Failed to load some certificate attachments",
    close: "Close",
    specialtyColon: "Specialty:",
    noSpecialty: "No specialty registered.",
    certificateColon: "Certificate / qualification:",
    loadingPreviews: "Loading previews...",
    certPreviewTitle: "Certificate preview",
    downloadPrefix: "Download —",
    noCertFile: "No attachment registered for this certificate.",

    // Medical files
    fileTypeImage: "Image",
    fileTypePdf: "PDF file",
    fileTypeAttachment: "Attachment",
    pdfPreview: "PDF preview",
    fileBadge: "File",
    loadingPreview: "Loading preview...",
    sizeLabel: "Size:",

    // Notifications
    notifications: "Notifications",
    notificationsList: "Notifications list",
    markAllRead: "Mark all as read",
    noNotifications: "No notifications.",
    notifAccountDisabledTitle: "Your account was disabled",
    notifAccountDisabledBody: "An administrator disabled your account. Contact support if this was a mistake.",
    notifPhysicianApprovedTitle: "Account verified",
    notifPhysicianApprovedBody: "Your physician account was approved. You can now receive consultations.",
    notifPhysicianRejectedTitle: "Verification rejected",
    notifPhysicianRejectedBody: "Your verification request was rejected. Review the reason and resubmit.",
    notifPhysicianPendingTitle: "New physician verification request",
    notifPhysicianPendingBody: "Dr. {name} registered and is awaiting certificate review.",
    notifPhysicianResubmitTitle: "Verification resubmitted",
    notifPhysicianResubmitBody: "Dr. {name} resubmitted their verification request for review.",
    notifConsultationClaimedTitle: "Consultation claimed",
    notifConsultationClaimedBody: "Dr. {name} picked up your consultation #{id}.",
    notifPatientMessageTitle: "New reply from patient",
    notifPatientMessageBody: "{name} sent a follow-up on consultation #{id}.",
    notifPhysicianMessageTitle: "New reply from physician",
    notifPhysicianMessageBody: "Dr. {name} sent a follow-up on consultation #{id}.",
    notifConsultationRepliedTitle: "Physician replied to your consultation",
    notifConsultationRepliedBody: "Dr. {name} sent recommendations for consultation #{id}.",
    notifConsultationDirectTitle: "New consultation assigned to you",
    notifConsultationDirectBody: "New consultation from {name} (#{id}).",

    // Confirm modal defaults
    confirmLogoutDefault: "Yes, sign out",

    listRefreshing: "Refreshing list...",
    paginationPrev: "Previous",
    paginationNext: "Next",
    paginationOf: "of",
    paginationNavLabel: "Page navigation",
    paginationItemConsultation: "consultation",
    download: "Download",
    followUpReplyLabel: "Continue reply",
    rejectionReasonColon: "Rejection reason:",
    certAttachmentsSection: "Certificate attachments",
    minCharsProgress: "Enter at least 10 characters ({count}/10)",
    filesSelectedCount: "{count} file(s) selected",
    filesUploadedCount: "{uploaded} uploaded",
    filesSelectedUploaded: "{selected} file(s) selected · {uploaded} uploaded",
    certUploadSavedCount: "{count} attachment(s) uploaded and saved.",
    certAttachmentsCount: "Certificate attachments ({count})",
    attachmentIndex: "Attachment #",
    certPreviewNamed: "Preview {name}",
    cropModalHint: "Drag the image, adjust zoom, then save.",
    cropZoomLabel: "Zoom",
    savePhoto: "Save photo",
    cropDefaultTitle: "Crop image",

    // Consultation card
    consultSubmitted: "Submitted",
    consultQuestion: "Consultation text",
    consultDoctorReply: "Doctor's recommendations",
    consultWaitingPatient: "Waiting for doctor's reply",
    consultInReviewPatient: "Doctor is reviewing your case",
    consultWaitingPhysician: "Waiting for your reply",
    consultPatient: "Patient:",
    consultTagDirectToYou: "Assigned to you",
    consultTagClaimed: "Claimed",
    consultTagDirect: "Specific doctor",
    consultTagGeneral: "General submission",
    caseSeverityPrefix: "Case severity:",

    // Admin
    adminDashboardTitle: "Admin Dashboard",
    adminDashboardLoading: "Loading admin dashboard...",
    adminWelcomeDesc: "Manage users and verify physicians.",
    adminPendingPhysicians: "Physician verification requests",
    adminReviewRequests: "Review requests",
    adminUsersCard: "Users",
    adminManageUsers: "Manage users",
    adminInfoAlert: "You can disable patient and physician accounts, and review new physician certificates before allowing them to work.",
    adminUsersLoading: "Loading users...",
    adminAllRoles: "All roles",
    adminPatientsFilter: "Patients",
    adminPhysiciansFilter: "Physicians",
    adminUpdatingList: "Updating list...",
    adminColName: "Name",
    adminColEmail: "Email",
    adminColRole: "Role",
    adminColStatus: "Status",
    adminColAction: "Action",
    adminDisabled: "Disabled",
    adminActive: "Active",
    adminVerification: "Verification:",
    adminVerifiedBy: "By:",
    adminEnable: "Enable",
    adminDisable: "Disable",
    rolePatientShort: "Patient",
    rolePhysicianShort: "Physician",
    roleAdminShort: "Admin",
    adminPhysiciansTitle: "Physician verification",
    adminPhysiciansLoading: "Loading physician requests...",
    adminReviewPhysiciansTitle: "Review physician requests",
    adminReviewPhysiciansDesc: "Review the physician's information and certificates, then verify or reject the request.",
    adminStatusPending: "Pending review",
    adminStatusApproved: "Verified",
    adminStatusRejected: "Rejected",
    adminStatusAll: "All",
    adminNoRequests: "No requests in this section.",
    adminAccountDisabled: "Account disabled",
    adminEmail: "Email:",
    adminPhone: "Phone:",
    adminRegisteredAt: "Registered:",
    adminVerifying: "Verifying...",
    adminApprovePhysician: "Verify physician",
    adminRejectRequest: "Reject request",
    adminQualificationSection: "Qualifications & specialty",
    adminSpecialty: "Specialty",
    adminCertificateDesc: "Certificate / qualification description",
    adminCertAttachments: "Certificate attachments",
    adminFilesCount: "file(s)",
    adminNoAttachments: "No attachments uploaded for this physician.",
    adminDownload: "Download",
    adminRejectionReason: "Rejection reason:",
    adminPhysicianDefault: "Physician",
    fileKindImage: "Image",
    fileKindFile: "File",
    rejectModalTitle: "Reject verification request",
    rejectModalMessagePrefix: "Enter the reason for rejecting",
    rejectModalMessageSuffix: "The reason will be shown to the physician when they sign in.",
    rejectModalMessageGeneric: "Enter the rejection reason. It will be shown to the physician when they sign in.",
    rejectReasonLabel: "Rejection reason",
    rejectReasonPlaceholder: "e.g. Certificate is unclear or specialty is incomplete…",
    rejectConfirming: "Rejecting...",
    rejectConfirm: "Confirm rejection",
  },
} as const;

export type TranslationKey = keyof typeof translations.ar;

type LanguageContextType = {
  lang: Lang;
  dir: "rtl" | "ltr";
  t: (key: TranslationKey) => string;
  toggleLang: () => void;
};

const LanguageContext = createContext<LanguageContextType | null>(null);

const STORAGE_KEY = "gc-lang";

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLang] = useState<Lang>("ar");

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY) as Lang | null;
    if (saved === "en" || saved === "ar") {
      setLang(saved);
    }
  }, []);

  useEffect(() => {
    const html = document.documentElement;
    html.lang = lang;
    html.dir = lang === "ar" ? "rtl" : "ltr";
    localStorage.setItem(STORAGE_KEY, lang);
  }, [lang]);

  function t(key: TranslationKey): string {
    return translations[lang][key] as string;
  }

  function toggleLang() {
    setLang((prev) => (prev === "ar" ? "en" : "ar"));
  }

  return (
    <LanguageContext.Provider value={{ lang, dir: lang === "ar" ? "rtl" : "ltr", t, toggleLang }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLang(): LanguageContextType {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLang must be used inside LanguageProvider");
  return ctx;
}

export function getGenderLabel(lang: Lang, value: string | null | undefined): string {
  if (value === "male") return translations[lang].genderMale;
  if (value === "female") return translations[lang].genderFemale;
  return translations[lang].notSpecified;
}

export function getCaseSeverityLabel(lang: Lang, value: string | null | undefined): string | null {
  if (value === "mild") return translations[lang].severityMild;
  if (value === "moderate") return translations[lang].severityModerate;
  if (value === "critical") return translations[lang].severityCritical;
  return null;
}

export function getConsultationStatusLabel(
  lang: Lang,
  status: "pending" | "completed",
  physicianResponse?: string | null,
): string {
  if (status === "completed") return translations[lang].statusCompleted;
  if (physicianResponse?.trim()) return translations[lang].statusInReview;
  return translations[lang].statusPending;
}

const CAREGIVER_REL_KEYS = {
  son: "relSon",
  daughter: "relDaughter",
  spouse: "relSpouse",
  father: "relFather",
  mother: "relMother",
  brother: "relBrother",
  sister: "relSister",
} as const;

export function getCaregiverRelationshipLabel(lang: Lang, value: string | null | undefined): string | null {
  if (!value) return null;
  const key = CAREGIVER_REL_KEYS[value as keyof typeof CAREGIVER_REL_KEYS];
  return key ? translations[lang][key] : null;
}

export function getPhysicianDashboardSections(lang: Lang) {
  const t = translations[lang];
  return [
    { id: "physician-queue", label: t.physicianQueue, href: "/physician/dashboard#physician-queue" },
    { id: "physician-direct", label: t.physicianDirect, href: "/physician/dashboard#physician-direct" },
    { id: "physician-in-progress", label: t.physicianInProgress, href: "/physician/dashboard#physician-in-progress" },
    { id: "physician-completed", label: t.physicianCompleted, href: "/physician/dashboard#physician-completed" },
  ] as const;
}

export function getAssignmentLabels(lang: Lang) {
  const t = translations[lang];
  return {
    label: t.queueAssignmentLabel,
    short: t.queueAssignmentShort,
    title: t.queueAssignmentTitle,
    desc: t.queueAssignmentDesc,
  };
}

function fillNotifTemplate(template: string, vars: { name?: string; id?: string }) {
  return template
    .replaceAll("{name}", vars.name ?? "")
    .replaceAll("{id}", vars.id ?? "");
}

function extractActorNameFromBody(body: string): string | null {
  const patterns = [
    /الدكتور\s+(.+?)\s+(?:استلم|أرسل|سجّل)/,
    /^(.+?)\s+أرسل\s+متابعة/,
    /استشارة جديدة من\s+(.+?)\s+\(/,
    /الدكتور\s+(.+?)\s+سجّل/,
  ];
  for (const re of patterns) {
    const m = body.match(re);
    if (m?.[1]) return m[1].trim();
  }
  return null;
}

export function getNotificationText(
  lang: Lang,
  n: { kind: string; title: string; body: string; meta?: Record<string, unknown> },
): { title: string; body: string } {
  const t = translations[lang];
  const meta = n.meta ?? {};
  const id = meta.consultation_id != null ? String(meta.consultation_id) : "";
  const name =
    (typeof meta.actor_name === "string" && meta.actor_name) ||
    extractActorNameFromBody(n.body) ||
    "";

  const withVars = (titleKey: keyof typeof t, bodyKey: keyof typeof t) => ({
    title: t[titleKey] as string,
    body: fillNotifTemplate(t[bodyKey] as string, { name, id }),
  });

  switch (n.kind) {
    case "account_disabled":
      return withVars("notifAccountDisabledTitle", "notifAccountDisabledBody");
    case "physician_approved":
      return withVars("notifPhysicianApprovedTitle", "notifPhysicianApprovedBody");
    case "physician_rejected":
      return withVars("notifPhysicianRejectedTitle", "notifPhysicianRejectedBody");
    case "physician_pending":
      return withVars("notifPhysicianPendingTitle", "notifPhysicianPendingBody");
    case "physician_resubmit":
      return withVars("notifPhysicianResubmitTitle", "notifPhysicianResubmitBody");
    case "consultation_claimed":
      return withVars("notifConsultationClaimedTitle", "notifConsultationClaimedBody");
    case "consultation_patient_message":
      return withVars("notifPatientMessageTitle", "notifPatientMessageBody");
    case "consultation_physician_message":
      return withVars("notifPhysicianMessageTitle", "notifPhysicianMessageBody");
    case "consultation_replied":
      return withVars("notifConsultationRepliedTitle", "notifConsultationRepliedBody");
    case "consultation_direct":
      return withVars("notifConsultationDirectTitle", "notifConsultationDirectBody");
    default:
      return { title: n.title, body: n.body };
  }
}

