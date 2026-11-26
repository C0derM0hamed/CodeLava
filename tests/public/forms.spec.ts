import { createHmac, randomInt, randomUUID } from "node:crypto";
import { readFile, rm } from "node:fs/promises";
import { resolve } from "node:path";
import { expect, test, type Page } from "@playwright/test";
import { eq, inArray } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "../../src/db/schema";
import en from "../../src/i18n/messages/en.json";
import ar from "../../src/i18n/messages/ar.json";

const connection = postgres(process.env.DATABASE_URL!, { max: 1 });
const db = drizzle(connection, { schema });
const emails: string[] = [];
const rateKeys: string[] = [];

function newEmail() {
  const email = `pw-conversion-${randomUUID()}@example.invalid`;
  emails.push(email);
  return email;
}

async function isolateRateLimit(page: Page): Promise<string> {
  // A test-only address keeps cleanup isolated from the lead's shared dev-server rate bucket.
  const ip = `192.0.2.${randomInt(1, 255)}`;
  const key = createHmac("sha256", process.env.SESSION_SECRET!).update("lead").update("\0").update(ip).digest("hex");
  if ((await db.select().from(schema.rateLimits).where(eq(schema.rateLimits.key, key))).length) {
    return isolateRateLimit(page);
  }
  rateKeys.push(key);
  await page.setExtraHTTPHeaders({ "x-forwarded-for": ip });
  return key;
}

test.afterAll(async () => {
  try {
    const rows = emails.length ? await db.query.leads.findMany({
      where: inArray(schema.leads.email, emails), with: { attachments: true },
    }) : [];
    const ids = rows.map(({ id }) => id);
    await Promise.all(rows.flatMap(({ attachments }) => attachments).map(({ storageKey }) =>
      rm(resolve(process.env.STORAGE_LOCAL_PRIVATE_DIR || "storage/private", storageKey), { force: true })));
    await db.transaction(async (tx) => {
      if (ids.length) {
        await tx.delete(schema.auditLogs).where(inArray(schema.auditLogs.entityId, ids));
        await tx.delete(schema.domainEvents).where(inArray(schema.domainEvents.aggregateId, ids));
        await tx.delete(schema.leads).where(inArray(schema.leads.id, ids));
      }
      if (rateKeys.length) await tx.delete(schema.rateLimits).where(inArray(schema.rateLimits.key, rateKeys));
    });
  } finally {
    await connection.end();
  }
});

for (const [locale, messages, sample] of [
  ["en", en, { name: "Test Engineering", brief: "We need a bilingual portal for field teams and operations reporting.", service: "Custom Web Platforms" }],
  ["ar", ar, { name: "فريق اختبار", brief: "نحتاج إلى بوابة ثنائية اللغة للفرق الميدانية وإعداد تقارير العمليات.", service: "منصات ويب مخصّصة" }],
] as const) {
  test(`submits the ${locale} quote and stores one private attachment`, async ({ page }) => {
    const rateKey = await isolateRateLimit(page);
    const email = newEmail();
    await page.goto(`/${locale}/services/custom-web-platforms`);
    await page.getByRole("link", { name: messages.common.requestQuote, exact: true }).first().click();
    await expect(page).toHaveURL(new RegExp(`/${locale}/quote\\?service=custom-web-platforms`));
    const quotePath = `/${locale}/quote?service=custom-web-platforms&utm_source=conversion-test`;
    await page.goto(quotePath, { referer: `${new URL(page.url()).origin}/${locale}/services` });
    await expect(page.locator("html")).toHaveAttribute("dir", locale === "ar" ? "rtl" : "ltr");
    const preselected = page.getByRole("checkbox", { name: new RegExp(sample.service) });
    await expect(preselected).toBeChecked();
    const serviceId = await preselected.getAttribute("value");

    const next = page.getByRole("button", { name: messages.common.next, exact: true });
    await next.click();
    await expect(page.getByRole("heading", { level: 2, name: locale === "ar" ? "تفاصيل المشروع" : "Project details" })).toBeFocused();
    await page.getByLabel(messages.quote.projectDescription).fill(sample.brief);
    await next.click();

    await page.getByLabel(messages.quote.currency).selectOption("AED");
    await page.getByLabel(messages.quote.budget).selectOption("20000-54999");
    await page.getByLabel(messages.quote.timeline).selectOption("flexible");
    await next.click();

    await page.getByLabel(messages.forms.name).fill(sample.name);
    await page.getByLabel(messages.forms.email).fill(email);
    await page.getByLabel(messages.forms.phone).fill("+971 50 555 0123");
    await page.getByLabel(messages.forms.country).selectOption("AE");
    await page.getByLabel(locale === "ar" ? "طريقة التواصل المفضّلة" : "Preferred contact method").selectOption("whatsapp");
    await expect.poll(() => page.evaluate((lang) => {
      const stored = sessionStorage.getItem(`codelava:project-draft:v1:${lang}`);
      return stored ? JSON.parse(stored).draft.preferredContact : "";
    }, locale)).toBe("whatsapp");
    await page.reload();
    await expect(page.getByLabel(messages.forms.email)).toHaveValue(email);
    await next.click();

    const text = "CodeLava Playwright attachment fixture.";
    await page.locator("#quote-files").setInputFiles({ name: "brief.txt", mimeType: "text/plain", buffer: Buffer.from(text) });
    await expect(page.getByRole("button", { name: messages.forms.attachments.remove.replace("{name}", "brief.txt") })).toBeVisible();
    await page.getByLabel(messages.forms.consentLabel).focus();
    await page.keyboard.press("Space");
    await page.getByRole("button", { name: locale === "ar" ? "راجع طلبك" : "Review request" }).click();
    await expect(page.getByRole("heading", { name: messages.quote.review, exact: true })).toBeFocused();
    await expect(page.getByText(email, { exact: true })).toBeVisible();
    await page.getByRole("button", { name: messages.quote.submit, exact: true }).click();
    await expect(page.getByRole("heading", { name: messages.quote.successTitle })).toBeVisible();

    const lead = await db.query.leads.findFirst({ where: eq(schema.leads.email, email), with: { attachments: true } });
    expect(lead).toMatchObject({
      type: "quote", locale, name: sample.name, country: "AE", currency: "AED", timeline: "flexible",
      sourcePath: `/${locale}/quote`, utm: { utm_source: "conversion-test" }, details: { preferredContact: "whatsapp" },
      serviceIds: [serviceId],
    });
    expect(lead?.referrer).toMatch(new RegExp(`/${locale}/services$`));
    expect(lead?.attachments).toHaveLength(1);
    const [attachment] = lead!.attachments;
    expect(attachment).toMatchObject({ originalName: "brief.txt", mime: "text/plain", size: Buffer.byteLength(text) });
    expect(await readFile(resolve(process.env.STORAGE_LOCAL_PRIVATE_DIR || "storage/private", attachment.storageKey), "utf8")).toBe(text);
    expect((await page.request.get(`/media/${attachment.storageKey}`)).status()).toBe(404);
    await expect(page.getByText(lead!.id, { exact: true })).toBeVisible();
    expect((await db.select().from(schema.rateLimits).where(eq(schema.rateLimits.key, rateKey))).length).toBe(1);
  });
}

