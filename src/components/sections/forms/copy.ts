import type { AppLocale } from "@/i18n/routing";

const extra = {
  servicesStep: ["Services", "الخدمات"],
  serviceRequired: ["Select a service or ask for help deciding.", "اختر خدمة أو اطلب المساعدة في الاختيار."],
  detailsStep: ["Project details", "تفاصيل المشروع"],
  filesStep: ["Files and consent", "الملفات والموافقة"],
  reviewAction: ["Review request", "راجع طلبك"],
  goals: ["What should the project achieve?", "ما الذي ترغب في تحقيقه من المشروع؟"],
  existing: ["Existing system or links", "النظام الحالي أو الروابط"],
  features: ["Features to consider", "ميزات تودّ إضافتها"],
  otherFeatures: ["Other features or requirements", "ميزات أو متطلبات أخرى"],
  featureAccounts: ["User accounts", "حسابات المستخدمين"],
  featurePayments: ["Payments", "المدفوعات"],
  featureIntegrations: ["Integrations", "التكامل مع أنظمة أخرى"],
  featureBilingual: ["Arabic and English", "العربية والإنجليزية"],
  featureReporting: ["Reporting", "التقارير"],
  preferredContact: ["Preferred contact method", "طريقة التواصل المفضّلة"],
  reference: ["Your reference", "الرقم المرجعي لطلبك"],
  sealed: ["Request sealed", "تم تسجيل الطلب"],
  privacy: ["Privacy policy", "سياسة الخصوصية"],
  contactChannels: ["Direct channels", "قنوات التواصل المباشر"],
  socials: ["Social channels", "روابط التواصل الاجتماعي"],
  startQuote: ["Start a detailed quote", "ابدأ طلب عرض سعر مفصّلًا"],
  draftFiles: ["Reattach any files you want to include. Files are cleared when you reload.", "أعد إرفاق الملفات التي تريد تضمينها. تُزال الملفات عند إعادة تحميل الصفحة."],
  reviewEmpty: ["Not provided", "لم يُذكر"],
  emptyFile: ["Choose a file that isn’t empty.", "اختر ملفًا غير فارغ."],
  retryWait: ["Wait a moment, then try again.", "انتظر لحظة ثم حاول مجددًا."],
} as const;

export type FormCopyKey = keyof typeof extra;

export function formCopy(locale: AppLocale, key: FormCopyKey) {
  return extra[key][locale === "ar" ? 1 : 0];
}
