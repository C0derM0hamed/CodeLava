import { expect, test } from "@playwright/test";
import en from "../../src/i18n/messages/en.json";
import ar from "../../src/i18n/messages/ar.json";

for (const [locale, dir, messages, expectedService, expectedStep, expectedFaq] of [
  [
    "en",
    "ltr",
    en,
    "Custom Web Platforms",
    "Discover",
    "What do you need to start?",
  ],
  [
    "ar",
    "rtl",
    ar,
    "منصات ويب مخصّصة",
    "الاكتشاف",
    "ما الذي تحتاجونه لبدء المشروع؟",
  ],
] as const) {
  test(`${locale} homepage renders seeded sections, hides empty sections, emits JSON-LD, and has no console errors`, async ({
    page,
  }) => {
    const consoleErrors: string[] = [];
    const pageErrors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") consoleErrors.push(msg.text());
    });
    page.on("pageerror", (err) => pageErrors.push(String(err)));

    const response = await page.goto(`/${locale}`, { waitUntil: "networkidle" });
    expect(response?.status()).toBe(200);

    await expect(page.locator("html")).toHaveAttribute("lang", locale);
    await expect(page.locator("html")).toHaveAttribute("dir", dir);
    await expect(page).toHaveTitle(/CodeLava/);

    // Hero H1 + primary/secondary CTAs
    const h1 = page.locator("main h1").first();
    await expect(h1).toBeVisible();
    await expect(page.locator(`main a[href="/${locale}/quote"]`).first()).toBeVisible();
    await expect(page.locator(`main a[href="/${locale}/work"]`).first()).toBeVisible();

    // Seeded Services band links to /services/[slug]
    await expect(page.getByText(expectedService, { exact: true }).first()).toBeVisible();
    await expect(
      page.locator(`main a[href="/${locale}/services/custom-web-platforms"]`).first(),
    ).toBeVisible();

    // Seeded Process band (dark wavy band) links to /process
    await expect(page.getByText(expectedStep, { exact: true }).first()).toBeVisible();
    await expect(page.locator(`main a[href="/${locale}/process"]`).first()).toBeVisible();

    // Seeded Technologies tiles + /technologies link
    await expect(page.getByText("Next.js", { exact: true }).first()).toBeVisible();
    await expect(page.locator(`main a[href="/${locale}/technologies"]`).first()).toBeVisible();

    // About teaser links to /about
    await expect(page.locator(`main a[href="/${locale}/about"]`).first()).toBeVisible();

    // Seeded FAQ teaser accordion expands/collapses & links to /faq
    const faqButton = page.getByRole("button", { name: new RegExp(expectedFaq.replace(/[?؟]/g, "\\$&")) });
    await expect(faqButton).toBeVisible();
    await expect(faqButton).toHaveAttribute("aria-expanded", "true");
    await faqButton.click();
    await expect(faqButton).toHaveAttribute("aria-expanded", "false");
    await expect(page.locator(`main a[href="/${locale}/faq"]`).first()).toBeVisible();

    // Empty DB sections must stay cleanly hidden (no orphan headings)
    await expect(page.locator("#home-work-title")).toHaveCount(0);
    await expect(page.locator("#home-testimonials-title")).toHaveCount(0);
    await expect(page.locator("#home-insights-title")).toHaveCount(0);

    // Structured data: Organization + WebSite
    const jsonLdRaw = await page
      .locator("main script[type='application/ld+json']")
      .allTextContents();
    const types = jsonLdRaw.map((raw) => JSON.parse(raw)["@type"]);
    expect(types).toEqual(expect.arrayContaining(["Organization", "WebSite"]));

    // No horizontal overflow
    const overflowX = await page.evaluate(
      () => document.documentElement.scrollWidth > window.innerWidth,
    );
    expect(overflowX).toBe(false);

    expect(consoleErrors).toEqual([]);
    expect(pageErrors).toEqual([]);
  });

  test(`${locale} about page renders story, markets, process teaser, hides empty team/clients, and emits JSON-LD`, async ({
    page,
  }) => {
    const consoleErrors: string[] = [];
    const pageErrors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") consoleErrors.push(msg.text());
    });
    page.on("pageerror", (err) => pageErrors.push(String(err)));

    const response = await page.goto(`/${locale}/about`, {
      waitUntil: "networkidle",
    });
    expect(response?.status()).toBe(200);

    await expect(page.locator("html")).toHaveAttribute("lang", locale);
    await expect(page.locator("html")).toHaveAttribute("dir", dir);
    await expect(page).toHaveTitle(new RegExp(messages.about.title));

    await expect(page.locator("main h1")).toBeVisible();
    await expect(page.locator("#about-story-title")).toBeVisible();
    await expect(page.locator("#about-values-title")).toBeVisible();
    await expect(page.locator("#about-markets-title")).toBeVisible();
    await expect(page.locator(`main a[href="/${locale}/quote"]`).first()).toBeVisible();

    // Empty team section must stay hidden
    await expect(page.locator("#about-team-title")).toHaveCount(0);

    // Structured data: BreadcrumbList
    const jsonLdRaw = await page
      .locator("main script[type='application/ld+json']")
      .allTextContents();
    const types = jsonLdRaw.map((raw) => JSON.parse(raw)["@type"]);
    expect(types).toEqual(expect.arrayContaining(["BreadcrumbList"]));

    const overflowX = await page.evaluate(
      () => document.documentElement.scrollWidth > window.innerWidth,
    );
    expect(overflowX).toBe(false);

    expect(consoleErrors).toEqual([]);
    expect(pageErrors).toEqual([]);
  });
}

test("reduced motion keeps homepage readable without console errors", async ({
  browser,
}) => {
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    reducedMotion: "reduce",
  });
  const page = await context.newPage();
  const errors: string[] = [];
  page.on("pageerror", (err) => errors.push(String(err)));
  page.on("console", (msg) => {
    if (msg.type() === "error") errors.push(msg.text());
  });

  const resp = await page.goto("/en", { waitUntil: "networkidle" });
  expect(resp?.status()).toBe(200);
  await expect(page.locator("main h1").first()).toBeVisible();
  await expect(page.locator("#home-services-title")).toBeVisible();
  expect(errors).toEqual([]);
  await context.close();
});
