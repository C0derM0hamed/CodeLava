import { useId, type ReactNode } from "react";
import { HeroVolcano } from "./HeroVolcano";

type Props = { locale: "en" | "ar"; children: ReactNode; className?: string; titleId?: string };

export function HeroStage({ locale, children, className, titleId }: Props) {
  const after = useId();
  const ar = locale === "ar";
  return (
    <>
      <section
        data-daylight-stage=""
        className={["dl-stage", className].filter(Boolean).join(" ")}
        dir={ar ? "rtl" : "ltr"}
        lang={locale}
        aria-labelledby={titleId || undefined}
        aria-label={titleId ? undefined : ar ? "مقدمة" : "Introduction"}
      >
        <div className="dl-pin">
          <a className="dl-skip" href={"#" + after}>{ar ? "تخطّ المشهد" : "Skip the animation"}</a>
          <div className="dl-columns">
            <div className="dl-copy">{children}</div>
            <HeroVolcano locale={locale} />
          </div>
          <div className="dl-cue" aria-hidden="true">
            <span className="dl-track"><i /></span>{ar ? "مرّر للاستكشاف" : "Scroll to explore"}
          </div>
        </div>
      </section>
      <div id={after} tabIndex={-1} className="dl-end" />
    </>
  );
}
