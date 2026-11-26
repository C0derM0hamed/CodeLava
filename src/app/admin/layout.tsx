import type { Metadata } from "next";
import type { ReactNode } from "react";
import { ToastProvider } from "@/components/admin/ui/feedback";
import { fontVariables } from "../fonts";
import "../globals.css";

export const metadata: Metadata = {
  title: { default: "CodeLava Admin", template: "%s · CodeLava Admin" },
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: ReactNode }) {
  return <html lang="en" className={fontVariables}>
    <body className="min-h-dvh bg-bg font-sans text-text"><ToastProvider>{children}</ToastProvider></body>
  </html>;
}
