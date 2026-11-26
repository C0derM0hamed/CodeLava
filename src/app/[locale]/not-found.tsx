import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";

export default async function LocaleNotFound() {
  const t = await getTranslations("notFound");

  return (
    <main id="main-content" className="mx-auto max-w-5xl px-6 py-24">
      <h1 className="font-display text-5xl font-semibold">{t("title")}</h1>
      <p className="mt-5 text-lg text-muted">{t("description")}</p>
      <Link href="/" className="mt-8 inline-block text-accent-hot underline underline-offset-4">
        {t("home")}
      </Link>
    </main>
  );
}
