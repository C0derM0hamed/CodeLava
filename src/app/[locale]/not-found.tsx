import { getTranslations } from "next-intl/server";
import { LogoMark } from "@/components/brand/LogoMark";
import { ActionLink } from "@/components/ui/ActionLink";
import { Link } from "@/i18n/navigation";

const RECOVERY_LINKS = [
  { key: "services", href: "/services" },
  { key: "work", href: "/work" },
  { key: "blog", href: "/blog" },
  { key: "contact", href: "/contact" },
] as const;

export default async function LocaleNotFound() {
  const [t, tn] = await Promise.all([
    getTranslations("notFound"),
    getTranslations("nav"),
  ]);

  return (
    <main id="main-content" className="page-wash relative overflow-hidden bg-bg text-text">
      <div aria-hidden="true" className="magma-grid-bg pointer-events-none absolute inset-0 opacity-75" />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-1/2 -z-0 mx-auto h-[420px] max-w-3xl -translate-y-1/2 rounded-full opacity-45 blur-3xl"
        style={{
          background:
            "radial-gradient(ellipse 60% 50% at 50% 50%, color-mix(in oklab, var(--lava-300) 48%, transparent) 0%, transparent 72%)",
        }}
      />

      <section className="container-lava relative pt-[calc(var(--header-h)+clamp(3rem,6vw,5.5rem))] pb-[clamp(4rem,7vw,6.5rem)]">
        <div className="relative mx-auto flex max-w-3xl flex-col items-center overflow-hidden rounded-[var(--radius-xl)] border border-line bg-surface/92 px-6 py-12 text-center shadow-lift backdrop-blur-md sm:px-12 sm:py-16">
          <span aria-hidden="true" className="lava-seam-hairline pointer-events-none absolute inset-x-12 top-0 h-[2px] opacity-90" />

          {/* CodeLava monumental < 404 /> emblem */}
          <div
            dir="ltr"
            aria-hidden="true"
            className="mb-6 inline-flex items-center gap-3 sm:gap-5"
          >
            <span
              className="font-mono text-4xl font-bold tracking-tight sm:text-6xl"
              style={{
                backgroundImage: "var(--gradient-code)",
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                color: "transparent",
              }}
            >
              &lt;
            </span>
            <span className="text-lava-gradient font-display text-[clamp(4rem,12vw,7.5rem)] leading-none font-extrabold tracking-[-0.04em] tabular-nums">
              404
            </span>
            <span
              className="font-mono text-4xl font-bold tracking-tight sm:text-6xl"
              style={{
                backgroundImage: "var(--gradient-lava-wordmark)",
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                color: "transparent",
              }}
            >
              /&gt;
            </span>
          </div>

          <div className="mb-5 inline-flex items-center gap-2.5 rounded-pill border border-line-lava/60 bg-accent-soft px-4 py-1.5">
            <LogoMark size={20} detail="simple" aria-hidden />
            <span dir="ltr" className="font-mono text-xs font-semibold tracking-[0.14em] text-accent-text uppercase">
              HTTP 404
            </span>
          </div>

          <h1 className="text-display-lg text-text">{t("title")}</h1>
          <p className="mt-4 max-w-[46ch] text-lead text-muted">{t("description")}</p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3.5 max-sm:grid max-sm:w-full max-sm:grid-cols-1">
            <ActionLink href="/" variant="primary" size="md" className="max-sm:w-full">
              {t("home")}
            </ActionLink>
            <ActionLink href="/quote" variant="secondary" size="md" arrow="none" className="max-sm:w-full">
              {tn("getQuote")}
            </ActionLink>
          </div>

          {/* Quick recovery navigation */}
          <nav aria-label={tn("mainLabel")} className="mt-10 w-full border-t border-line pt-7">
            <ul className="flex flex-wrap items-center justify-center gap-2">
              {RECOVERY_LINKS.map((item) => (
                <li key={item.key}>
                  <Link
                    href={item.href}
                    data-cursor="pointer"
                    className="inline-flex h-9 items-center rounded-pill border border-line-strong/80 bg-bg/70 px-4 text-sm font-medium text-muted transition-[border-color,color,background-color,transform] duration-200 hover:-translate-y-px hover:border-line-lava hover:bg-surface hover:text-accent-text motion-reduce:hover:translate-y-0"
                  >
                    {tn(item.key)}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </section>
    </main>
  );
}
