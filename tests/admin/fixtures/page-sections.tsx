import { notFound } from "next/navigation";
import { requirePermission } from "@/server/auth/session";
import { invalidate } from "@/server/changes";
import {
  getAchievements, getArticles, getClientLogos, getFaqs, getPageSections, getProcessSteps, getProjectCategories,
  getSiteSettings, getTeam, getTechnologies, getTestimonials,
} from "@/server/queries";

const collections = {
  technologies: () => getTechnologies(),
  testimonials: () => getTestimonials(),
  client_logos: () => getClientLogos(),
  achievements: () => getAchievements(),
  team_members: () => getTeam(),
  process_steps: () => getProcessSteps(),
  faqs: () => getFaqs(),
  articles: async () => (await getArticles({ pageSize: 100 })).items,
  project_categories: () => getProjectCategories(),
};

export default async function SectionQueryFixture({ searchParams }: { searchParams: Promise<{ entity?: string }> }) {
  if (process.env.NODE_ENV !== "development") notFound();
  const { entity } = await searchParams;
  if (entity && Object.hasOwn(collections, entity)) {
    const rows = await collections[entity as keyof typeof collections]();
    return <pre id="ids">{JSON.stringify(rows.map(({ id }) => id))}</pre>;
  }
  const [en, ar, settingsEn, settingsAr] = await Promise.all([
    getPageSections("home", "en"), getPageSections("home", "ar"), getSiteSettings("en"), getSiteSettings("ar"),
  ]);
  return <main>
    <pre id="en">{JSON.stringify(en)}</pre>
    <pre id="ar">{JSON.stringify(ar)}</pre>
    <pre id="settings">{JSON.stringify({ en: settingsEn, ar: settingsAr })}</pre>
    <form action={async () => {
      "use server";
      if (process.env.NODE_ENV !== "development") notFound();
      await requirePermission("page_sections:publish");
      invalidate("page-sections");
      invalidate("services");
      invalidate("projects");
      invalidate("media");
      invalidate("settings");
      invalidate("page-meta");
      invalidate("translations");
    }}>
      <button>Refresh test caches</button>
    </form>
  </main>;
}
