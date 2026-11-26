import Link from "next/link";
import VolcanoExperience from "@/experience/volcano/VolcanoExperience";
import "./lab.css";

export default async function VolcanoLab({
  searchParams,
}: {
  searchParams: Promise<{ locale?: string }>;
}) {
  const ar = (await searchParams).locale === "ar";
  const locale = ar ? "ar" : "en";
  return (
    <main dir={ar ? "rtl" : "ltr"} lang={locale}>
      <VolcanoExperience locale={locale} />
      <section className="cl-volcano-handoff">
        <div>
          <Link
            href={ar ? "?locale=en" : "?locale=ar"}
            hrefLang={ar ? "en" : "ar"}
            lang={ar ? "en" : "ar"}
          >
            {ar ? "English" : "العربية"}
          </Link>
          <h2>{ar ? "من الشيفرة إلى التجربة." : "From code to experience."}</h2>
          <p>
            {ar
              ? "مرّر للأعلى للعودة إلى البركان."
              : "Scroll back to retrace the eruption."}
          </p>
        </div>
      </section>
    </main>
  );
}
