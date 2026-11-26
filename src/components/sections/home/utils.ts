/** Small pure helpers shared by the home + about sections. */

/** Only real http(s) URLs from the DB become outbound links. */
export function isSafeHttpUrl(url: string | null | undefined): url is string {
  return Boolean(url && /^https?:\/\/\S+$/i.test(url.trim()));
}

/**
 * Splits a hero headline into its two display lines. An explicit "\n" from the dashboard wins;
 * otherwise the break goes at the word boundary closest to the middle (by characters), so the
 * gradient second line always carries the closing phrase.
 */
export function splitHeadline(title: string): [string, string | null] {
  const clean = title.trim();
  const explicit = clean.split(/\s*\n\s*/);
  if (explicit.length > 1) return [explicit[0], explicit.slice(1).join(" ")];
  const words = clean.split(/\s+/);
  if (words.length < 3) return [clean, null];
  let best = 1;
  let bestDelta = Number.POSITIVE_INFINITY;
  for (let i = 1; i < words.length; i++) {
    const delta = Math.abs(words.slice(0, i).join(" ").length - words.slice(i).join(" ").length);
    if (delta < bestDelta) {
      best = i;
      bestDelta = delta;
    }
  }
  return [words.slice(0, best).join(" "), words.slice(best).join(" ")];
}

/** Initials for avatar fallbacks (Latin or Arabic names). */
export function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const letters = parts.length > 1 ? [parts[0], parts[parts.length - 1]] : parts;
  return letters.map((part) => Array.from(part)[0] ?? "").join("").toUpperCase();
}

/** "1,200" / "4.9" → numeric parts for <Counter>; anything else renders verbatim. */
export function parseStat(raw: string): { value: number; decimals: number } | null {
  const cleaned = raw.trim().replace(/,/g, "");
  if (!/^\d+(\.\d+)?$/.test(cleaned)) return null;
  const value = Number(cleaned);
  if (!Number.isFinite(value)) return null;
  return { value, decimals: cleaned.includes(".") ? cleaned.split(".")[1].length : 0 };
}
