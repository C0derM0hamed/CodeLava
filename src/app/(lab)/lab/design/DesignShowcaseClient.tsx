"use client";

import { useState, type ReactNode } from "react";
import { useSearchParams } from "next/navigation";
import { NextIntlClientProvider } from "next-intl";
import type { AppLocale } from "@/i18n/routing";
import enMessages from "@/i18n/messages/en.json";
import arMessages from "@/i18n/messages/ar.json";
import { Logo, LogoMark } from "@/components/brand";
import { FlameCursor } from "@/experience/cursor";
import { CodeTexture, Counter, LavaDivider, Marquee, Reveal, WaveBand } from "@/experience/fx";
import {
  Accordion,
  ActionLink,
  Checkbox,
  Dialog,
  FileDropZone,
  FilterChips,
  RadioCards,
  SectionHeading,
  Select,
  SplitIntro,
  Tabs,
  Tag,
  TextInput,
  Textarea,
  ToastProvider,
  useToast,
  cn,
} from "@/components/ui";
import { CtaBanner, SiteFooter, SiteHeader } from "@/components/site";

const MESSAGES = { en: enMessages, ar: arMessages } as const;

/* Lab-only copy. Public pages take every string from i18n / DB. */
const COPY = {
  en: {
    heroKicker: "Design system · v2 Daylight Magma",
    heroTitle: "We turn ideas into\nreal digital products",
    heroHighlight: "real digital products",
    heroLead:
      "Light pearl surfaces, one warm accent, cool code colour only on the bracket motif — and dark ink bands for rhythm.",
    start: "Start your project",
    watch: "Watch our work",
    servicesKicker: "Our services",
    servicesTitle: "End-to-End\nDigital Solutions",
    servicesLead: "From idea to launch, we build reliable, scalable and high-performing digital products.",
    servicesLink: "Explore all services",
    tiles: ["Web development", "Mobile apps", "Custom software", "E-commerce", "Cloud & DevOps", "AI solutions"],
    processKicker: "Our process",
    processTitle: "A clear, proven\ndevelopment process",
    processLead: "A transparent, agile process that turns your idea into a successful product.",
    processLink: "See how we work",
    steps: ["Discover", "Plan", "Design", "Develop", "Test", "Launch"],
    centeredKicker: "Centered heading",
    centeredTitle: "Section headings can also centre",
    centeredLead: "Use sparingly — the split intro is the signature pattern.",
  },
  ar: {
    heroKicker: "نظام التصميم · الإصدار الثاني",
    heroTitle: "نحوّل الأفكار إلى\nمنتجات رقمية حقيقية",
    heroHighlight: "منتجات رقمية حقيقية",
    heroLead: "أسطح فاتحة بلون اللؤلؤ، ولون دافئ واحد للتمييز، ولون الكود البارد على رمز الأقواس فقط — مع أشرطة داكنة لإيقاع الصفحة.",
    start: "ابدأ مشروعك",
    watch: "شاهد أعمالنا",
    servicesKicker: "خدماتنا",
    servicesTitle: "حلول رقمية\nمتكاملة من البداية للنهاية",
    servicesLead: "من الفكرة إلى الإطلاق، نبني منتجات رقمية موثوقة وقابلة للتوسع وعالية الأداء.",
    servicesLink: "استكشف جميع الخدمات",
    tiles: ["تطوير الويب", "تطبيقات الجوال", "برمجيات مخصّصة", "التجارة الإلكترونية", "السحابة وDevOps", "حلول الذكاء الاصطناعي"],
    processKicker: "منهجية العمل",
    processTitle: "منهجية تطوير\nواضحة ومجرّبة",
    processLead: "منهجية شفافة ومرنة تحوّل فكرتك إلى منتج ناجح.",
    processLink: "تعرّف على طريقة عملنا",
    steps: ["الاكتشاف", "التخطيط", "التصميم", "التطوير", "الاختبار", "الإطلاق"],
    centeredKicker: "عنوان في المنتصف",
    centeredTitle: "يمكن توسيط عناوين الأقسام أيضاً",
    centeredLead: "استخدمه باعتدال — التقسيم الجانبي هو النمط المميز.",
  },
} as const;

