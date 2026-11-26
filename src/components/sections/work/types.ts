import type { AppLocale } from "@/i18n/routing";
import type { MediaView, Project, ProjectDetail } from "@/server/queries";

export type WorkTechnologyBadge = {
  slug: string;
  name: string;
  icon: MediaView | null;
  iconSlug: string | null;
  color: string | null;
};

export type WorkMetricItem = {
  label: string;
  value: string;
};

export type WorkIndexItem = Project & {
  duration?: string | null;
  video?: MediaView | null;
  technologies?: WorkTechnologyBadge[];
  metrics?: WorkMetricItem[];
};

export type WorkCategoryChip = {
  id: string;
  slug: string;
  name: string;
  count: number;
};

export type WorkSectionCopy = {
  eyebrow?: string;
  title?: string;
  description?: string;
  ctaLabel?: string;
};

export type CaseStudyTestimonialData = ProjectDetail["testimonial"];
export type CaseStudyGalleryItem = ProjectDetail["gallery"][number];
export type CaseStudyFeatureItem = ProjectDetail["features"][number];
export type CaseStudyServiceItem = ProjectDetail["services"][number];

export interface WorkLocaleProps {
  locale: AppLocale;
}
