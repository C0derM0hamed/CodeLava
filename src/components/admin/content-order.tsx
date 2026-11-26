"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { reorderContent } from "@/server/content/actions";
import { useToast } from "./ui/feedback";
import { SortableList } from "./ui/sortable";
import { buttonClass, linkClass, primaryClass } from "./ui/styles";

export function ContentOrder({ entity, group, items }: {
  entity: string; group: string; items: { id: string; label: string; href: string }[];
}) {
  const [active, setActive] = useState(false);
  const [ids, setIds] = useState(items.map((item) => item.id));
  const [pending, setPending] = useState(false);
  const toast = useToast();
  const router = useRouter();
  const byId = new Map(items.map((item) => [item.id, item]));
  return <div className="grid gap-3">
    {!active ? <button type="button" className={`${buttonClass} justify-self-start`} onClick={() => { setIds(items.map((item) => item.id)); setActive(true); }}>
      Reorder{group ? ` ${group}` : ""}
    </button> : <>
      <SortableList items={ids.flatMap((id) => byId.get(id) ?? [])} onChange={setIds} disabled={pending}>
        {(item) => <Link className={linkClass} href={byId.get(item.id)!.href}>{item.label}</Link>}
      </SortableList>
      <div className="flex gap-2">
        <button type="button" className={primaryClass} disabled={pending} onClick={async () => {
          setPending(true);
          try {
            const result = await reorderContent(entity, group, ids);
            toast(result.ok ? "Order saved." : result.error, !result.ok);
            if (result.ok) {
              setActive(false);
              router.refresh();
            }
          } finally {
            setPending(false);
          }
        }}>Save order</button>
        <button type="button" className={buttonClass} disabled={pending} onClick={() => setActive(false)}>Cancel</button>
      </div>
    </>}
  </div>;
}