const SWATCHES: Array<{ group: string; tokens: Array<[string, string]> }> = [
  {
    group: "Surfaces",
    tokens: [
      ["--bg", "Page · pearl"],
      ["--surface", "Card · white"],
      ["--surface-2", "Raised"],
      ["--pearl-300", "Sunken"],
      ["--mist", "Wash mist"],
    ],
  },
  {
    group: "Ink",
    tokens: [
      ["--ink-900", "Text · bands"],
      ["--ink-600", "Muted"],
      ["--ink-500", "Faint"],
      ["--ink-450", "Field border"],
      ["--ink-200", "Muted on ink"],
    ],
  },
  {
    group: "Lava",
    tokens: [
      ["--lava-300", "Rim"],
      ["--lava-400", "Hot"],
      ["--lava-500", "Brand"],
      ["--lava-600", "Deep"],
      ["--accent-text", "AA text"],
    ],
  },
  {
    group: "Code",
    tokens: [
      ["--brand-cyan", "< start"],
      ["--brand-blue", "< end"],
      ["--code-cyan", "Syntax"],
      ["--code-green", "String"],
      ["--code-amber", "Number"],
    ],
  },
];

const GRADIENTS: Array<[string, string]> = [
  ["--gradient-cta", "Primary CTA"],
  ["--gradient-lava-wordmark", "Display highlight"],
  ["--gradient-code", "Code bracket"],
  ["--gradient-heat-seam", "Heat seam"],
];

function LabSection({
  id,
  label,
  children,
  className,
}: {
  id: string;
  label: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section id={id} aria-labelledby={`${id}-label`} className={cn("section-y", className)}>
      <div className="container-lava">
        <p id={`${id}-label`} dir="ltr" className="mb-8 font-mono text-xs font-medium tracking-[0.12em] text-faint uppercase">
          {label}
        </p>
        {children}
      </div>
    </section>
  );
}

function Panel({ title, children, className }: { title: string; children: ReactNode; className?: string }) {
  return (
    <div className={cn("rounded-[var(--radius-lg)] border border-line bg-surface p-6 shadow-[var(--shadow-card)] sm:p-8", className)}>
      <p dir="ltr" className="mb-5 text-sm font-semibold text-text">
        {title}
      </p>
      {children}
    </div>
  );
}

function ToastButtons() {
  const { toast } = useToast();
  return (
    <div className="flex flex-wrap gap-3">
      <ActionLink variant="secondary" size="sm" arrow="none" onClick={() => toast({ title: "Draft saved", description: "Your brief is stored on this device." })}>
        Default toast
      </ActionLink>
      <ActionLink variant="secondary" size="sm" arrow="none" onClick={() => toast({ title: "Proposal requested", tone: "lava" })}>
        Lava toast
      </ActionLink>
      <ActionLink variant="secondary" size="sm" arrow="none" onClick={() => toast({ title: "Message sent", tone: "success" })}>
        Success
      </ActionLink>
      <ActionLink variant="secondary" size="sm" arrow="none" onClick={() => toast({ title: "Upload failed", description: "File exceeds 10 MB.", tone: "danger" })}>
        Danger
      </ActionLink>
    </div>
  );
}

