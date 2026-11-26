import { redirect } from "next/navigation";
import { Logo } from "@/components/brand";
import { LoginForm } from "@/components/admin/login";
import { getCurrentUser } from "@/server/auth/session";
import { paneClass } from "@/components/admin/ui/styles";

export const metadata = { title: "Sign in" };

export default async function Login() {
  if (await getCurrentUser()) redirect("/admin");
  return <main className="mx-auto grid min-h-dvh max-w-5xl items-center gap-8 p-6 md:grid-cols-[1fr_24rem] lg:p-12">
    <div className="border-s-2 border-accent ps-5 md:ps-8">
      <Logo tone="light" size="xl" />
      <p className="mt-3 text-sm text-muted">Website administration</p>
    </div>
    <section className={`${paneClass} self-start md:self-auto`}>
      <h1 className="mb-5 font-display text-2xl font-semibold">Sign in</h1>
      <LoginForm />
    </section>
  </main>;
}
