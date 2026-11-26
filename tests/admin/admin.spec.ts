import { randomUUID } from "node:crypto";
import { copyFile, mkdir, rm } from "node:fs/promises";
import { resolve } from "node:path";
import { expect, test, type Page } from "@playwright/test";
import { and, eq, inArray, or, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import sharp from "sharp";
import * as schema from "../../src/db/schema";

const marker = `PW-${randomUUID().slice(0, 8)}`;
const viewerEmail = `${marker.toLowerCase()}-viewer@example.invalid`;
const leadEmail = `${marker.toLowerCase()}-lead@example.invalid`;
const viewerPassword = randomUUID();
const createdService = `${marker} platform`;
const updatedService = `${createdService} updated`;
const projectTitle = `${marker} project`;
const assetName = `${marker}-cover.png`;
const fixturePath = `/admin/login/${marker.toLowerCase()}`;
const queryFixturePath = `${fixturePath}/sections`;
const fixtureDirectory = resolve(`src/app/admin/login/${marker.toLowerCase()}`);
const connection = postgres(process.env.DATABASE_URL!, { max: 1 });
const db = drizzle(connection, { schema });
let serviceOrder: { id: string; sortOrder: number; updatedAt: Date }[] = [];

async function signIn(page: Page, email: string, password: string) {
  await page.goto("/admin/login");
  await page.getByLabel("Email address").fill(email);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Overview" })).toBeVisible();
}

async function screenshotSizes(page: Page, name: string) {
  const original = page.viewportSize();
  for (const width of [1440, 390]) {
    await page.setViewportSize({ width, height: width === 1440 ? 1000 : 844 });
    await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
    await screenshot(page, `${name}-${width}`);
  }
  if (original) await page.setViewportSize(original);
}

async function exitDraft(page: Page) {
  const exit = await page.request.post("/api/preview/disable", {
    maxRedirects: 0, headers: { origin: new URL(page.url()).origin },
  });
  expect(exit.status()).toBe(303);
}

async function screenshot(page: Page, name: string) {
  const path = process.env.ADMIN_SCREENSHOT_DIR ? resolve(process.env.ADMIN_SCREENSHOT_DIR, `${name}.png`) : test.info().outputPath(`${name}.png`);
  await page.screenshot({ path, fullPage: true, style: "nextjs-portal { display: none !important; }" });
}

test.beforeAll(async () => {
  serviceOrder = await db.select({ id: schema.services.id, sortOrder: schema.services.sortOrder, updatedAt: schema.services.updatedAt }).from(schema.services);
  await mkdir(fixtureDirectory);
  await copyFile("tests/admin/fixtures/lead-form.tsx", resolve(fixtureDirectory, "page.tsx"));
  await mkdir(resolve(fixtureDirectory, "sections"));
  await copyFile("tests/admin/fixtures/page-sections.tsx", resolve(fixtureDirectory, "sections/page.tsx"));
});

test.afterAll(async () => {
  try {
    const [projectRows, serviceRows, mediaRows, leadRows, userRows, roleRows] = await Promise.all([
      db.select({ id: schema.projects.id }).from(schema.projects).where(eq(schema.projects.title, { en: projectTitle, ar: "مشروع الاختبار" })),
      db.select({ id: schema.services.id }).from(schema.services).where(or(
        eq(schema.services.title, { en: createdService, ar: "منصّة الاختبار" }), eq(schema.services.title, { en: updatedService, ar: "منصّة الاختبار محدّثة" }))),
      db.select().from(schema.media).where(eq(schema.media.originalName, assetName)),
      db.query.leads.findMany({ where: eq(schema.leads.email, leadEmail), with: { attachments: true } }),
      db.select({ id: schema.users.id }).from(schema.users).where(eq(schema.users.email, viewerEmail)),
      db.select({ id: schema.roles.id }).from(schema.roles).where(eq(schema.roles.key, marker.toLowerCase())),
    ]);
    const ids = [...projectRows, ...serviceRows, ...mediaRows, ...leadRows, ...userRows, ...roleRows].map((row) => row.id);
    await db.transaction(async (tx) => {
      if (ids.length) {
        await tx.delete(schema.auditLogs).where(or(inArray(schema.auditLogs.entityId, ids), inArray(schema.auditLogs.userId, userRows.map((row) => row.id))));
        await tx.delete(schema.domainEvents).where(inArray(schema.domainEvents.aggregateId, ids));
      }
      for (const { id } of serviceRows) {
        const idInOrder = JSON.stringify([id]);
        await tx.delete(schema.auditLogs).where(and(eq(schema.auditLogs.entity, "services"), eq(schema.auditLogs.action, "reorder"),
          sql`${schema.auditLogs.meta}->'ids' @> ${idInOrder}::jsonb`));
        await tx.delete(schema.domainEvents).where(and(eq(schema.domainEvents.aggregate, "services"), eq(schema.domainEvents.type, "content.reordered"),
          sql`${schema.domainEvents.payload}->'ids' @> ${idInOrder}::jsonb`));
      }
      if (projectRows.length) await tx.delete(schema.projects).where(inArray(schema.projects.id, projectRows.map((row) => row.id)));
      if (serviceRows.length) {
        await tx.delete(schema.services).where(inArray(schema.services.id, serviceRows.map((row) => row.id)));
        for (const { id, sortOrder, updatedAt } of serviceOrder) {
          await tx.update(schema.services).set({ sortOrder, updatedAt }).where(eq(schema.services.id, id));
        }
      }
      if (mediaRows.length) await tx.delete(schema.media).where(inArray(schema.media.id, mediaRows.map((row) => row.id)));
      await tx.delete(schema.leads).where(eq(schema.leads.email, leadEmail));
      await tx.delete(schema.users).where(eq(schema.users.email, viewerEmail));
      await tx.delete(schema.roles).where(eq(schema.roles.key, marker.toLowerCase()));
    });
    await Promise.all([
      ...mediaRows.flatMap((asset) => [asset.storageKey, ...asset.variants.map((variant) => variant.key)])
        .map((key) => rm(resolve(process.env.STORAGE_LOCAL_PUBLIC_DIR || "storage/public", key), { force: true })),
      ...leadRows.flatMap((lead) => lead.attachments).map((file) =>
        rm(resolve(process.env.STORAGE_LOCAL_PRIVATE_DIR || "storage/private", file.storageKey), { force: true })),
    ]);
  } finally {
    await rm(fixtureDirectory, { recursive: true, force: true });
    await connection.end();
  }
});

test("owner previews, publishes and reorders a bilingual service, then uploads a project gallery", async ({ page, browser }) => {
  await signIn(page, process.env.ADMIN_EMAIL!, process.env.ADMIN_PASSWORD!);
  await screenshotSizes(page, "overview");
  await page.goto("/admin/content/services/new");
  await page.getByLabel("Title — English", { exact: true }).fill(createdService);
  await page.getByLabel("Title — Arabic", { exact: true }).fill("منصّة الاختبار");
  await page.getByRole("button", { name: "Save changes" }).click();
  await expect(page).toHaveURL(/\/admin\/content\/services\/[a-f0-9-]{36}$/);
  const serviceId = page.url().split("/").at(-1)!;
  const ar = "منصّة الاختبار";
  await page.getByLabel("Title — English", { exact: true }).fill(updatedService);
  await page.getByLabel("Title — Arabic", { exact: true }).fill(`${ar} محدّثة`);
  await page.getByRole("button", { name: "Save changes" }).click();
  await expect(page.getByRole("heading", { name: updatedService })).toBeVisible();
  const [draft] = await db.select().from(schema.services).where(eq(schema.services.id, serviceId));
  expect(draft.status).toBe("draft");
  const publicPage = await browser.newPage();
  try {
    expect((await publicPage.goto(`/en/services/${draft.slug}`))?.status()).toBe(404);
    const previewLink = await page.getByRole("link", { name: "Preview EN" }).getAttribute("href");
    const preview = await page.request.get(previewLink!, { maxRedirects: 0 });
    expect(preview.status()).toBe(303);
    expect(preview.headers().location).toBe(`/en/services/${draft.slug}`);
    const previewPage = await page.context().newPage();
    try {
      await previewPage.goto(preview.headers().location);
      await expect(previewPage.getByRole("heading", { name: updatedService, exact: true })).toBeVisible();
      await previewPage.goto(`/ar/services/${draft.slug}`);
      await expect(previewPage.getByRole("heading", { name: `${ar} محدّثة`, exact: true })).toBeVisible();
    } finally {
      await previewPage.close();
      await exitDraft(page);
    }
    await page.getByRole("button", { name: "Publish", exact: true }).click();
    await expect(page.getByRole("combobox", { name: "Status", exact: true })).toHaveValue("published");
    await publicPage.goto(`/en/services/${draft.slug}`);
    await expect(publicPage.getByRole("heading", { name: updatedService, exact: true })).toBeVisible();
    await publicPage.goto(`/ar/services/${draft.slug}`);
    await expect(publicPage.getByRole("heading", { name: `${ar} محدّثة`, exact: true })).toBeVisible();
  } finally {
    await publicPage.close();
  }
  await screenshotSizes(page, "service-editor");

  const [published] = await db.select().from(schema.services).where(eq(schema.services.id, serviceId));
  expect(published.publishedAt).toBeInstanceOf(Date);
  await page.goto("/admin/content/services");
  await page.getByRole("button", { name: "Reorder", exact: true }).click();
  const row = page.getByRole("listitem").filter({ has: page.getByRole("link", { name: updatedService }) });
  const dragHandle = row.getByRole("button", { name: `Drag ${updatedService}` });
  await dragHandle.focus();
  await page.keyboard.press("Space");
  await expect(dragHandle).toHaveAttribute("aria-pressed", "true");
  await page.keyboard.press("ArrowUp");
  await expect(page.getByText(new RegExp(`^${updatedService} is over (?!${updatedService})`))).toHaveCount(1);
  await page.keyboard.press("Space");
  await page.getByRole("button", { name: "Save order" }).click();
  await expect(page.getByText("Order saved.")).toBeVisible();
  const [reordered] = await db.select().from(schema.services).where(eq(schema.services.id, serviceId));
  expect(reordered.sortOrder).toBeLessThan(published.sortOrder);

  await page.goto("/admin/media");
  const png = await sharp({ create: { width: 640, height: 320, channels: 3, background: "#cc5511" } }).png().toBuffer();
  await page.getByLabel("Upload files").setInputFiles({ name: assetName, mimeType: "image/png", buffer: png });
  await expect(page.getByRole("heading", { name: assetName })).toBeVisible({ timeout: 30_000 });
  const [asset] = await db.select().from(schema.media).where(eq(schema.media.originalName, assetName));
  expect(asset.width).toBe(640);
  expect(asset.variants.some((variant) => variant.width === 480 && variant.format === "avif")).toBe(true);
  const mediaResponse = await page.request.get(asset.url);
  expect(mediaResponse.status()).toBe(200);
  expect(mediaResponse.headers()["content-type"]).toBe("image/webp");
  expect(mediaResponse.headers()["cache-control"]).toContain("immutable");
  await screenshotSizes(page, "media-library");

  await page.goto("/admin/content/projects/new");
  await page.getByLabel("Title — English", { exact: true }).fill(projectTitle);
  await page.getByLabel("Title — Arabic", { exact: true }).fill("مشروع الاختبار");
  await page.getByRole("button", { name: "Choose gallery images" }).click();
  const picker = page.getByRole("dialog", { name: "Choose gallery images" });
  await picker.getByRole("button", { name: assetName }).click();
  await picker.getByRole("button", { name: "Done (1)" }).click();
  await page.getByLabel("Caption — English").fill("Project gallery caption");
  await page.getByLabel("Caption — Arabic").fill("صورة دراسة الحالة");
  await page.getByLabel("Challenge — English", { exact: true }).fill(`Challenge ${marker}`);
  await page.getByLabel("Challenge — Arabic", { exact: true }).fill(`التحدي ${marker}`);
  await page.getByRole("button", { name: "Save changes" }).click();
  await expect(page.getByRole("heading", { name: projectTitle })).toBeVisible();
  const projectId = page.url().split("/").at(-1)!;
  const [gallery] = await db.select().from(schema.projectMedia).where(and(eq(schema.projectMedia.projectId, projectId), eq(schema.projectMedia.mediaId, asset.id)));
  expect(gallery.caption?.en).toBe("Project gallery caption");
  await screenshot(page, "project-gallery");
  const [project] = await db.select().from(schema.projects).where(eq(schema.projects.id, projectId));
  const casePath = `/work/${project.slug}`;
  const projectVisitor = await browser.newPage();
  const projectPreview = await page.context().newPage();
  try {
    expect((await projectVisitor.goto(`/en${casePath}`))?.status()).toBe(404);
    await projectPreview.goto((await page.getByRole("link", { name: "Preview EN" }).getAttribute("href"))!);
    await expect(projectPreview.getByText(`Challenge ${marker}`, { exact: true })).toBeVisible();
    await exitDraft(page);
    await page.getByRole("button", { name: "Publish", exact: true }).click();
    await expect(page.getByRole("combobox", { name: "Status", exact: true })).toHaveValue("published");
    await projectVisitor.goto(`/ar${casePath}`);
    await expect(projectVisitor.getByText(`التحدي ${marker}`, { exact: true })).toBeVisible();
    await page.getByRole("combobox", { name: "Status", exact: true }).selectOption("archived");
    await page.getByRole("button", { name: "Save changes", exact: true }).click();
    await expect(page.getByText("Saved.", { exact: true })).toBeVisible();
    expect((await projectVisitor.goto(`/en${casePath}`))?.status()).toBe(404);
  } finally {
    await projectVisitor.close();
    await projectPreview.close();
  }

  await page.goto("/admin/media");
  page.once("dialog", (dialog) => dialog.accept());
  await page.getByRole("article").filter({ has: page.getByRole("heading", { name: assetName }) }).getByRole("button", { name: "Delete asset" }).click();
  await expect(page.getByText("Remove this asset from the content that uses it first.")).toBeVisible();
});

test("public Server Action stores a private attachment and owner can advance and download the lead", async ({ page, browser }) => {
  const visitor = await browser.newPage();
  try {
    await visitor.goto(fixturePath);
    await visitor.locator("[name=startedAt]").evaluate((field: HTMLInputElement) => { field.value = String(Date.now()); });
    await visitor.getByLabel("Name").fill(`${marker} inquiry`);
    await visitor.getByLabel("Email").fill(leadEmail);
    await visitor.getByLabel("Message").fill("We need help planning a bilingual project portal.");
    await visitor.getByLabel("Attachments").setInputFiles({ name: "project-brief.txt", mimeType: "text/plain", buffer: Buffer.from("Bilingual project portal brief.") });
    // Match production's minimum form-fill interval even on a fast test runner.
    await expect.poll(async () => visitor.locator("form").isVisible()).toBe(true);
    await visitor.waitForTimeout(1600);
    const submitted = visitor.waitForResponse((response) => response.request().method() === "POST" && new URL(response.url()).pathname === fixturePath);
    await visitor.getByRole("button", { name: "Send quote request" }).click();
    expect((await submitted).ok()).toBe(true);
  } finally {
    await visitor.close();
  }
  await expect.poll(() => db.query.leads.findFirst({ where: eq(schema.leads.email, leadEmail) })).toBeTruthy();

  await signIn(page, process.env.ADMIN_EMAIL!, process.env.ADMIN_PASSWORD!);
  await page.goto("/admin/leads");
  await screenshotSizes(page, "leads-list");
  const csv = await page.request.get(`/api/admin/leads/export?q=${encodeURIComponent(marker + " inquiry")}`);
  expect(csv.status()).toBe(200);
  expect(await csv.text()).toContain(leadEmail);
  await page.getByRole("link", { name: `${marker} inquiry` }).click();
  await expect(page.getByRole("heading", { name: `${marker} inquiry` })).toBeVisible();
  await page.getByLabel("Stage").selectOption("contacted");
  await page.getByRole("button", { name: "Update lead" }).click();
  await expect(page.getByText("Lead updated.")).toBeVisible();
  await page.getByLabel("Internal note").fill("Discovery call requested.");
  await page.getByRole("button", { name: "Add note" }).click();
  await expect(page.getByText("Discovery call requested.")).toBeVisible();
  const attachment = page.getByRole("link", { name: "project-brief.txt" });
  const download = page.waitForEvent("download");
  await attachment.click();
  expect((await download).suggestedFilename()).toBe("project-brief.txt");
  const link = await attachment.getAttribute("href");
  expect(await page.request.get(link!).then((response) => response.text())).toBe("Bilingual project portal brief.");
  const publicAddress = await db.query.leads.findFirst({ where: eq(schema.leads.email, leadEmail), with: { attachments: true } });
  expect((await page.request.get(`/api/media/${publicAddress!.attachments[0].storageKey}`)).status()).toBe(404);
  expect(publicAddress!.status).toBe("contacted");
  await screenshot(page, "lead-detail");
});

test("owner can create a viewer who can read content but cannot create content, see leads or upload media", async ({ page, browser, context }) => {
  const owner = await browser.newPage();
  try {
    await signIn(owner, process.env.ADMIN_EMAIL!, process.env.ADMIN_PASSWORD!);
    await owner.goto("/admin/access");
    const roleKey = marker.toLowerCase();
    await owner.getByText("Add custom role", { exact: true }).click();
    const addRole = owner.locator("details").filter({ has: owner.getByText("Add custom role", { exact: true }) });
    await addRole.getByLabel("Role name").fill(`${marker} reviewer`);
    await addRole.getByLabel("Role key").fill(roleKey);
    await addRole.getByLabel("services:read", { exact: true }).check();
    await addRole.getByRole("button", { name: "Create role" }).click();
    await expect(owner.getByText("Role created.")).toBeVisible();
    const custom = owner.locator("details").filter({ has: owner.locator("summary").getByText(`${marker} reviewer`, { exact: false }) });
    await custom.locator("summary").click();
    await custom.getByLabel("page_sections:read", { exact: true }).check();
    await custom.getByRole("button", { name: "Save role" }).click();
    await expect(owner.getByText("Role updated.")).toBeVisible();
    const [role] = await db.select().from(schema.roles).where(eq(schema.roles.key, roleKey));
    expect(role.permissions).toEqual(expect.arrayContaining(["services:read", "page_sections:read"]));
    owner.once("dialog", (dialog) => dialog.accept());
    await custom.getByRole("button", { name: "Delete role" }).click();
    await expect(custom).toHaveCount(0);
    await db.delete(schema.auditLogs).where(and(eq(schema.auditLogs.entity, "roles"), eq(schema.auditLogs.entityId, role.id)));
    await owner.getByText("Add user", { exact: true }).click();
    const addUser = owner.locator("details").filter({ has: owner.getByText("Add user", { exact: true }) });
    await addUser.getByLabel("Name", { exact: true }).fill(`${marker} viewer`);
    await addUser.getByLabel("Email address").fill(viewerEmail);
    await addUser.getByLabel("Initial password").fill(viewerPassword);
    await addUser.getByRole("combobox", { name: "Role", exact: true }).selectOption({ label: "Viewer" });
    await addUser.getByRole("button", { name: "Create user" }).click();
    await expect(owner.getByText("User created.")).toBeVisible();
  } finally {
    await owner.close();
  }
  await signIn(page, viewerEmail, viewerPassword);
  await page.goto("/admin/content/services");
  await expect(page.getByRole("heading", { name: "Services", exact: true })).toBeVisible();
  await expect(page.getByRole("link", { name: "New record" })).toHaveCount(0);
  await expect(page.getByRole("link", { name: "Lead inbox" })).toHaveCount(0);
  expect((await page.goto("/admin/content/services/new"))?.status()).toBe(404);
  expect((await page.goto("/admin/leads"))?.status()).toBe(404);
  await page.goto("/admin/pages/home");
  await expect(page.getByRole("heading", { name: "Homepage builder" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Publish page" })).toHaveCount(0);
  await expect(page.getByRole("checkbox", { name: "Show Services" })).toHaveCount(0);
  const upload = await context.request.post("/api/admin/media", { headers: { origin: new URL(page.url()).origin }, multipart: {
    file: { name: "viewer-upload.png", mimeType: "image/png", buffer: Buffer.from("denied") },
  } });
  expect(upload.status()).toBe(403);
  expect((await context.request.get("/api/admin/leads/export")).status()).toBe(403);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/admin");
  await page.getByText("Menu", { exact: true }).click();
  await expect(page.getByRole("link", { name: "Services", exact: true })).toBeVisible();
  await expect(page.getByRole("link", { name: "Lead inbox" })).toHaveCount(0);
  await screenshot(page, "viewer-mobile");
});


type SectionData = { sectionKey: string; sortOrder: number; content: Record<string, string> };

async function sectionsFrom(page: Page, locale = "en"): Promise<SectionData[]> {
  expect((await page.goto(queryFixturePath))?.ok()).toBe(true);
  return JSON.parse((await page.locator(`#${locale}`).textContent()) ?? "");
}

test("homepage builder stages bilingual copy, reordering and visibility before publishing", async ({ page, browser }) => {
  const owner = process.env.ADMIN_EMAIL!;
  await signIn(page, owner, process.env.ADMIN_PASSWORD!);
  await page.goto("/admin/pages/home");
  await expect(page.getByRole("heading", { name: "Homepage builder" })).toBeVisible();
  await screenshotSizes(page, "homepage-builder");
  const sectionFilter = eq(schema.pageSections.pageKey, "home");
  const layoutKey = eq(schema.siteSettings.key, "layout_draft:home");
  const originalRows = await db.select().from(schema.pageSections).where(sectionFilter);
  const [originalLayout] = await db.select().from(schema.siteSettings).where(layoutKey);
  expect(originalLayout, "Run against a test database without pending homepage layout changes").toBeUndefined();
  expect(originalRows.some((row) => row.draftContent != null), "Run against a test database without pending homepage copy changes").toBe(false);
  const logsSince = new Date();
  const visitor = await browser.newPage();
  const preview = await page.context().newPage();
  const processTitle = `${marker} process section`;
  const processTitleAr = `عملية التطوير ${marker}`;
  try {
    const original = await sectionsFrom(visitor);
    const originalOrder = original.map(({ sectionKey }) => sectionKey);
    expect(originalOrder).toEqual(expect.arrayContaining(["services", "process", "technologies"]));

    await page.getByRole("link", { name: "Process", exact: true }).click();
    await page.getByLabel("Title — English", { exact: true }).fill(processTitle);
    await page.getByLabel("Title — Arabic", { exact: true }).fill(processTitleAr);
    await page.getByRole("button", { name: "Save copy draft" }).click();
    await expect(page.getByText("Copy draft saved.")).toBeVisible();
    await page.getByRole("link", { name: "Back to page builder" }).click();

    const process = page.getByRole("listitem").filter({ has: page.getByRole("link", { name: "Process", exact: true }) });
    const technologies = page.getByRole("listitem").filter({ has: page.getByRole("link", { name: "Technologies", exact: true }) });
    const order = page.getByRole("region", { name: "Page layout" }).getByRole("list").getByRole("link");
    const refs = () => order.evaluateAll((links) => links.map((link) => link.getAttribute("href")!.split("/").at(-1)!));
    await expect(process).toBeVisible();
    await expect(technologies).toBeVisible();
    const technologyFirst = originalOrder.indexOf("technologies") > originalOrder.indexOf("process");
    const moving = technologyFirst ? technologies : process;
    const movingLabel = technologyFirst ? "Technologies" : "Process";
    for (let i = 0; i < originalOrder.length; i++) {
      const current = await refs();
      if ((current.indexOf("technologies") < current.indexOf("process")) === technologyFirst) break;
      const before = current.indexOf(technologyFirst ? "technologies" : "process");
      await moving.getByRole("button", { name: `Move ${movingLabel} up` }).click();
      await expect.poll(async () => (await refs()).indexOf(technologyFirst ? "technologies" : "process")).toBe(before - 1);
    }
    const expected = (await refs()).filter((key) => key !== "services");
    expect(expected.indexOf("technologies") < expected.indexOf("process")).toBe(technologyFirst);
    await page.getByRole("checkbox", { name: "Show Services", exact: true }).uncheck();
    await page.getByRole("button", { name: "Save layout draft" }).click();
    await expect(page.getByText("Layout draft saved.")).toBeVisible();

    expect(await sectionsFrom(visitor)).toEqual(original);
    const previewLink = page.getByRole("link", { name: "Preview draft EN" });
    await expect(previewLink).toBeVisible();
    await preview.goto((await previewLink.getAttribute("href"))!);
    await expect(preview.getByRole("heading", { name: processTitle })).toBeVisible();
    const previewData = await sectionsFrom(preview);
    expect(previewData.map(({ sectionKey }) => sectionKey)).toEqual(expected);
    expect((await sectionsFrom(preview, "ar")).find(({ sectionKey }) => sectionKey === "process")?.content.title).toBe(processTitleAr);
    await exitDraft(page);

    await page.getByRole("button", { name: "Publish page" }).click();
    await expect(page.getByText("Page published.")).toBeVisible();
    const published = await sectionsFrom(visitor);
    expect(published.map(({ sectionKey }) => sectionKey)).toEqual(expected);
    expect(published.map(({ sortOrder }) => sortOrder)).toEqual([...published.map(({ sortOrder }) => sortOrder)].sort((a, b) => a - b));
    const technologyTitle = published.find(({ sectionKey }) => sectionKey === "technologies")?.content.title;
    expect(technologyTitle).toBeTruthy();
    await visitor.goto("/en");
    const processHeading = visitor.getByRole("heading", { name: processTitle, exact: true });
    const technologyHeading = visitor.getByRole("heading", { name: technologyTitle, exact: true });
    await expect(processHeading).toBeVisible();
    await expect(technologyHeading).toBeVisible();
    const handle = await technologyHeading.elementHandle();
    expect(await processHeading.evaluate((node, other) =>
      Boolean(node.compareDocumentPosition(other) & Node.DOCUMENT_POSITION_PRECEDING), handle)).toBe(technologyFirst);
    await expect(visitor.getByRole("heading", { name: original.find(({ sectionKey }) => sectionKey === "services")!.content.title, exact: true })).toHaveCount(0);
    const [hidden] = await db.select().from(schema.pageSections).where(and(sectionFilter, eq(schema.pageSections.sectionKey, "services")));
    expect(hidden.visible).toBe(false);
    expect(await db.select().from(schema.domainEvents).where(and(eq(schema.domainEvents.aggregateId, "home"),
      eq(schema.domainEvents.type, "content.layout_published"), sql`${schema.domainEvents.createdAt} >= ${logsSince.toISOString()}`))).toHaveLength(1);
  } finally {
    await preview.close();
    await visitor.close();
    await db.transaction(async (tx) => {
      await tx.execute(sql`select pg_advisory_xact_lock(420233)`);
      const current = await tx.select().from(schema.pageSections).where(sectionFilter);
      const originalIds = new Set(originalRows.map(({ id }) => id));
      const ids = ["home", ...current.map(({ id }) => id)];
      await tx.delete(schema.auditLogs).where(and(eq(schema.auditLogs.entity, "page_sections"), inArray(schema.auditLogs.entityId, ids),
        sql`${schema.auditLogs.createdAt} >= ${logsSince.toISOString()}`));
      await tx.delete(schema.domainEvents).where(and(eq(schema.domainEvents.aggregate, "page_sections"), inArray(schema.domainEvents.aggregateId, ids),
        sql`${schema.domainEvents.createdAt} >= ${logsSince.toISOString()}`));
      await tx.delete(schema.siteSettings).where(layoutKey);
      for (const row of current) {
        if (!originalIds.has(row.id)) await tx.delete(schema.pageSections).where(eq(schema.pageSections.id, row.id));
      }
      for (const { id, visible, sortOrder, content, draftContent, updatedAt } of originalRows) {
        await tx.update(schema.pageSections).set({ visible, sortOrder, content, draftContent, updatedAt }).where(eq(schema.pageSections.id, id));
      }
    });
    await page.goto(queryFixturePath);
    const refreshed = page.waitForResponse((response) => response.request().method() === "POST" && new URL(response.url()).pathname === queryFixturePath);
    await page.getByRole("button", { name: "Refresh test caches" }).click();
    expect((await refreshed).ok()).toBe(true);
  }
});

test("content collections support bilingual edits and public visibility", async ({ page, browser }) => {
  test.setTimeout(240_000);
  await signIn(page, process.env.ADMIN_EMAIL!, process.env.ADMIN_PASSWORD!);
  const imageName = `${marker}-catalog.png`;
  const imageData = await sharp({ create: { width: 100, height: 100, channels: 3, background: "#cd5511" } }).png().toBuffer();
  const rows: { entity: string; href: string }[] = [];
  let assetId: string | undefined;
  const publicPage = await browser.newPage();
  const previewPage = await page.context().newPage();

  async function ids(session: Page, entity: string): Promise<string[]> {
    expect((await session.goto(`${queryFixturePath}?entity=${entity}`))?.ok()).toBe(true);
    return JSON.parse((await session.locator("#ids").textContent())!);
  }

  async function fill(fields: Record<string, string>) {
    for (const [label, value] of Object.entries(fields)) await page.getByLabel(label, { exact: true }).fill(value);
  }

  async function saveRecord(entity: string) {
    const path = new URL(page.url()).pathname;
    const action = page.waitForResponse((response) => response.request().method() === "POST"
      && new URL(response.url()).pathname === path && Boolean(response.request().headers()["next-action"]));
    await page.getByRole("button", { name: "Save changes", exact: true }).click();
    const response = await action;
    expect(response.ok()).toBe(true);
    await response.finished();
    await expect(page.getByText("Saved.", { exact: true }).last()).toBeVisible();
    await expect(page).toHaveURL(new RegExp(`/admin/content/${entity}/(?!new$)[^/]+$`));
  }

  const entries = [
    { entity: "technologies", heading: "Technologies", title: "Name", localized: "Description", media: "icon image", visible: true },
    { entity: "testimonials", heading: "Testimonials", title: "Author name", localized: "Quote", media: "avatar", status: true },
    { entity: "client_logos", heading: "Client logos", title: "Client name", media: "logo", visible: true },
    { entity: "achievements", heading: "Achievements", title: "Label — English", localized: "Description", extra: { Value: "1" }, visible: true },
    { entity: "team_members", heading: "Team members", title: "Name — English", localized: "Role", media: "photo", visible: true },
    { entity: "process_steps", heading: "Process steps", title: "Title — English", localized: "Description", visible: true },
    { entity: "faqs", heading: "FAQs", title: "Question — English", localized: "Answer", status: true },
    { entity: "articles", heading: "Articles", title: "Title — English", localized: "Article", media: "cover", status: true },
    { entity: "project_categories", heading: "Project categories", title: "Name — English", visible: true },
    { entity: "page_meta", heading: "Page SEO", title: "Page", localized: "SEO title", media: "social sharing image" },
    { entity: "ui_translations", heading: "UI translations", title: "Translation key", extra: { "English override": marker, "Arabic override": "نص الاختبار" } },
  ];

  try {
    await page.goto("/admin/media");
    await page.getByLabel("Upload files").setInputFiles({ name: imageName, mimeType: "image/png", buffer: imageData });
    const heading = page.getByRole("heading", { name: imageName, exact: true });
    await expect(heading).toBeVisible();
    const [uploaded] = await db.select({ id: schema.media.id }).from(schema.media).where(eq(schema.media.originalName, imageName));
    assetId = uploaded.id;
    const card = page.getByRole("article").filter({ has: heading });
    await card.getByText("Edit metadata", { exact: true }).click();
    await card.getByLabel("Alt text — English").fill("Test image");
    await card.getByLabel("Alt text — Arabic").fill("صورة الاختبار");
    await card.getByRole("button", { name: "Save changes" }).click();
    await expect(page.getByText("Media updated.")).toBeVisible();
    for (const entry of entries) {
      await test.step(entry.heading, async () => {
        const { entity, heading, title, localized, media, visible, status } = entry;
        const name = title === "Page" || title === "Translation key" ? marker.toLowerCase() : `${marker} ${heading}`;
        await page.goto(`/admin/content/${entity}`);
        await expect(page.getByRole("heading", { name: heading, exact: true })).toBeVisible();
        await page.getByRole("link", { name: "New record", exact: true }).click();
        await page.getByLabel(title, { exact: true }).fill(name);
        if (title.endsWith(" — English")) await page.getByLabel(title.replace("English", "Arabic"), { exact: true }).fill("عنوان الاختبار");
        if (entry.extra) {
          for (const [label, value] of Object.entries(entry.extra)) {
            if (typeof value === "string") await fill({ [label]: value });
          }
        }
        if (localized) await fill({ [`${localized} — English`]: marker, [`${localized} — Arabic`]: "نص الاختبار" });
        if (visible) await page.getByLabel("Visible on the site", { exact: true }).uncheck();
        if (media) {
          await page.getByRole("button", { name: `Choose ${media}`, exact: true }).click();
          await page.getByRole("dialog").getByRole("button", { name: imageName, exact: true }).click();
        }
        await saveRecord(entity);
        const href = page.url();
        rows.push({ entity, href });
        await page.reload();
        if (localized) {
          const en = `${localized} — English`;
          const ar = `${localized} — Arabic`;
          await expect(page.getByLabel(en, { exact: true })).toHaveValue(marker);
          await expect(page.getByLabel(ar, { exact: true })).toHaveValue("نص الاختبار");
          await fill({ [en]: `${marker} revised`, [ar]: "نص الاختبار المحدّث" });
          await saveRecord(entity);
          await page.reload();
          await expect(page.getByLabel(ar, { exact: true })).toHaveValue("نص الاختبار المحدّث");
        }
        if (visible) await expect(page.getByLabel("Visible on the site", { exact: true })).not.toBeChecked();
        if (media) await expect(page.getByRole("button", { name: `Remove ${imageName}`, exact: true })).toBeVisible();
        if (visible || status) {
          const id = new URL(href).pathname.split("/").at(-1)!;
          expect(await ids(publicPage, entity)).not.toContain(id);
          const link = await page.getByRole("link", { name: "Preview EN" }).getAttribute("href");
          expect(link).toBeTruthy();
          try {
            const enable = await previewPage.request.get(link!, { maxRedirects: 0 });
            expect(enable.status()).toBe(303);
            expect(await ids(previewPage, entity)).toContain(id);
          } finally {
            await exitDraft(page);
          }
          if (visible) {
            await page.getByLabel("Visible on the site", { exact: true }).check();
            await saveRecord(entity);
          } else {
            await page.getByRole("button", { name: "Publish", exact: true }).click();
            await expect(page.getByText("Published.", { exact: true })).toBeVisible();
          }
          expect(await ids(publicPage, entity)).toContain(id);
          if (visible) await page.getByLabel("Visible on the site", { exact: true }).uncheck();
          else await page.getByRole("combobox", { name: "Status", exact: true }).selectOption("archived");
          await saveRecord(entity);
          await expect.poll(() => ids(publicPage, entity)).not.toContain(id);
        }
      });
    }
  } finally {
    await publicPage.close();
    await previewPage.close();
    for (const { entity, href } of rows.reverse()) {
      await page.goto(href);
      page.once("dialog", (dialog) => dialog.accept());
      await page.getByRole("button", { name: "Delete record", exact: true }).click();
      await expect(page).toHaveURL(new RegExp(`/admin/content/${entity}$`));
    }
    await page.goto("/admin/media");
    const asset = page.getByRole("article").filter({ has: page.getByRole("heading", { name: imageName, exact: true }) });
    if (await asset.count()) {
      page.once("dialog", (dialog) => dialog.accept());
      await asset.getByRole("button", { name: "Delete asset" }).click();
      await expect(asset).toHaveCount(0);
    }
    const [createdAsset] = await db.select({ id: schema.media.id }).from(schema.media).where(eq(schema.media.originalName, imageName));
    expect(createdAsset).toBeUndefined();
    await db.transaction(async (tx) => {
      const records = rows.map(({ entity, href }) => ({ entity, id: decodeURIComponent(new URL(href).pathname.split("/").at(-1)!) }));
      if (assetId) records.push({ entity: "media", id: assetId });
      for (const { entity, id } of records) {
        await tx.delete(schema.auditLogs).where(and(eq(schema.auditLogs.entity, entity), eq(schema.auditLogs.entityId, id)));
        await tx.delete(schema.domainEvents).where(and(eq(schema.domainEvents.aggregate, entity), eq(schema.domainEvents.aggregateId, id)));
      }
    });
  }
});

test("site settings, page SEO and UI strings reach the public site", async ({ page, browser }) => {
  await signIn(page, process.env.ADMIN_EMAIL!, process.env.ADMIN_PASSWORD!);
  const settingsKeys = inArray(schema.siteSettings.key, ["contact", "socials", "seo", "features"]);
  const homeMeta = eq(schema.pageMeta.pageKey, "home");
  const aboutKey = eq(schema.uiTranslations.key, "nav.about");
  const [settings, [originalMeta], [originalTranslation]] = await Promise.all([
    db.select().from(schema.siteSettings).where(settingsKeys),
    db.select().from(schema.pageMeta).where(homeMeta),
    db.select().from(schema.uiTranslations).where(aboutKey),
  ]);
  const startedAt = new Date().toISOString();
  const visitor = await browser.newPage();
  try {
    await page.goto("/admin/settings");
    await page.getByLabel("Address — English", { exact: true }).fill(`${marker} office`);
    await page.getByLabel("Address — Arabic", { exact: true }).fill(`مكتب ${marker}`);
    const social = `https://www.linkedin.com/company/${marker.toLowerCase()}`;
    await page.getByLabel("Linkedin", { exact: true }).fill(social);
    await page.getByLabel("SEO title — English", { exact: true }).fill(`${marker} global`);
    await page.getByLabel("SEO title — Arabic", { exact: true }).fill(`العنوان العام ${marker}`);
    await page.getByRole("button", { name: "Save settings", exact: true }).click();
    await expect(page.getByText("Settings saved.", { exact: true })).toBeVisible();
    await visitor.goto(queryFixturePath);
    const publicSettings = JSON.parse((await visitor.locator("#settings").textContent())!);
    expect(publicSettings.en.seo.title).toBe(`${marker} global`);
    expect(publicSettings.ar.seo.title).toBe(`العنوان العام ${marker}`);
    await visitor.goto("/en");
    await expect(visitor.getByText(`${marker} office`, { exact: true }).first()).toBeVisible();
    await expect(visitor.locator(`footer a[href="${social}"]`)).toBeVisible();
    await visitor.goto("/ar");
    await expect(visitor.getByText(`مكتب ${marker}`, { exact: true }).first()).toBeVisible();

    await page.goto(originalMeta ? "/admin/content/page_meta/home" : "/admin/content/page_meta/new");
    if (!originalMeta) await page.getByLabel("Page", { exact: true }).fill("home");
    await page.getByLabel("SEO title — English", { exact: true }).fill(`${marker} page`);
    await page.getByLabel("SEO title — Arabic", { exact: true }).fill(`عنوان الصفحة ${marker}`);
    await page.getByRole("button", { name: "Save changes", exact: true }).click();
    await expect(page.getByText("Saved.", { exact: true })).toBeVisible();
    await visitor.goto("/en");
    await expect(visitor.locator('meta[property="og:title"]')).toHaveAttribute("content", `${marker} page — CodeLava`);
    await visitor.goto("/ar");
    await expect(visitor.locator('meta[property="og:title"]')).toHaveAttribute("content", `عنوان الصفحة ${marker} — CodeLava`);

    await page.goto("/admin/content/ui_translations/nav.about");
    await page.getByLabel("English override", { exact: true }).fill(`${marker} about`);
    await page.getByLabel("Arabic override", { exact: true }).fill(`عن ${marker}`);
    await page.getByRole("button", { name: "Save changes", exact: true }).click();
    await expect(page.getByText("Saved.", { exact: true })).toBeVisible();
    await visitor.goto("/en");
    await expect(visitor.getByRole("link", { name: `${marker} about`, exact: true }).first()).toBeVisible();
    await visitor.goto("/ar");
    await expect(visitor.getByRole("link", { name: `عن ${marker}`, exact: true }).first()).toBeVisible();
  } finally {
    await visitor.close();
    await db.transaction(async (tx) => {
      await tx.execute(sql`select pg_advisory_xact_lock(420233)`);
      await tx.delete(schema.siteSettings).where(settingsKeys);
      if (settings.length) await tx.insert(schema.siteSettings).values(settings);
      await tx.delete(schema.pageMeta).where(homeMeta);
      if (originalMeta) await tx.insert(schema.pageMeta).values(originalMeta);
      await tx.delete(schema.uiTranslations).where(aboutKey);
      if (originalTranslation) await tx.insert(schema.uiTranslations).values(originalTranslation);
      const affected = [
        ...["contact", "socials", "seo", "features"].map((key) => ["site_settings", key]),
        ["page_meta", "home"], ["ui_translations", "nav.about"],
      ];
      for (const [entity, id] of affected) {
        await tx.delete(schema.auditLogs).where(and(eq(schema.auditLogs.entity, entity), eq(schema.auditLogs.entityId, id),
          sql`${schema.auditLogs.createdAt} >= ${startedAt}`));
        await tx.delete(schema.domainEvents).where(and(eq(schema.domainEvents.aggregate, entity), eq(schema.domainEvents.aggregateId, id),
          sql`${schema.domainEvents.createdAt} >= ${startedAt}`));
      }
    });
    await page.goto(queryFixturePath);
    const refreshed = page.waitForResponse((response) => response.request().method() === "POST" && new URL(response.url()).pathname === queryFixturePath);
    await page.getByRole("button", { name: "Refresh test caches" }).click();
    expect((await refreshed).ok()).toBe(true);
  }
});
