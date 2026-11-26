/**
 * The technology catalog relates to projects, not services, so services map to technology
 * categories here (seeded disciplines). Unknown slugs simply show no technologies.
 */
export const serviceDisciplines: Record<string, string[]> = {
  "custom-web-platforms": ["frontend", "backend", "database"],
  "mobile-apps": ["mobile"],
  "ai-solutions-automation": ["ai"],
  "product-design": ["design"],
  ecommerce: ["frontend", "database"],
  "cloud-devops": ["cloud"],
};
