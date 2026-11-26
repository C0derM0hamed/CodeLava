import { Outfit, Geist, JetBrains_Mono, Readex_Pro, IBM_Plex_Sans_Arabic } from "next/font/google";

export const displayLatin = Outfit({ subsets: ["latin"], variable: "--font-display-latin", display: "swap", weight: ["300", "400", "500", "600", "700"] });
export const bodyLatin = Geist({ subsets: ["latin"], variable: "--font-body-latin", display: "swap" });
export const code = JetBrains_Mono({ subsets: ["latin"], variable: "--font-code", display: "swap" });
export const displayArabic = Readex_Pro({ subsets: ["arabic", "latin"], variable: "--font-display-arabic", display: "swap", weight: ["300", "400", "500", "600", "700"] });
export const bodyArabic = IBM_Plex_Sans_Arabic({ subsets: ["arabic"], variable: "--font-body-arabic", display: "swap", weight: ["300", "400", "500", "600", "700"] });

/** Apply on <html>. */
export const fontVariables = [displayLatin, bodyLatin, code, displayArabic, bodyArabic].map((f) => f.variable).join(" ");
