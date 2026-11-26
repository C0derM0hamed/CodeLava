import { expect, test } from "@playwright/test";
import en from "../../src/i18n/messages/en.json";
import ar from "../../src/i18n/messages/ar.json";

for (const [locale, messages, service, prompt, search] of [
  ["en", en, "Custom Web Platforms", "Can you work with an existing system?", "existing system"],
  ["ar", ar, "منصات ويب مخصّصة", "هل يمكنكم العمل على نظام قائم؟", "نظام قائم"],
] as const) {
  test(`${locale} service index and detail render with localized SEO and quote handoff`, async ({ page }) => {
    const index = await page.goto(`/${locale}/services`);
    expect(index?.status()).toBe(200);
    await expect(page).toHaveTitle(new RegExp(messages.services.title));
    const tiles = page.locator("a.service-tile");
    await expect(tiles).toHaveCount(6);
    const first = tiles.first();
    await expect(first).toContainText(service);
    await expect(first).toHaveClass(/service-tile--featured/);
    await expect(first).toHaveAttribute("href", `/${locale}/services/custom-web-platforms`);
    await first.focus();
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(new RegExp(`/${locale}/services/custom-web-platforms$`));

    await expect(page.getByRole("heading", { level: 1, name: service })).toBeVisible();
    await expect(page.getByRole("heading", { name: messages.process.title })).toBeVisible();
    await expect(page.getByText("Next.js", { exact: true })).toBeVisible();
    // The closing "talk to us" banner now lives in the shared footer, not in the page body.
    await expect(page.locator("main").getByRole("heading", { name: messages.common.discussProject })).toHaveCount(0);
    await expect(page.locator("a.service-tile")).toHaveCount(3);
    await expect(page.locator("main").getByRole("link", { name: messages.common.requestQuote, exact: true }).first()).toHaveAttribute(
      "href", `/${locale}/quote?service=custom-web-platforms`,
    );
    const structuredData = await page.locator("main script[type='application/ld+json']").allTextContents();
    expect(structuredData.map((value) => JSON.parse(value)["@type"])).toEqual(expect.arrayContaining(["Service", "BreadcrumbList"]));
    expect((await page.goto(`/${locale}/services/not-a-published-slug`))?.status()).toBe(404);
  });

  test(`${locale} FAQ search and question deep link are keyboard navigable`, async ({ page }) => {
    await page.goto(`/${locale}/faq`);
    const searchInput = page.getByRole("searchbox", { name: locale === "ar" ? "ابحث في الأسئلة" : "Search questions" });
    await searchInput.fill("no-such-question-2850");
    await expect(page.getByText(messages.common.noResults)).toBeVisible();
    await searchInput.fill(search);
    const question = page.getByRole("button", { name: prompt, exact: true });
    await expect(question).toBeVisible();
    await expect(page.locator(".faq-question")).toHaveCount(1);
    await question.focus();
    await page.keyboard.press("Enter");
    await expect(question).toHaveAttribute("aria-expanded", "true");

    const id = await page.locator(".faq-question").getAttribute("id");
    await page.goto(`/${locale}/faq#${id}`);
    await expect(question).toHaveAttribute("aria-expanded", "true");
    await expect(question).toBeFocused();
    expect(JSON.parse(await page.locator("main script[type='application/ld+json']").textContent() ?? "{}")["@type"]).toBe("FAQPage");
  });
}
