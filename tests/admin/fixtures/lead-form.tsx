import { notFound } from "next/navigation";
import { submitLead } from "@/server/leads/actions";
import { encodeLead } from "@/server/leads/schema";

export default function LeadFormFixture() {
  if (process.env.NODE_ENV !== "development") notFound();
  return <main className="p-8">
    <h1>Lead submission fixture</h1>
    <form className="grid gap-3" action={async (form) => {
      "use server";
      const result = await submitLead(encodeLead({
        type: "quote",
        name: String(form.get("name")),
        email: String(form.get("email")),
        message: String(form.get("message")),
        locale: "en",
        sourcePath: "/en/quote",
        startedAt: Number(form.get("startedAt")),
        consent: true,
      }, form.getAll("attachments").filter((file): file is File => file instanceof File)));
      if (!result.ok) throw new Error(JSON.stringify(result.errors));
    }}>
      <input type="hidden" name="startedAt" />
      <label>Name<input name="name" required /></label>
      <label>Email<input name="email" type="email" required /></label>
      <label>Message<textarea name="message" required /></label>
      <label>Attachments<input name="attachments" type="file" multiple /></label>
      <button>Send quote request</button>
    </form>
  </main>;
}
