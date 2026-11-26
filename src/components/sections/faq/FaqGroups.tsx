"use client";

import { Link2, Search } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useState, useSyncExternalStore, type KeyboardEvent } from "react";
import { Accordion } from "@/components/ui/Accordion";
import { TextInput } from "@/components/ui/Field";
import type { AppLocale } from "@/i18n/routing";
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
  const next = event.key === "Home" ? 0 : event.key === "End" ? triggers.length - 1
    : (current + (event.key === "ArrowDown" ? 1 : triggers.length - 1)) % triggers.length;
  triggers[next]?.focus();
}

export function FaqGroups({ groups, locale, searchable = true }: { groups: Group[]; locale: AppLocale; searchable?: boolean }) {
  const t = useTranslations("faq");
  const c = useTranslations("common");
  const [filter, setFilter] = useState({ query: "", hash: "" });
  const hash = useSyncExternalStore(subscribe, hashSnapshot, initialHash);
  const query = filter.hash === hash ? filter.query : "";
  const searchLabel = locale === "en" ? "Search questions" : "ابحث في الأسئلة";
  const deepLink = locale === "en" ? "Link to question" : "رابط السؤال";
  const tokens = searchText(query, locale).trim().split(/\s+/).filter(Boolean);
  const visible = groups.map((group) => ({
    ...group,
    items: group.items.filter(({ question, answerHtml }) => {
      if (!tokens.length) return true;
      const value = searchText(`${group.title} ${question} ${answerHtml.replace(/<[^>]*>/g, " ")}`, locale);
      return tokens.every((token) => value.includes(token));
    }),
  })).filter(({ items }) => items.length);
  const resultCount = visible.reduce((count, group) => count + group.items.length, 0);

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

  return (
    <div className="faq-browser">
      {searchable && groups.length ? <div className="faq-search">
        <div className="relative min-w-0 flex-1">
          <TextInput id="faq-search" type="search" label={searchLabel} className="pe-11" autoComplete="off" dir="auto"
            value={query} onChange={(event) => setFilter({ query: event.target.value, hash })} />
          <Search size={17} aria-hidden="true" className="pointer-events-none absolute bottom-3.5 end-3.5 text-muted" />
        </div>
        <p className="faq-count" role="status">
          {locale === "ar" ? `عدد الأسئلة: ${new Intl.NumberFormat(locale).format(resultCount)}` :
            `${resultCount} ${resultCount === 1 ? "question" : "questions"}`}
        </p>
      </div> : null}
      {!resultCount ? <p className="border-y border-line py-5 text-muted">{groups.length ? c("noResults") : t("empty")}</p> : null}
      {visible.map(({ title, id, items }) => (
        <div key={id} className={searchable ? "faq-group" : "faq-group faq-group-inline"} onKeyDownCapture={handleKeys}>
          {title ? <h2 className="text-display-sm">{title}</h2> : null}
          <div>
            {items.map(({ id: questionId, question, answerHtml }) => {
              const open = questionId === hash;
              return <div className="faq-question" id={questionId} key={questionId}>
                <Accordion key={String(open)} className="faq-accordion" numbered={false}
                  defaultOpenIds={open ? [questionId] : []}
                  items={[{ id: questionId, question,
                    answer: <div className="conversion-prose" dangerouslySetInnerHTML={{ __html: answerHtml }} /> }]} />
                <a className="faq-permalink" href={`#${questionId}`} aria-label={`${deepLink} · ${question}`}>
                  <Link2 size={16} aria-hidden="true" />
                </a>
              </div>;
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
