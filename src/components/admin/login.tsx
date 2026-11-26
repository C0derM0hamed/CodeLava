"use client";

import { useActionState } from "react";
import { login } from "@/server/auth/actions";
import { Label } from "./ui/frame";
import { inputClass, primaryClass } from "./ui/styles";

export function LoginForm() {
  const [state, action, pending] = useActionState(async (_previous: string, data: FormData) => {
    const result = await login(data);
    return result.ok ? "" : result.error;
  }, "");
  return <form action={action} className="grid gap-4">
    <Label title="Email address"><input name="email" type="email" autoComplete="username" required className={inputClass} /></Label>
    <Label title="Password"><input name="password" type="password" autoComplete="current-password" required className={inputClass} /></Label>
    <p role="status" className="text-sm text-danger">{state}</p>
    <button className={primaryClass} disabled={pending}>{pending ? "Signing in…" : "Sign in"}</button>
  </form>;
}
