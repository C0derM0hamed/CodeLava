import Image from "next/image";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { SocialIcon, detectSocialNetwork, ArrowUpRightIcon } from "@/components/ui/Icons";
import { Reveal } from "@/experience/fx/Reveal";
import { initials, isSafeHttpUrl } from "@/components/sections/home/utils";
import type { TeamMember } from "@/server/queries/types";

const SOCIAL_NAMES: Record<string, string> = {
  linkedin: "LinkedIn",
  github: "GitHub",
  x: "X",
  behance: "Behance",
  dribbble: "Dribbble",
  website: "Website",
  upwork: "Upwork",
  mostaql: "Mostaql",
};

/** Team grid from the DB (portrait or monogram, name, role, short bio, social links). Hidden when empty. */
export function AboutTeam({
  eyebrow,
  title,
  lead,
  linkLabel,
  members,
}: {
  eyebrow?: string;
  title: string;
  lead?: string;
  /** "{name} on {network}" */
  linkLabel: string;
  members: TeamMember[];
}) {
  if (members.length === 0) return null;

  return (
    <section aria-labelledby="about-team-title" className="py-16 sm:py-22">
      <div className="container-lava grid gap-[var(--space-heading)]">
        <SectionHeading
          layout="split"
          size="md"
          kicker={eyebrow}
          title={title}
          lead={lead}
          titleId="about-team-title"
        />
        <ul className="grid gap-[var(--space-grid)] sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {members.map((member, index) => {
            const links = Object.entries(member.socials ?? {}).filter(
              (entry): entry is [string, string] => isSafeHttpUrl(entry[1]),
            );
            return (
              <Reveal
                as="li"
                mode="block"
                delay={(index % 4) * 70}
                key={member.id}
                className="about-team-card group flex flex-col"
              >
                <div className="p-2.5 pb-0">
                  <div className="relative aspect-[4/3] overflow-hidden rounded-[calc(var(--radius-lg)-8px)] border border-line bg-[radial-gradient(80%_70%_at_50%_100%,color-mix(in_oklab,var(--lava-300)_35%,transparent),transparent),var(--surface-2)] sm:aspect-[4/4.1]">
                    {member.photo ? (
                      <Image
                        src={member.photo.url}
                        alt={member.photo.alt || member.name}
                        fill
                        sizes="(max-width: 640px) 92vw, (max-width: 1280px) 30vw, 290px"
                        placeholder={member.photo.blurDataUrl ? "blur" : "empty"}
                        blurDataURL={member.photo.blurDataUrl ?? undefined}
                        className="object-cover object-top transition-transform duration-700 ease-[var(--ease-out-expo)] group-hover:scale-[1.04]"
                      />
                    ) : (
                      <span
                        aria-hidden="true"
                        className="grid size-full place-items-center font-display text-5xl font-bold text-accent-text/80"
                      >
                        {initials(member.name)}
                      </span>
                    )}
                    <span
                      aria-hidden="true"
                      className="pointer-events-none absolute inset-x-0 bottom-0 h-[2px] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                      style={{ background: "var(--gradient-heat-seam)" }}
                    />
                  </div>
                </div>

                <div className="flex flex-1 flex-col gap-2 p-5 sm:p-6">
                  <h3 className="font-display text-lg font-bold text-text">{member.name}</h3>
                  {member.role ? (
                    <p className="text-sm font-semibold text-accent-text">{member.role}</p>
                  ) : null}
                  {member.bio ? (
                    <p className="pt-1 text-sm leading-relaxed text-muted">{member.bio}</p>
                  ) : null}

                  {links.length > 0 ? (
                    <ul className="mt-auto flex flex-wrap gap-2 border-t border-line pt-4">
                      {links.map(([key, href]) => {
                        const network = detectSocialNetwork(key) ?? detectSocialNetwork(href);
                        const name = SOCIAL_NAMES[key] ?? key;
                        return (
                          <li key={key}>
                            <a
                              href={href}
                              target="_blank"
                              rel="noopener noreferrer"
                              data-cursor="pointer"
                              aria-label={linkLabel
                                .replace("{name}", member.name)
                                .replace("{network}", name)}
                              className="grid size-9 place-items-center rounded-full border border-line bg-pearl-100 text-muted transition-all duration-200 hover:border-line-lava-strong hover:bg-accent-soft hover:text-accent-text focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
                            >
                              {network ? (
                                <SocialIcon network={network} size={15} />
                              ) : (
                                <ArrowUpRightIcon size={15} />
                              )}
                            </a>
                          </li>
                        );
                      })}
                    </ul>
                  ) : null}
                </div>
              </Reveal>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
