import "server-only";

export { getArticles, getArticleBySlug } from "./articles";
export {
  getAchievements, getClientLogos, getFaqs, getProcessSteps,
  getTeam, getTechnologies, getTestimonials,
} from "./company";
export { getPageSections, getPageMeta, getSiteSettings, getTranslationOverrides } from "./settings";
export { getAllSlugs } from "./slugs";
export { getServices, getServiceBySlug, getProjects, getProjectBySlug, getProjectCategories } from "./work";
export type * from "./types";
