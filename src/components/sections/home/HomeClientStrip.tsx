import Image from "next/image";
import { cn } from "@/components/ui/cn";
import { Reveal } from "@/experience/fx/Reveal";
import type { ClientLogo } from "@/server/queries/types";
import { isSafeHttpUrl } from "./utils";

function LogoContent({ client }: { client: ClientLogo }) {
  return client.logo ? (
    <Image
      src={client.logo.url}
      alt={client.logo.alt || client.name}
      width={client.logo.width ?? 160}
      height={client.logo.height ?? 48}
      sizes="160px"
      className="h-8 w-auto max-w-[9.5rem] object-contain opacity-70 grayscale transition-[opacity,filter] duration-300 group-hover:opacity-100 group-hover:grayscale-0"
    />
  ) : (
    <span className="font-display text-base font-semibold text-muted transition-colors duration-300 group-hover:text-text">
      {client.name}
    </span>
  );
}

/**
 * Trust strip under the hero (reference): a short label, then real client logos from the DB
 * separated by thin vertical dividers. Renders nothing when there are no visible logos.
 */
export function HomeClientStrip({
  label,
  clients,
  className,
}: {
  label: string;
  clients: ClientLogo[];
  className?: string;
}) {
  const items = clients.slice(0, 6);
  if (items.length === 0) return null;

  return (
    <section aria-label={label} className={cn("relative border-b border-line/70 bg-bg-elevated/80 py-8 lg:py-11", className)}>
      <Reveal mode="block" className="container-lava">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:gap-[var(--space-split)]">
          <p className="max-w-[15rem] shrink-0 text-[0.8125rem] font-medium leading-snug text-muted">
            {label}
          </p>
          <ul className="grid flex-1 grid-cols-2 items-center gap-x-6 gap-y-6 sm:grid-cols-3 lg:flex lg:gap-0">
            {items.map((client) => (
              <li
                key={client.id}
                className="home-clients__item group flex min-h-12 items-center justify-center lg:flex-1 lg:px-6"
              >
                {isSafeHttpUrl(client.url) ? (
                  <a
                    href={client.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    data-cursor="pointer"
                    className="inline-flex items-center rounded-md focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-focus"
                  >
                    <LogoContent client={client} />
                  </a>
                ) : (
                  <LogoContent client={client} />
                )}
              </li>
            ))}
          </ul>
        </div>
      </Reveal>
    </section>
  );
}
