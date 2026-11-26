export const statuses = ["new", "contacted", "qualified", "proposal", "won", "lost", "spam"] as const;
export type LeadStatus = typeof statuses[number];
export const transitions: Record<LeadStatus, LeadStatus[]> = {
  new: ["contacted", "lost", "spam"],
  contacted: ["qualified", "lost", "spam"],
  qualified: ["proposal", "lost", "spam"],
  proposal: ["won", "lost", "spam"],
  won: ["proposal"],
  lost: ["contacted"],
  spam: ["new"],
};
