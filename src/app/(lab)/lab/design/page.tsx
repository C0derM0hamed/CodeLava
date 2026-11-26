import { Suspense } from "react";
import type { Metadata } from "next";
import { DesignShowcaseClient } from "./DesignShowcaseClient";

export const metadata: Metadata = {
  title: "CodeLava — Design System Lab",
  description: "Daylight Magma living design system showcase (EN / AR, LTR / RTL).",
  robots: { index: false, follow: false },
};

export default function DesignLabPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-bg font-mono text-xs uppercase tracking-[0.16em] text-muted">
          Loading CodeLava Design System…
        </div>
      }
    >
      <DesignShowcaseClient />
    </Suspense>
  );
}
