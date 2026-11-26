import { useId } from "react";
import { DaylightMotion } from "./DaylightMotion";
import "./daylight.css";

type Props = { locale: "en" | "ar"; className?: string };

// A projected glass band. The two curves are the near and far edges of the same orbit.
const farLip = "M305 393 C288 350 503 274 715 252 C926 229 934 274 863 314";
const nearLip = "M863 314 C755 382 411 448 323 419 C311 415 305 404 305 393";
const orbit = farLip + " " + nearLip.replace("M863 314", "") + " Z";
const code = ["{ }", "async", "تدفّق", "0xFF", "=>", "yield", "λ", "SELECT", "fn()", "[]", "await", "كود"];

export function HeroVolcano({ locale, className }: Props) {
  const id = useId();
  const paint = (name: string) => `url(#${id}-${name})`;
  return (
    <DaylightMotion locale={locale} className={className}>
      <div className="dl-landscape">
        <div className="dl-terrain" />
        <div className="dl-fissures" />
        <div className="dl-film" />
      </div>
      <div className="dl-orbit">
        <svg viewBox="0 0 1200 800" focusable="false">
          <defs>
            <linearGradient id={id + "-glass"} x1="0" y1="1" x2="1" y2="0" gradientUnits="objectBoundingBox">
              <stop stopColor="var(--lava-300)" stopOpacity=".84" />
              <stop offset=".24" stopColor="var(--pearl-50)" stopOpacity=".34" />
              <stop offset=".44" stopColor="var(--code-cyan)" stopOpacity=".23" />
              <stop offset=".74" stopColor="var(--code-blue)" stopOpacity=".36" />
              <stop offset="1" stopColor="var(--lava-300)" stopOpacity=".74" />
            </linearGradient>
            <linearGradient id={id + "-rim"}>
              <stop stopColor="var(--ember)" />
              <stop offset=".19" stopColor="var(--lava-100)" />
              <stop offset=".55" stopColor="var(--pearl-50)" stopOpacity=".5" />
              <stop offset=".78" stopColor="var(--syntax-cyan)" />
              <stop offset="1" stopColor="var(--lava-300)" />
            </linearGradient>
            <path id={id + "-inscription"} d="M323 430 C411 459 755 393 863 325" />
          </defs>
          <path d={orbit} fill="none" stroke={paint("rim")} strokeWidth="9" opacity=".17" />
          <path d={farLip + " l0 14 C940 280 915 248 715 270 C503 292 291 363 305 407Z"} fill={paint("glass")} />
          <path d={farLip} fill="none" stroke={paint("rim")} strokeWidth="2.4" />
          <path d={nearLip + " l0 12 C304 422 311 428 323 433 C411 462 755 396 863 328Z"} fill={paint("glass")} />
          <path d={nearLip} transform="translate(0 14)" fill="none" stroke={paint("rim")} strokeWidth="3.2" />
          <path d={nearLip} fill="none" stroke={paint("rim")} strokeWidth="1.5" />
          <path className="dl-packets" d={orbit} pathLength="1000" fill="none" stroke="var(--pearl-50)" strokeWidth="2.6" strokeDasharray="18 16 4 65 37 160" />
          <text className="dl-inscription" fill="var(--pearl-50)" fontSize="10" letterSpacing="2">
            <textPath href={"#" + id + "-inscription"} startOffset="8%">fn() · 1010 · return · 0xFF · await · [ ] · stream · =&gt;</textPath>
          </text>
        </svg>
      </div>
      <div className="dl-ejecta">
        {code.map((token) => <span key={token} className="dl-token">{token}</span>)}
      </div>
      <div className="dl-brand">
        <svg viewBox="0 0 180 102" focusable="false" className="dl-brackets">
          <defs>
            <linearGradient id={id + "-ice"} x2=".4" y2="1">
              <stop stopColor="var(--syntax-cyan)" /><stop offset=".4" stopColor="var(--code-cyan)" /><stop offset="1" stopColor="var(--code-blue)" />
            </linearGradient>
            <linearGradient id={id + "-fire"} x2=".6" y2="1">
              <stop stopColor="var(--ember)" /><stop offset=".42" stopColor="var(--lava-400)" /><stop offset="1" stopColor="var(--lava-600)" />
            </linearGradient>
            <linearGradient id={id + "-slash"} x2=".4" y2="1">
              <stop stopColor="var(--pearl-50)" /><stop offset=".55" stopColor="var(--ash-50)" /><stop offset="1" stopColor="var(--lava-100)" />
            </linearGradient>
          </defs>
          <g className="dl-left">
            <path fill="var(--code-blue)" transform="translate(1 4)" d="M51 13 11 42Q5 47 11 52L49 78 53 73 53 62 29 47 54 29 54 15Z" />
            <path fill={paint("ice")} d="M51 13 11 42Q5 47 11 52L49 78 53 73 53 62 29 47 54 29 54 15Z" />
            <path d="M12 43 51 15" stroke="var(--ash-50)" opacity=".8" strokeWidth="1.7" />
          </g>
          <g className="dl-slash">
            <path d="M98 7 111 4 83 88 70 94Z" fill="var(--ink-500)" transform="translate(1 3)" />
            <path d="M98 7 111 4 83 88 70 94Z" fill={paint("slash")} />
          </g>
          <g className="dl-right">
            <path fill="var(--lava-700)" transform="translate(1 4)" d="M128 13 167 38Q175 43 168 50L128 80 125 77 125 64 151 45 125 28 125 15Z" />
            <path fill={paint("fire")} d="M128 13 167 38Q175 43 168 50L128 80 125 77 125 64 151 45 125 28 125 15Z" />
            <path d="M128 15 166 39" stroke="var(--lava-100)" opacity=".9" strokeWidth="1.7" />
          </g>
        </svg>
        <span className="dl-word">Code<span>Lava.</span></span>
      </div>
    </DaylightMotion>
  );
}
