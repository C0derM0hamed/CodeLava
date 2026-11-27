import { ArrowDown, ArrowRight } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { HeroVolcano } from "@/experience/volcano/HeroVolcano";
import { HeroStage } from "@/experience/volcano/HeroStage";
import { heroSound as englishSound } from "@/i18n/messages/en.json";
import { heroSound as arabicSound } from "@/i18n/messages/ar.json";
import "./lab.css";

export default async function HeroLab({ searchParams }: { searchParams: Promise<{ locale?: string; standalone?: string }> }) {
  const params = await searchParams;
  const ar = params.locale === "ar";
  const locale = ar ? "ar" : "en";
  const copy = (
    <>
      <span className="kicker-rule">{ar ? "ابتكار يتدفق برمجياً" : "Software & AI Solutions"}</span>
        <h1>{ar ? "ابنِ ما يدفع" : "Build what moves"}<br /> <span className="text-lava-gradient">{ar ? "أعمالك إلى الأمام." : "your business forward."}</span></h1>
        <p>{ar ? "نصمّم ونطوّر منتجات رقمية وبرمجيات مخصّصة وحلول ذكاء اصطناعي تنسجم مع طريقة عملك." : "CodeLava designs and engineers digital products, custom software and AI solutions around the way your business works."}</p>
        <div className="dl-lab-actions">
          <a href={`/${locale}/quote`}>{ar ? "ناقش مشروعك معنا" : "Discuss your project"}<ArrowRight size={16} /></a>
          <a href="#services">{ar ? "اكتشف خدماتنا" : "Explore our services"}<ArrowDown size={15} /></a>
        </div>
    </>
  );
  return (
    <main className="dl-lab" dir={ar ? "rtl" : "ltr"} lang={locale}>
      <header><div className="dl-lab-nav">
        <Logo size="md" />
        <a href={ar ? "/lab/hero" : "/lab/hero?locale=ar"} lang={ar ? "en" : "ar"}>{ar ? "English" : "العربية"}</a>
      </div></header>
      {params.standalone === "1" ? (
        <section className="dl-stage">
          <div className="dl-pin"><div className="dl-columns"><div className="dl-copy">{copy}</div><HeroVolcano locale={locale} /></div></div>
        </section>
      ) : <HeroStage locale={locale} soundLabels={ar ? arabicSound : englishSound}>{copy}</HeroStage>}
      <section className="dl-lab-next" id="services">
        <span className="kicker-rule">{ar ? "خدماتنا" : "Services"}</span>
        <h2>{ar ? "هندسة برمجية تنسجم مع طريقة عملك." : "Engineering for the way you work."}</h2>
        <p>{ar ? "من أول قرار في المنتج إلى الأنظمة التي تدعمه، نبني حول احتياجات فريقك الفعلية." : "From the first product decision to the systems behind it, we build around the work your team needs to get done."}</p>
      </section>
    </main>
  );
}
