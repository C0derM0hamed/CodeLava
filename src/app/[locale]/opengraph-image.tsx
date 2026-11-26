import { join } from "node:path";
import { ImageResponse } from "next/og";
import { hasLocale } from "next-intl";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import sharp from "sharp";
import { routing } from "@/i18n/routing";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export const alt = "CodeLava";

export default async function OpenGraphImage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  const t = await getTranslations({ locale, namespace: "meta" });
  const tagline = t("tagline");

  // Pango shapes Arabic and applies the bidi algorithm before Satori composes the card.
  let arabicImage: { src: string; width: number; height: number } | undefined;
  if (locale === "ar") {
    const escaped = tagline.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    const { data, info } = await sharp({
      text: {
        text: `<span foreground="#e6ddd3">${escaped}</span>`,
        font: "Noto Sans Arabic Medium 34",
        fontfile: join(process.cwd(), "src/lib/fonts/NotoSansArabic-Medium.ttf"),
        width: 1000,
        rgba: true,
      },
    }).png().toBuffer({ resolveWithObject: true });
    arabicImage = { src: `data:image/png;base64,${data.toString("base64")}`, width: info.width, height: info.height };
  }

  return new ImageResponse(
    <div style={{
      display: "flex", flexDirection: "column", alignItems: "flex-start", justifyContent: "center",
      width: "100%", height: "100%", padding: 100, color: "#fbf7f2",
      background: "radial-gradient(ellipse at 92% 100%, #4a1405, #07060a 65%)",
    }}>
      <div style={{ display: "flex", fontSize: 118, fontWeight: 700, letterSpacing: -6 }}>
        Code<span style={{ color: "#ff6a00" }}>Lava.</span>
      </div>
      <div style={{ display: "flex", width: 96, height: 3, marginTop: 25, marginBottom: 20, background: "#ff6a00" }} />
      {arabicImage ? (
        // ImageResponse embeds an already-shaped in-memory PNG.
        <img {...arabicImage} alt={tagline} />
      ) : (
        <div style={{ display: "flex", fontSize: 34, color: "#e6ddd3" }}>{tagline}</div>
      )}
    </div>,
    size,
  );
}
