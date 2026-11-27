"use client";

import { Check, Link2, Search, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useState, useSyncExternalStore, type KeyboardEvent } from "react";
import { Accordion } from "@/components/ui/Accordion";
import { cn } from "@/components/ui/cn";
import type { AppLocale } from "@/i18n/routing";
import { formatNumber } from "@/lib/i18n-content";
import "./faq.css";

type Question = { id: string; question: string; answerHtml: string };
type Group = { id: string; title: string; items: Question[] };

function subscribe(listener: () => void) {
  window.addEventListener("hashchange", listener);
  return () => window.removeEventListener("hashchange", listener);
}
const hashSnapshot = () => window.location.hash.slice(1);
const initialHash = () => "";

function searchText(text: string, locale: AppLocale) {
  return text.normalize("NFKD").toLocaleLowerCase(locale).replace(/[\p{M}\u0640]/gu, "").replaceAll("ى", "ي");
}

function handleKeys(event: KeyboardEvent<HTMLDivElement>) {
  if (!(event.target instanceof HTMLButtonElement) || !event.target.hasAttribute("aria-expanded")) return;
  if (!["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) return;
  const triggers = [...event.currentTarget.querySelectorAll<HTMLButtonElement>("h3 > button[aria-expanded]")];
  const current = triggers.indexOf(event.target);
  if (current < 0) return;
  event.preventDefault();
  event.stopPropagation();
  const next =
    event.key === "Home"
      ? 0
      : event.key === "End"
        ? triggers.length - 1
        : (current + (event.key === "ArrowDown" ? 1 : triggers.length - 1)) % triggers.length;
  triggers[next]?.focus();
}

export function FaqGroups({
  groups,
  locale,
  searchable = true,
}: {
  groups: Group[];
  locale: AppLocale;
  searchable?: boolean;
}) {
  const t = useTranslations("faq");
  const c = useTranslations("common");
  const [filter, setFilter] = useState({ query: "", topic: "", hash: "" });
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const hash = useSyncExternalStore(subscribe, hashSnapshot, initialHash);
  const query = filter.hash === hash ? filter.query : "";
  const activeTopic = filter.hash === hash ? filter.topic : "";

  const searchLabel = locale === "en" ? "Search questions" : "ابحث في الأسئلة";
  const searchPlaceholder = locale === "en" ? "Search questions or topics…" : "ابحث في الأسئلة…";
  const deepLink = locale === "en" ? "Copy link" : "نسخ الرابط";
  const copiedLabel = locale === "en" ? "Link copied" : "تم نسخ الرابط";

  const tokens = searchText(query, locale).trim().split(/\s+/).filter(Boolean);
  const visible = groups
    .filter((group) => !activeTopic || group.id === activeTopic)
    .map((group) => ({
      ...group,
      items: group.items.filter(({ question, answerHtml }) => {
        if (!tokens.length) return true;
        const value = searchText(`${group.title} ${question} ${answerHtml.replace(/<[^>]*>/g, " ")}`, locale);
        return tokens.every((token) => value.includes(token));
      }),
    }))
    .filter(({ items }) => items.length);

  const totalQuestions = groups.reduce((count, group) => count + group.items.length, 0);
  const resultCount = visible.reduce((count, group) => count + group.items.length, 0);
  const formattedCount = formatNumber(resultCount, locale, { useGrouping: false });
  const formattedTotal = formatNumber(totalQuestions, locale, { useGrouping: false });

  useEffect(() => {
    if (!hash) return;
    const frame = requestAnimationFrame(() => {
      const target = document.getElementById(hash);
      if (!target?.classList.contains("faq-question")) return;
      target.querySelector<HTMLButtonElement>("h3 > button")?.focus({ preventScroll: true });
      target.scrollIntoView({ block: "start", behavior: "instant" });
    });
    return () => cancelAnimationFrame(frame);
  }, [hash]);

  const copyPermalink = (questionId: string) => {
    if (typeof window === "undefined") return;
    const url = `${window.location.origin}${window.location.pathname}#${questionId}`;
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(url).catch(() => {});
    }
    setCopiedId(questionId);
    window.setTimeout(() => {
      setCopiedId((prev) => (prev === questionId ? null : prev));
    }, 2000);
  };

  return (
    <div className="faq-browser">
      {searchable && groups.length ? (
        <div className="faq-controls">
          <div className="faq-search-row">
            <div className="faq-search-shell">
              <label htmlFor="faq-search" className="sr-only">
                {searchLabel}
              </label>
              <Search
                size={18}
                aria-hidden="true"
                className="pointer-events-none absolute start-3.5 text-muted"
              />
              <input
                id="faq-search"
                type="search"
                autoComplete="off"
                dir="auto"
                placeholder={searchPlaceholder}
                value={query}
                onChange={(event) => setFilter({ query: event.target.value, topic: activeTopic, hash })}
                className="faq-search-input"
              />
              {query ? (
                <button
                  type="button"
                  onClick={() => setFilter({ query: "", topic: activeTopic, hash })}
                  aria-label={c("clearFilters")}
                  data-cursor="pointer"
                  className="absolute end-2.5 grid size-7 place-items-center rounded-full text-muted transition-colors hover:bg-surface hover:text-text"
                >
                  <X size={15} aria-hidden="true" />
                </button>
              ) : null}
            </div>
            <p className="faq-count-pill" role="status" aria-live="polite">
              <span aria-hidden="true" className="size-1.5 rounded-full bg-accent" />
              <span>
                {locale === "ar"
                  ? `${formattedCount} ${resultCount === 1 ? "سؤال" : resultCount === 2 ? "سؤالان" : resultCount <= 10 ? "أسئلة" : "سؤالًا"}`
                  : `${formattedCount} ${resultCount === 1 ? "question" : "questions"}`}
              </span>
            </p>
          </div>

          {groups.length > 1 ? (
            <div role="group" aria-label={t("allTopics")} className="faq-topic-pills">
              <button
                type="button"
                aria-pressed={activeTopic === ""}
                onClick={() => setFilter({ query, topic: "", hash })}
                data-cursor="pointer"
                className="faq-topic-pill"
              >
                <span>{t("allTopics")}</span>
                <span
                  dir="ltr"
                  className={cn(
                    "text-[0.7rem] font-semibold tabular-nums",
                    activeTopic === "" ? "text-on-accent/80" : "text-faint",
                  )}
                >
                  {formattedTotal}
                </span>
              </button>
              {groups.map((group) => {
                if (!group.title) return null;
                const selected = activeTopic === group.id;
                return (
                  <button
                    key={group.id}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => setFilter({ query, topic: selected ? "" : group.id, hash })}
                    data-cursor="pointer"
                    className="faq-topic-pill"
                  >
                    <span>{group.title}</span>
                    <span
                      dir="ltr"
                      className={cn(
                        "text-[0.7rem] font-semibold tabular-nums",
                        selected ? "text-on-accent/80" : "text-faint",
                      )}
                    >
                      {formatNumber(group.items.length, locale, { useGrouping: false })}
                    </span>
                  </button>
                );
              })}
            </div>
          ) : null}
        </div>
      ) : null}

      {!resultCount ? (
        <div className="flex flex-col items-center gap-3 rounded-[var(--radius-lg)] border border-line bg-surface p-10 text-center shadow-card">
          <p className="text-muted">{groups.length ? c("noResults") : t("empty")}</p>
          {query || activeTopic ? (
            <button
              type="button"
              onClick={() => setFilter({ query: "", topic: "", hash })}
              data-cursor="pointer"
              className="inline-flex items-center rounded-[var(--radius-pill)] border border-line-lava bg-accent-soft px-4 py-1.5 text-sm font-semibold text-accent-text transition-colors hover:bg-accent-soft-strong"
            >
              {c("clearFilters")}
            </button>
          ) : null}
        </div>
      ) : null}

      {visible.map(({ title, id, items }) => (
        <div
          key={id}
          className={searchable ? "faq-group" : "faq-group faq-group-inline"}
          onKeyDownCapture={handleKeys}
        >
          {title ? (
            <div className="faq-group-header">
              <h2 className="faq-group-title">{title}</h2>
              <span
                dir="ltr"
                className="rounded-[var(--radius-pill)] border border-line bg-surface px-2.5 py-0.5 font-mono text-xs font-medium text-faint tabular-nums"
              >
                {formatNumber(items.length, locale, { minimumIntegerDigits: locale === "ar" ? 1 : 2, useGrouping: false })}
              </span>
            </div>
          ) : null}
          <div className="faq-list">
            {items.map(({ id: questionId, question, answerHtml }) => {
              const open = questionId === hash;
              const isCopied = copiedId === questionId;
              return (
                <div className="faq-question" id={questionId} key={questionId}>
                  <Accordion
                    key={String(open)}
                    variant="cards"
                    className="faq-accordion"
                    numbered={false}
                    defaultOpenIds={open ? [questionId] : []}
                    items={[
                      {
                        id: questionId,
                        question,
                        answer: (
                          <>
                            <div className="conversion-prose" dangerouslySetInnerHTML={{ __html: answerHtml }} />
                            <a
                              className="faq-permalink"
                              href={`#${questionId}`}
                              onClick={() => copyPermalink(questionId)}
                              aria-label={`${deepLink} · ${question}`}
                            >
                              {isCopied ? (
                                <>
                                  <Check size={13} aria-hidden="true" />
                                  <span>{copiedLabel}</span>
                                </>
                              ) : (
                                <>
                                  <Link2 size={13} aria-hidden="true" />
                                  <span>{deepLink}</span>
                                </>
                              )}
                            </a>
                          </>
                        ),
                      },
                    ]}
                  />
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