function Showcase({ locale, setLocale }: { locale: AppLocale; setLocale: (l: AppLocale) => void }) {
  const c = COPY[locale];
  const isAr = locale === "ar";
  const [chip, setChip] = useState("all");
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <div dir={isAr ? "rtl" : "ltr"} lang={locale} className="page-wash relative min-h-screen bg-bg text-text">
      <SiteHeader position="sticky" hideOnScrollDown={false} onLocaleChange={setLocale} />

      <main id="main-content">
        {/* Hero-ish intro */}
        <section className="container-lava grid gap-12 pt-14 pb-20 lg:grid-cols-12 lg:items-center lg:pt-20">
          <div className="space-y-7 lg:col-span-7">
            <Tag tone="lava" size="md" dot>
              {c.heroKicker}
            </Tag>
            <Reveal as="h1" mode="words" immediate highlight={c.heroHighlight} className="text-display-xl text-text">
              {c.heroTitle}
            </Reveal>
            <p className="text-lead max-w-[48ch]">{c.heroLead}</p>
            <div className="flex flex-wrap items-center gap-6">
              <ActionLink href="/quote" size="lg">
                {c.start}
              </ActionLink>
              <ActionLink variant="play" href="/work">
                {c.watch}
              </ActionLink>
            </div>
          </div>
          <div className="lg:col-span-5">
            <div className="relative overflow-hidden rounded-[var(--radius-xl)] border border-line bg-surface p-10 shadow-[var(--shadow-lift)]">
              <div className="flex flex-col items-center gap-6">
                <LogoMark size={132} animated />
                <Logo size="lg" tone="light" tagline="Software & AI Solutions" layout="stacked" variant="wordmark" />
              </div>
            </div>
          </div>
        </section>

        {/* Tokens */}
        <LabSection id="tokens" label="01 · Tokens">
          <div className="grid gap-6 lg:grid-cols-2">
            {SWATCHES.map((g) => (
              <Panel key={g.group} title={g.group}>
                <div className="grid grid-cols-5 gap-3">
                  {g.tokens.map(([token, role]) => (
                    <div key={token} className="space-y-2">
                      <div className="h-14 rounded-[12px] border border-line" style={{ background: `var(${token})` }} />
                      <p dir="ltr" className="truncate font-mono text-[10px] text-faint">
                        {token}
                      </p>
                      <p className="text-xs text-muted">{role}</p>
                    </div>
                  ))}
                </div>
              </Panel>
            ))}
          </div>
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {GRADIENTS.map(([token, role]) => (
              <div key={token} className="space-y-2">
                <div className="h-16 rounded-[var(--radius-md)] shadow-[var(--shadow-card)]" style={{ background: `var(${token})` }} />
                <p dir="ltr" className="font-mono text-[11px] text-faint">
                  {token} · {role}
                </p>
              </div>
            ))}
          </div>
          <Panel title="Type scale" className="mt-6">
            <div className="space-y-4">
              <p className="text-display-xl">Display XL</p>
              <p className="text-display-lg">Display LG</p>
              <p className="text-display-md">
                Section H2 <span className="text-lava-gradient">highlight</span>
              </p>
              <p className="text-display-sm">Card title</p>
              <p className="text-lead max-w-[54ch]">Lead — 17→20px muted intro copy that sits under a heading.</p>
              <p className="text-body max-w-[60ch] text-muted">Body — 15→17px. Arabic switches to IBM Plex Sans Arabic with taller leading.</p>
              <p className="kicker-rule">Kicker rule</p>
            </div>
          </Panel>
        </LabSection>

        {/* Buttons */}
        <LabSection id="actions" label="02 · ActionLink">
          <div className="grid gap-6 lg:grid-cols-2">
            <Panel title="On light">
              <div className="flex flex-col gap-6">
                <div className="flex flex-wrap items-center gap-3">
                  <ActionLink href="/quote" size="sm">Get a quote</ActionLink>
                  <ActionLink href="/quote">Start your project</ActionLink>
                  <ActionLink href="/quote" size="lg">Start your project</ActionLink>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <ActionLink href="/about" variant="secondary">Learn more about us</ActionLink>
                  <ActionLink href="/contact" variant="outline" arrow="none">Contact us</ActionLink>
                  <ActionLink variant="primary" loading>Sending</ActionLink>
                </div>
                <div className="flex flex-wrap items-center gap-8">
                  <ActionLink href="/services" variant="text" size="sm">Explore all services</ActionLink>
                  <ActionLink href="/work" variant="text" arrow="up-right" size="sm">View case study</ActionLink>
                  <ActionLink variant="ghost" size="sm">Back</ActionLink>
                  <ActionLink href="/work" variant="play">Watch our work</ActionLink>
                </div>
                <p className="text-xs text-faint" dir="ltr">
                  variant=&quot;molten&quot; is a legacy alias of primary.
                </p>
              </div>
            </Panel>
            <div className="surface-dark rounded-[var(--radius-lg)] p-6 sm:p-8">
              <p className="mb-5 text-sm font-semibold text-text" dir="ltr">On dark (.surface-dark)</p>
              <div className="flex flex-col gap-6">
                <div className="flex flex-wrap items-center gap-3">
                  <ActionLink href="/quote" variant="inverse">Get a quote</ActionLink>
                  <ActionLink href="/contact" variant="outline" arrow="none">Contact us</ActionLink>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <ActionLink href="/quote">Primary</ActionLink>
                  <ActionLink href="/about" variant="secondary">Secondary</ActionLink>
                </div>
                <div className="flex flex-wrap items-center gap-8">
                  <ActionLink href="/process" variant="text" size="sm">See how we work</ActionLink>
                  <ActionLink href="/work" variant="play">Watch our work</ActionLink>
                </div>
              </div>
            </div>
          </div>
        </LabSection>

        {/* Split intro */}
        <LabSection id="split-intro" label="03 · SplitIntro + SectionHeading">
          <SplitIntro
            kicker={c.servicesKicker}
            title={c.servicesTitle}
            lead={c.servicesLead}
            link={{ href: "/services", label: c.servicesLink }}
            alignIntro="center"
          >
            <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              {c.tiles.map((label, i) => (
                <li key={label}>
                  <a
                    href="#split-intro"
                    className={cn(
                      "group flex h-full min-h-36 flex-col justify-between gap-6 rounded-[var(--radius-md)] border p-5 transition-[transform,box-shadow] duration-300 hover:-translate-y-0.5",
                      i === 0
                        ? "surface-dark border-transparent shadow-[0_24px_50px_-20px_color-mix(in_oklab,var(--lava-600)_55%,transparent)]"
                        : "border-line bg-surface shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-lift)]",
                    )}
                  >
                    <span className="flex h-11 w-11 items-center justify-center rounded-[12px] bg-accent-soft font-mono text-sm font-semibold text-accent-text" dir="ltr">
                      {"</>"}
                    </span>
                    <span className="font-display text-[1.0625rem] font-semibold leading-snug text-text">{label}</span>
                  </a>
                </li>
              ))}
            </ul>
          </SplitIntro>

          <div className="mt-24">
            <SectionHeading
              align="center"
              kicker={c.centeredKicker}
              title={c.centeredTitle}
              lead={c.centeredLead}
              size="md"
            />
          </div>
        </LabSection>

        {/* Wave band */}
        <WaveBand aria-label="WaveBand demo" contentClassName="container-lava py-14 lg:py-16">
          <div className="grid gap-12 lg:grid-cols-12 lg:items-center">
            <div className="lg:col-span-4">
              <SectionHeading
                layout="intro"
                size="md"
                kicker={c.processKicker}
                title={c.processTitle}
                lead={c.processLead}
                action={
                  <ActionLink href="/process" variant="inverse" size="sm">
                    {c.processLink}
                  </ActionLink>
                }
              />
            </div>
            <ol className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:col-span-8 lg:grid-cols-6">
              {c.steps.map((step, i) => (
                <li key={step} className="flex flex-col items-center gap-3 text-center">
                  <span className="flex h-14 w-14 items-center justify-center rounded-[14px] border border-line-lava bg-accent-soft font-mono text-sm font-semibold text-accent-text shadow-[var(--lava-glow-sm)]" dir="ltr">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="font-display text-base font-semibold text-text">{step}</span>
                </li>
              ))}
            </ol>
          </div>
        </WaveBand>

        {/* Chips, tabs, tags */}
        <LabSection id="navigation" label="04 · Tags · FilterChips · Tabs">
          <div className="grid gap-6 lg:grid-cols-2">
            <Panel title="Tags">
              <div className="flex flex-wrap gap-2">
                <Tag>Default</Tag>
                <Tag tone="lava" dot>Lava</Tag>
                <Tag tone="outline">Outline</Tag>
                <Tag tone="syntax-cyan" dot>Next.js</Tag>
                <Tag tone="syntax-green" dot>Live</Tag>
                <Tag tone="ink">Ink</Tag>
                <Tag tone="outline" dir="ltr" className="font-mono">postgres@18</Tag>
              </div>
            </Panel>
            <Panel title="FilterChips">
              <FilterChips
                value={chip}
                onChange={setChip}
                options={[
                  { value: "all", label: "All", count: 12 },
                  { value: "ai", label: "AI systems", count: 4 },
                  { value: "fintech", label: "FinTech", count: 3 },
                  { value: "commerce", label: "Commerce", count: 5 },
                ]}
              />
            </Panel>
          </div>
          <Panel title="Tabs" className="mt-6">
            <Tabs
              ariaLabel="Demo tabs"
              items={[
                { id: "web", label: "Web", count: 8, content: <p className="text-muted">Web platforms and dashboards.</p> },
                { id: "mobile", label: "Mobile", count: 5, content: <p className="text-muted">Native and cross-platform apps.</p> },
                { id: "ai", label: "AI", count: 3, content: <p className="text-muted">Retrieval, agents and copilots.</p> },
              ]}
            />
          </Panel>
        </LabSection>

        {/* Forms */}
        <LabSection id="forms" label="05 · Fields">
          <div className="grid gap-6 lg:grid-cols-2">
            <Panel title="Inputs">
              <div className="grid gap-5">
                <div className="grid gap-5 sm:grid-cols-2">
                  <TextInput label="Full name" placeholder="Your name" required />
                  <TextInput label="Company" placeholder="Company name" optionalLabel="Optional" />
                </div>
                <TextInput label="Work email" type="email" defaultValue="not-an-email" error="Enter a valid email address." required />
                <Select
                  label="Budget range"
                  placeholder="Select a range"
                  options={[
                    { value: "s", label: "Under $10k" },
                    { value: "m", label: "$10k – $50k" },
                    { value: "l", label: "$50k+" },
                  ]}
                />
                <Textarea label="Project details" hint="A few lines about goals, users and timeline." />
                <Checkbox label="I agree to be contacted about this request." />
              </div>
            </Panel>
            <Panel title="RadioCards · FileDropZone">
              <div className="grid gap-6">
                <RadioCards
                  name="kind"
                  legend="What are we building?"
                  defaultValue="web"
                  options={[
                    { value: "web", title: "Web platform", description: "Portals, dashboards, SaaS.", meta: "Most requested" },
                    { value: "mobile", title: "Mobile app", description: "iOS, Android, cross-platform." },
                    { value: "ai", title: "AI solution", description: "Assistants, retrieval, automation." },
                    { value: "other", title: "Something else", description: "Tell us more in the brief." },
                  ]}
                />
                <FileDropZone label="Attachments" optionalLabel="Optional" />
              </div>
            </Panel>
          </div>
        </LabSection>

        {/* Accordion, dialog, toast */}
        <LabSection id="disclosure" label="06 · Accordion · Dialog · Toast">
          <div className="grid gap-6 lg:grid-cols-2">
            <Panel title='Accordion · variant="lines"'>
              <Accordion
                defaultOpenIds={["a"]}
                items={[
                  { id: "a", question: "How long does a typical project take?", answer: "Most MVPs ship in 8–14 weeks depending on scope." },
                  { id: "b", question: "Do you work with teams outside the Gulf?", answer: "Yes — we work remotely with clients worldwide." },
                  { id: "c", question: "Who owns the code?", answer: "You do, from the first commit." },
                ]}
              />
            </Panel>
            <div className="space-y-6">
              <Accordion
                variant="cards"
                numbered={false}
                items={[
                  { id: "d", question: "Cards variant", answer: "Each item is a white card; open items get a lava hairline." },
                  { id: "e", question: "Keyboard support", answer: "Arrow keys, Home and End move between triggers." },
                ]}
              />
              <Panel title="Dialog + Toast">
                <div className="flex flex-wrap gap-3">
                  <ActionLink variant="primary" size="sm" arrow="none" onClick={() => setDialogOpen(true)}>
                    Open dialog
                  </ActionLink>
                </div>
                <div className="mt-4">
                  <ToastButtons />
                </div>
              </Panel>
            </div>
          </div>
          <Dialog
            open={dialogOpen}
            onClose={() => setDialogOpen(false)}
            title="Request received"
            description="We’ll review your brief and reply by email."
            footer={
              <>
                <ActionLink variant="ghost" size="sm" onClick={() => setDialogOpen(false)}>
                  Close
                </ActionLink>
                <ActionLink size="sm" onClick={() => setDialogOpen(false)}>
                  Continue
                </ActionLink>
              </>
            }
          >
            <p>Dialogs use the white surface, an ink scrim with blur, and the pop shadow.</p>
          </Dialog>
        </LabSection>

        {/* Brand */}
        <LabSection id="brand" label="07 · Brand">
          <div className="grid gap-6 lg:grid-cols-2">
            <Panel title='tone="light"'>
              <div className="flex flex-wrap items-end gap-8">
                <Logo size="sm" tone="light" />
                <Logo size="md" tone="light" />
                <Logo size="lg" tone="light" />
                <Logo size="xl" tone="light" animated />
              </div>
              <div className="mt-8 flex items-end gap-6">
                {[16, 24, 32, 48, 72].map((s) => (
                  <div key={s} className="flex flex-col items-center gap-2">
                    <LogoMark size={s} />
                    <span className="font-mono text-[10px] text-faint">{s}</span>
                  </div>
                ))}
              </div>
            </Panel>
            <div className="surface-dark rounded-[var(--radius-lg)] p-6 sm:p-8">
              <p className="mb-5 text-sm font-semibold text-text" dir="ltr">tone=&quot;auto&quot; on .surface-dark</p>
              <div className="flex flex-wrap items-end gap-8">
                <Logo size="sm" />
                <Logo size="md" />
                <Logo size="lg" />
                <Logo size="xl" animated />
              </div>
              <div className="mt-8 flex items-end gap-6">
                {[16, 24, 32, 48, 72].map((s) => (
                  <div key={s} className="flex flex-col items-center gap-2">
                    <LogoMark size={s} />
                    <span className="font-mono text-[10px] text-faint">{s}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </LabSection>

        {/* FX */}
        <LabSection id="fx" label="08 · FX">
          <div className="space-y-10">
            <LavaDivider variant="seam" />
            <LavaDivider variant="crack" />
            <div className="grid gap-6 lg:grid-cols-2">
              <div className="relative h-64 overflow-hidden rounded-[var(--radius-lg)] border border-line bg-surface shadow-[var(--shadow-card)]">
                <CodeTexture opacity={0.5} />
                <p className="absolute bottom-5 start-5 text-sm font-semibold">CodeTexture on light</p>
              </div>
              <div className="surface-dark relative h-64 overflow-hidden rounded-[var(--radius-lg)]">
                <CodeTexture opacity={0.4} />
                <p className="absolute bottom-5 start-5 text-sm font-semibold">CodeTexture on dark</p>
              </div>
            </div>
            <Marquee speed={30}>
              {["Next.js", "Laravel", "Flutter", "React Native", "PostgreSQL", "AWS", "Docker", "Python"].map((t) => (
                <span key={t} className="rounded-[var(--radius-md)] border border-line bg-surface px-5 py-3 text-sm font-semibold shadow-[var(--shadow-xs)]" dir="ltr">
                  {t}
                </span>
              ))}
            </Marquee>
            <div className="flex flex-wrap gap-10">
              <div>
                <Counter value={128} className="text-display-md text-text" locale={locale} />
                <p className="text-sm text-muted">Counter (demo value)</p>
              </div>
            </div>
          </div>
        </LabSection>

        {/* Standalone CTA */}
        <LabSection id="cta" label="09 · CtaBanner (standalone)">
          <CtaBanner imageSrc={null} />
        </LabSection>
      </main>

      <SiteFooter
        socials={[
          { label: "LinkedIn", href: "https://www.linkedin.com/" },
          { label: "GitHub", href: "https://github.com/" },
          { label: "X", href: "https://x.com/" },
          { label: "Mostaql", href: "https://mostaql.com/" },
        ]}
        contact={{
          email: "hello@example.com",
          phone: "+000 0000 0000",
          location: isAr ? "عنوان تجريبي (بيانات المختبر)" : "Sample address (lab data)",
          availability: isAr ? "الأحد – الخميس" : "Sun – Thu",
        }}
        services={c.tiles.slice(0, 5).map((label, i) => ({ label, href: `/services#s${i}` }))}
      />
      <FlameCursor viewLabelEn="View" viewLabelAr="عرض" />
    </div>
  );
}

export function DesignShowcaseClient() {
  const searchParams = useSearchParams();
  const initial: AppLocale = searchParams.get("dir") === "rtl" || searchParams.get("locale") === "ar" ? "ar" : "en";
  const [locale, setLocale] = useState<AppLocale>(initial);

  return (
    <NextIntlClientProvider locale={locale} messages={MESSAGES[locale]} timeZone="Asia/Riyadh">
      <ToastProvider closeLabel={locale === "ar" ? "إغلاق" : "Close"}>
        <Showcase locale={locale} setLocale={setLocale} />
      </ToastProvider>
    </NextIntlClientProvider>
  );
}