test("quote validates the current step and rejects disallowed files", async ({ page }) => {
  await page.goto("/en/quote");
  const next = page.getByRole("button", { name: en.common.next, exact: true });
  await next.click();
  await expect(page.getByText("Select a service or ask for help deciding.")).toBeVisible();

  await page.getByRole("checkbox", { name: en.quote.unsure }).focus();
  await page.keyboard.press("Space");
  await next.click();
  await page.getByLabel(en.quote.projectDescription).fill("short");
  await next.click();
  await expect(page.getByText("Enter at least 10 characters.")).toBeVisible();
  await page.getByLabel(en.quote.projectDescription).fill("A clear and actionable test project brief.");
  await next.click();
  await next.click();
  await next.click();
  await expect(page.getByLabel(en.forms.name)).toHaveAttribute("aria-invalid", "true");
  await page.getByLabel(en.forms.name).fill("Test Client");
  await page.getByLabel(en.forms.email).fill("bad-email");
  await next.click();
  await expect(page.getByText(en.forms.validation.email)).toBeVisible();
  await page.getByLabel(en.forms.email).fill("validate@example.invalid");
  await next.click();
  await page.locator("#quote-files").setInputFiles({ name: "blocked.exe", mimeType: "application/octet-stream", buffer: Buffer.from("format") });
  await expect(page.getByText(en.forms.validation.fileType)).toBeVisible();
  await page.getByRole("button", { name: "Review request" }).click();
  await expect(page.getByText(en.forms.validation.consent)).toBeVisible();
});

test("contact validates and submits a short message", async ({ page }) => {
  await isolateRateLimit(page);
  const email = newEmail();
  await page.goto("/en/contact?utm_campaign=contact-test");
  const send = page.getByRole("button", { name: en.contact.submit, exact: true });
  await send.click();
  await expect(page.getByLabel(en.forms.name)).toHaveAttribute("aria-invalid", "true");
  await expect(page.getByText(en.forms.validation.consent)).toBeVisible();
  await page.getByLabel(en.forms.name).fill("Test Client");
  await page.getByLabel(en.forms.email).fill(email);
  await page.getByLabel(en.contact.message, { exact: false }).fill("We have a question about a project from your site.");
  await page.locator('label[for="lead-consent"]').click();
  await send.click();
  await expect(page.getByRole("heading", { name: en.contact.successTitle })).toBeVisible();
  expect(await db.query.leads.findFirst({ where: eq(schema.leads.email, email) })).toMatchObject({
    type: "contact", locale: "en", sourcePath: "/en/contact", utm: { utm_campaign: "contact-test" },
  });
});

test("quote can send a single-page form with JavaScript off", async ({ browser, baseURL }) => {
  const context = await browser.newContext({ javaScriptEnabled: false, baseURL });
  try {
    const page = await context.newPage();
    await isolateRateLimit(page);
    const email = newEmail();
    await page.goto("/en/quote");
    await page.getByRole("checkbox", { name: en.quote.unsure }).focus();
    await page.keyboard.press("Space");
    await page.getByLabel(en.quote.projectDescription).fill("This request exercises the native server-rendered form.");
    await page.getByLabel(en.forms.name).fill("Native Form");
    await page.getByLabel(en.forms.email).fill(email);
    await page.locator('label[for="lead-consent"]').click();
    const opened = Number(await page.locator("input[name=startedAt]").inputValue());
    expect(opened).toBeGreaterThan(0);
    await expect.poll(() => Date.now() - opened).toBeGreaterThanOrEqual(1_500);
    await page.getByRole("button", { name: en.quote.submit, exact: true }).click();
    await expect(page.getByRole("heading", { name: en.quote.successTitle })).toBeVisible();
    expect(await db.query.leads.findFirst({ where: eq(schema.leads.email, email) })).toMatchObject({
      type: "quote", locale: "en", details: { unsure: true },
    });
  } finally {
    await context.close();
  }
});
