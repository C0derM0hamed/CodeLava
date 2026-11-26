import "server-only";

export interface LeadNotifier {
  submitted(lead: { id: string; type: "contact" | "quote" }): Promise<void>;
}

export const leadNotifier: LeadNotifier = {
  async submitted() {},
};
