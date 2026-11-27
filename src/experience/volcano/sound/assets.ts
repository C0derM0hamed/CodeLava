import type { SoundStemId } from "./types";

export type AudioContainerFormat = "webm" | "m4a";

const STEM_BASENAMES: Record<SoundStemId, string> = {
  rumble: "rumble-loop",
  lava: "lava-loop",
  eruption: "eruption-hit",
  code1: "code-burst-1",
  code2: "code-burst-2",
  code3: "code-burst-3",
  logo: "logo-reveal",
};

export const SOUND_BASE_PATH = "/media/hero/sound";

export const SOUND_STEM_IDS: readonly SoundStemId[] = [
  "rumble",
  "lava",
  "eruption",
  "code1",
  "code2",
  "code3",
  "logo",
];

/**
 * Picks the smallest supported compressed audio format for the active browser:
 * Opus in WebM (~118 KB total) on Chrome/Firefox/Edge/modern Safari, falling
 * back to AAC in M4A (~186 KB total) on older Safari / iOS WebKit.
 */
export function detectPreferredAudioFormat(): AudioContainerFormat {
  if (typeof document === "undefined") return "webm";
  try {
    const probe = document.createElement("audio");
    const canOpus = probe.canPlayType('audio/webm; codecs="opus"');
    if (canOpus === "probably" || canOpus === "maybe") {
      return "webm";
    }
  } catch {
    // Fallback safely to AAC
  }
  return "m4a";
}

export function getStemUrl(id: SoundStemId, format: AudioContainerFormat): string {
  return `${SOUND_BASE_PATH}/${STEM_BASENAMES[id]}.${format}`;
}

async function fetchAndDecode(
  ctx: AudioContext,
  url: string,
  signal?: AbortSignal,
): Promise<AudioBuffer | null> {
  try {
    const res = await fetch(url, { signal, credentials: "same-origin" });
    if (!res.ok) return null;
    const arrayBuffer = await res.arrayBuffer();
    if (signal?.aborted) return null;
    // Clone slice to guard against detached ArrayBuffer across browsers
    return await ctx.decodeAudioData(arrayBuffer.slice(0));
  } catch {
    return null;
  }
}

/**
 * Lazily fetches and decodes all compressed stems ONLY after the user opts into sound.
 * If the preferred format fails to decode on a platform quirk, automatically retries
 * with the alternate format before falling back to procedural synthesis.
 */
export async function loadVolcanoAudioBuffers(
  ctx: AudioContext,
  signal?: AbortSignal,
): Promise<Partial<Record<SoundStemId, AudioBuffer>>> {
  const primary = detectPreferredAudioFormat();
  const fallback: AudioContainerFormat = primary === "webm" ? "m4a" : "webm";

  const entries = await Promise.all(
    SOUND_STEM_IDS.map(async (id): Promise<readonly [SoundStemId, AudioBuffer | null]> => {
      let decoded = await fetchAndDecode(ctx, getStemUrl(id, primary), signal);
      if (!decoded && !signal?.aborted) {
        decoded = await fetchAndDecode(ctx, getStemUrl(id, fallback), signal);
      }
      return [id, decoded];
    }),
  );

  const buffers: Partial<Record<SoundStemId, AudioBuffer>> = {};
  for (const [id, buffer] of entries) {
    if (buffer) buffers[id] = buffer;
  }
  return buffers;
}
