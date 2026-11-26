"use client";

import { useEffect, useRef, useState } from "react";

interface CodeToken {
  text: string;
  tone?: "plain" | "kw" | "fn" | "str" | "num" | "comment" | "accent";
}

const DEFAULT_SNIPPET: CodeToken[][] = [
  [{ text: "// codelava::forge — distributed inference & event outbox", tone: "comment" }],
  [
    { text: "export async function ", tone: "kw" },
    { text: "dispatchPipeline", tone: "fn" },
    { text: "(", tone: "plain" },
    { text: "ctx", tone: "accent" },
    { text: ": ForgeContext) {", tone: "plain" },
  ],
  [
    { text: "  const ", tone: "kw" },
    { text: "embeddings = await ", tone: "plain" },
    { text: "vectorIndex", tone: "fn" },
    { text: ".query({ ", tone: "plain" },
    { text: "topK: ", tone: "plain" },
    { text: "12", tone: "num" },
    { text: ", ", tone: "plain" },
    { text: "locale: ctx.locale", tone: "plain" },
    { text: " });", tone: "plain" },
  ],
  [
    { text: "  const ", tone: "kw" },
    { text: "stream = ", tone: "plain" },
    { text: "createModelStream", tone: "fn" },
    { text: "({ ", tone: "plain" },
    { text: "temperature: ", tone: "plain" },
    { text: "0.18", tone: "num" },
    { text: ", ", tone: "plain" },
    { text: 'region: "me-central"', tone: "str" },
    { text: " });", tone: "plain" },
  ],
  [
    { text: "  await ", tone: "kw" },
    { text: "outbox", tone: "accent" },
    { text: ".publish(", tone: "plain" },
    { text: '"pipeline.settled"', tone: "str" },
    { text: ", { latencyMs: ", tone: "plain" },
    { text: "42", tone: "num" },
    { text: " });", tone: "plain" },
  ],
  [{ text: "  return stream.pipeThrough(guardrails());", tone: "plain" }],
  [{ text: "}", tone: "plain" }],
  [{ text: "", tone: "plain" }],
  [{ text: "// shader::magma_fissure.glsl", tone: "comment" }],
  [
    { text: "float ", tone: "kw" },
    { text: "heatField", tone: "fn" },
    { text: "(vec2 uv, float t) {", tone: "plain" },
  ],
  [
    { text: "  float ", tone: "kw" },
    { text: "vein = smoothstep(", tone: "plain" },
    { text: "0.62", tone: "num" },
    { text: ", ", tone: "plain" },
    { text: "0.94", tone: "num" },
    { text: ", ", tone: "plain" },
    { text: "fbm", tone: "fn" },
    { text: "(uv * ", tone: "plain" },
    { text: "3.4", tone: "num" },
    { text: " + vec2(0.0, t * 0.12)));", tone: "plain" },
  ],
  [
    { text: "  return ", tone: "kw" },
    { text: "mix", tone: "fn" },
    { text: "(OBSIDIAN_950, LAVA_500, vein * EMBER_CORE);", tone: "plain" },
  ],
  [{ text: "}", tone: "plain" }],
  [{ text: "", tone: "plain" }],
  [{ text: "// schema::domain_events.ts", tone: "comment" }],
  [
    { text: "export const ", tone: "kw" },
    { text: "domainEvents = ", tone: "plain" },
    { text: "pgTable", tone: "fn" },
    { text: "(", tone: "plain" },
    { text: '"domain_events"', tone: "str" },
    { text: ", {", tone: "plain" },
  ],
  [
    { text: "  id: ", tone: "plain" },
    { text: "uuid", tone: "fn" },
    { text: "(", tone: "plain" },
    { text: '"id"', tone: "str" },
    { text: ").defaultRandom().primaryKey(),", tone: "plain" },
  ],
  [
    { text: "  topic: ", tone: "plain" },
    { text: "text", tone: "fn" },
    { text: "(", tone: "plain" },
    { text: '"topic"', tone: "str" },
    { text: ").notNull(),", tone: "plain" },
  ],
  [
    { text: "  payload: ", tone: "plain" },
    { text: "jsonb", tone: "fn" },
    { text: "(", tone: "plain" },
    { text: '"payload"', tone: "str" },
    { text: ").$type<EventPayload>(),", tone: "plain" },
  ],
  [{ text: "});", tone: "plain" }],
];

const TONE_CLASS: Record<NonNullable<CodeToken["tone"]>, string> = {
  plain: "text-muted/80",
  kw: "text-code-blue",
  fn: "text-code-cyan",
  str: "text-code-green",
  num: "text-code-amber",
  comment: "text-faint/70",
  accent: "text-accent-text",
};

export interface CodeTextureProps {
  /** Subtle overall opacity (default 0.14). Keep restrained so typography leads. */
  opacity?: number;
  /** Drift cycle duration in seconds. Default 52. */
  duration?: number;
  className?: string;
}

/**
 * Decorative ambient syntax-highlighted code backdrop.
 * Uses the restrained `--syntax-*` palette solely where code is the visual motif.
 * Strictly aria-hidden, pointer-events-none, paused offscreen, static under reduced motion.
 */
export function CodeTexture({
  opacity = 0.15,
  duration = 52,
  className = "",
}: CodeTextureProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node || typeof IntersectionObserver === "undefined") return;

    const io = new IntersectionObserver(
      (entries) => setVisible(entries[0]?.isIntersecting ?? false),
      { threshold: 0.02 },
    );
    io.observe(node);
    return () => io.disconnect();
  }, []);

  const renderBlock = (prefix: string) => (
    <div className="space-y-1.5 pb-6">
      {DEFAULT_SNIPPET.map((line, lineIdx) => (
        <div key={`${prefix}-${lineIdx}`} className="flex gap-4 whitespace-pre">
          <span className="w-7 shrink-0 text-right text-faint/45 select-none">
            {String(lineIdx + 1).padStart(2, "0")}
          </span>
          <span>
            {line.map((tok, tokIdx) => (
              <span key={tokIdx} className={TONE_CLASS[tok.tone ?? "plain"]}>
                {tok.text}
              </span>
            ))}
          </span>
        </div>
      ))}
    </div>
  );

  return (
    <div
      ref={ref}
      aria-hidden="true"
      dir="ltr"
      className={`pointer-events-none absolute inset-0 overflow-hidden select-none font-mono text-[12px] leading-relaxed ${className}`}
      style={{
        opacity,
        maskImage:
          "radial-gradient(ellipse 88% 78% at 50% 50%, black 34%, transparent 94%)",
        WebkitMaskImage:
          "radial-gradient(ellipse 88% 78% at 50% 50%, black 34%, transparent 94%)",
      }}
    >
      <div
        className={visible ? "animate-code-drift" : undefined}
        style={{ "--code-drift-dur": `${duration}s` } as React.CSSProperties}
      >
        {renderBlock("a")}
        {renderBlock("b")}
      </div>
    </div>
  );
}
