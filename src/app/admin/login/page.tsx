import { redirect } from "next/navigation";
import { CodeXml } from "lucide-react";
import { LoginForm } from "@/components/admin/login";
import { getCurrentUser } from "@/server/auth/session";
import { paneClass } from "@/components/admin/ui/styles";

export const metadata = { title: "Sign in" };

export default async function Login() {
  if (await getCurrentUser()) redirect("/admin");
  return <main className="mx-auto grid min-h-dvh max-w-5xl items-center gap-8 p-6 md:grid-cols-[1fr_24rem] lg:p-12">
    <div className="border-l-2 border-accent pl-6 md:pl-8">
      <CodeXml className="mb-5 text-accent" size={32} aria-hidden />
      <div className="font-display text-5xl font-semibold tracking-tight lg:text-7xl">Code<span className="text-lava-300">Lava.</span></div>
      <p className="mt-3 font-mono text-sm text-muted">Website administration</p>
    </div>
    <section className={`${paneClass} self-start md:self-auto`}>
      <h1 className="mb-5 font-display text-2xl font-semibold">Sign in</h1>
      <LoginForm />
    </section>
  </main>;
}
