"use client";

import { useTranslations } from "next-intl";
import type { AppLocale } from "@/i18n/routing";
import { formCopy } from "./copy";

export function useFormError(locale: AppLocale, kind: "contact" | "quote") {
  const validation = useTranslations("forms.validation");
  const attachments = useTranslations("forms.attachments");
  const page = useTranslations(kind);

  return (reason?: string) => {
    if (!reason) return undefined;
    const [code, amount] = reason.split(":");
    switch (code) {
      case "failure": return page("failure");
      case "retryWait": return formCopy(locale, "retryWait");
      case "uploadFailed": return attachments("uploadFailed");
      case "emptyFile": return formCopy(locale, "emptyFile");
      case "required": return validation("required");
      case "consent": return validation("consent");
      case "email": return validation("email");
      case "serviceIds": return validation("serviceIds");
      case "fileType": return validation("fileType");
      case "fileSize": return validation("fileSize", { size: Number(amount) });
      case "fileCount": return validation("fileCount", { count: Number(amount) });
      case "tooShort": return validation("tooShort", { min: Number(amount) });
      case "tooLong": return validation("tooLong", { max: Number(amount) });
      case "rateLimit": return validation("rateLimit");
      default: return validation("invalidOption");
    }
  };
}
