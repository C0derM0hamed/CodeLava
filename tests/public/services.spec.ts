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
    const rows = page.locator(".service-index > li");
    await expect(rows).toHaveCount(6);
    const first = rows.first();
    await expect(first).toContainText(service);
    await first.locator("summary").focus();
    await page.keyboard.press("Enter");
    await expect(first.locator("details")).toHaveAttribute("open", "");
    await expect(first.getByText("Next.js", { exact: true })).toBeVisible();
    await first.getByRole("link", { name: messages.services.viewService, exact: true }).click();

    await expect(page.getByRole("heading", { level: 1, name: service })).toBeVisible();
    await expect(page.getByRole("heading", { name: messages.process.title })).toBeVisible();
    await expect(page.getByRole("link", { name: messages.common.requestQuote, exact: true }).first()).toHaveAttribute(
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
