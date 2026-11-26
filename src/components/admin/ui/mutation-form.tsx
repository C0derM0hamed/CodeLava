"use client";

import { useRouter } from "next/navigation";
import { useState, type ReactNode } from "react";
import type { ActionResult } from "@/server/changes";
import { useToast } from "./feedback";
import { buttonClass, primaryClass } from "./styles";

export function MutationForm({ children, action, success, label = "Save changes", resetOnSuccess = false }: {
  children: ReactNode; action: (form: FormData) => Promise<ActionResult>; success: string; label?: string; resetOnSuccess?: boolean;
}) {
  const notify = useToast();
  const router = useRouter();
  const [pending, setPending] = useState(false);
  return <form className="grid gap-4" onSubmit={async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    setPending(true);
    try {
      const result = await action(data);
      notify(result.ok ? success : result.error, !result.ok);
      if (result.ok) {
        if (resetOnSuccess) form.reset();
        router.refresh();
      }
    } finally {
      setPending(false);
    }
  }}>
    <fieldset className="grid min-w-0 gap-3" disabled={pending}>{children}</fieldset>
    <button disabled={pending} className={`${primaryClass} justify-self-start`}>{pending ? "Saving…" : label}</button>
  </form>;
}

export function DeleteButton({ action, item, onDeleted }: {
  action: () => Promise<ActionResult>; item: string; onDeleted?: string;
}) {
  const toast = useToast();
  const router = useRouter();
  const [pending, setPending] = useState(false);
  return <button className={`${buttonClass} text-danger`} type="button" disabled={pending} onClick={async () => {
    if (!window.confirm(`Delete ${item}? This cannot be undone.`)) return;
    setPending(true);
    try {
      const result = await action();
      toast(result.ok ? "Deleted." : result.error, !result.ok);
      if (result.ok) {
        if (onDeleted) router.push(onDeleted);
        router.refresh();
      }
    } finally {
      setPending(false);
    }
  }}>{pending ? "Deleting…" : `Delete ${item}`}</button>;
}
