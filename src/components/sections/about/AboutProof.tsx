import Image from "next/image";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/experience/fx/Reveal";
import { AchievementsCard } from "@/components/sections/home/HomeAchievements";
import { isSafeHttpUrl } from "@/components/sections/home/utils";
import type { AppLocale } from "@/i18n/routing";
import type { Achievement, ClientLogo } from "@/server/queries/types";

/** Achievements row + client logo wall, both straight from the DB; each part hides when empty. */
export function AboutProof({
  locale,
  achievementsKicker,
  achievementsTitle,
  clientsKicker,
  clientsTitle,
  achievements,
  clients,
}: {
  locale: AppLocale;
  achievementsKicker?: string;
  achievementsTitle: string;
  clientsKicker?: string;
  clientsTitle: string;
  achievements: Achievement[];
  clients: ClientLogo[];
}) {
  if (achievements.length === 0 && clients.length === 0) return null;

  return (
    <div className="space-y-16 py-10 sm:space-y-22 sm:py-16">
      {achievements.length > 0 ? (
        <section aria-labelledby="about-achievements-title">
          <div className="container-lava grid gap-8 sm:gap-10">
            <SectionHeading
              layout="split"
              size="md"
              kicker={achievementsKicker}
              title={achievementsTitle}
              titleId="about-achievements-title"
            />
            <Reveal mode="block">
              <AchievementsCard achievements={achievements} locale={locale} layout="row" />
            </Reveal>
          </div>
        </section>
      ) : null}

      {clients.length > 0 ? (
        <section aria-labelledby="about-clients-title">
          <div className="container-lava grid gap-8 sm:gap-10">
            <SectionHeading
              layout="split"
              size="md"
              kicker={clientsKicker}
              title={clientsTitle}
              titleId="about-clients-title"
            />
            <ul className="grid grid-cols-2 gap-3.5 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
              {clients.map((client) => {
                const content = client.logo ? (
                  <Image
                    src={client.logo.url}
                    alt={client.logo.alt || client.name}
                    width={client.logo.width ?? 180}
                    height={client.logo.height ?? 60}
                    sizes="180px"
                    className="h-8 w-auto max-w-[9.5rem] object-contain opacity-85 grayscale transition-[opacity,filter,transform] duration-300 group-hover:scale-[1.03] group-hover:opacity-100 group-hover:grayscale-0 sm:h-9"
                  />
                ) : (
                  <span className="font-display text-base font-semibold text-muted transition-colors group-hover:text-text sm:text-lg">
                    {client.name}
                  </span>
                );
                return (
                  <li
                    key={client.id}
                    className="about-client-tile group grid min-h-22 place-items-center px-5 py-4 sm:min-h-24"
                  >
                    {isSafeHttpUrl(client.url) ? (
                      <a
                        href={client.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        data-cursor="pointer"
                        className="grid size-full place-items-center rounded-md focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-focus"
                      >
                        {content}
                      </a>
                    ) : (
                      content
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        </section>
      ) : null}
    </div>
  );
}
