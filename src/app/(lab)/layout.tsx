import type { Metadata } from "next";
import "../globals.css";
import { fontVariables } from "../fonts";

/** Internal sandbox for prototyping experiences in isolation. Not linked, not indexed. */
export const metadata: Metadata = { title: "CodeLava Lab", robots: { index: false, follow: false } };

export default function LabLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" dir="ltr" className={fontVariables}>
      <body>{children}</body>
    </html>
  );
}
