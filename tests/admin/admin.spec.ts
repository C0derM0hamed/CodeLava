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
const fixtureDirectory = resolve(`src/app/admin/login/${marker.toLowerCase()}`);
const connection = postgres(process.env.DATABASE_URL!, { max: 1 });
const db = drizzle(connection, { schema });

async function signIn(page: Page, email: string, password: string) {
  await page.goto("/admin/login");
  await page.getByLabel("Email address").fill(email);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Overview" })).toBeVisible();
}

async function screenshot(page: Page, name: string) {
  await page.screenshot({ path: test.info().outputPath(`${name}.png`), fullPage: true });
}

test.beforeAll(async () => {
  await mkdir(fixtureDirectory);
  await copyFile("tests/admin/fixtures/lead-form.tsx", resolve(fixtureDirectory, "page.tsx"));
});

test.afterAll(async () => {
  try {
    const [projectRows, serviceRows, mediaRows, leadRows, userRows] = await Promise.all([
      db.select({ id: schema.projects.id }).from(schema.projects).where(eq(schema.projects.title, { en: projectTitle, ar: "مشروع الاختبار" })),
      db.select({ id: schema.services.id }).from(schema.services).where(or(
        eq(schema.services.title, { en: createdService, ar: "منصّة الاختبار" }), eq(schema.services.title, { en: updatedService, ar: "منصّة الاختبار" }))),
      db.select().from(schema.media).where(eq(schema.media.originalName, assetName)),
      db.query.leads.findMany({ where: eq(schema.leads.email, leadEmail), with: { attachments: true } }),
      db.select({ id: schema.users.id }).from(schema.users).where(eq(schema.users.email, viewerEmail)),
    ]);
    const ids = [...projectRows, ...serviceRows, ...mediaRows, ...leadRows, ...userRows].map((row) => row.id);
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
      if (serviceRows.length) await tx.delete(schema.services).where(inArray(schema.services.id, serviceRows.map((row) => row.id)));
      if (mediaRows.length) await tx.delete(schema.media).where(inArray(schema.media.id, mediaRows.map((row) => row.id)));
      await tx.delete(schema.leads).where(eq(schema.leads.email, leadEmail));
      await tx.delete(schema.users).where(eq(schema.users.email, viewerEmail));
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

test("owner signs in, edits and publishes a service, reorders it, then uploads a project gallery", async ({ page }) => {
  await signIn(page, process.env.ADMIN_EMAIL!, process.env.ADMIN_PASSWORD!);
  await screenshot(page, "overview");
  await page.goto("/admin/content/services/new");
  await page.getByLabel("Title — English", { exact: true }).fill(createdService);
  await page.getByLabel("Title — Arabic", { exact: true }).fill("منصّة الاختبار");
  await page.getByRole("button", { name: "Save changes" }).click();
  await expect(page).toHaveURL(/\/admin\/content\/services\/[a-f0-9-]{36}$/);
  await page.getByLabel("Title — English", { exact: true }).fill(updatedService);
  await page.getByRole("button", { name: "Publish", exact: true }).click();
  await expect(page.getByRole("combobox", { name: "Status", exact: true })).toHaveValue("published");
  await expect(page.getByRole("heading", { name: updatedService })).toBeVisible();
  await screenshot(page, "service-editor");

  const serviceId = page.url().split("/").at(-1)!;
  const [published] = await db.select().from(schema.services).where(eq(schema.services.id, serviceId));
  expect(published.publishedAt).toBeInstanceOf(Date);
  const previewLink = await page.getByRole("link", { name: "Preview EN" }).getAttribute("href");
  const preview = await page.request.get(previewLink!, { maxRedirects: 0 });
  expect(preview.status()).toBe(303);
  expect(preview.headers().location).toBe(`/en/services/${published.slug}`);
  expect(preview.headers()["set-cookie"]).toContain("__prerender_bypass=");
  const exitPreview = await page.request.post("/api/preview/disable", {
    maxRedirects: 0, headers: { origin: new URL(page.url()).origin },
  });
  expect(exitPreview.status()).toBe(303);

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
  await screenshot(page, "media-library");

  await page.goto("/admin/content/projects/new");
  await page.getByLabel("Title — English", { exact: true }).fill(projectTitle);
  await page.getByLabel("Title — Arabic", { exact: true }).fill("مشروع الاختبار");
  await page.getByRole("button", { name: "Choose gallery images" }).click();
  const picker = page.getByRole("dialog", { name: "Choose gallery images" });
  await picker.getByRole("button", { name: assetName }).click();
  await picker.getByRole("button", { name: "Done (1)" }).click();
  await page.getByLabel("Caption — English").fill("Project gallery caption");
  await page.getByRole("button", { name: "Save changes" }).click();
  await expect(page.getByRole("heading", { name: projectTitle })).toBeVisible();
  const projectId = page.url().split("/").at(-1)!;
  const [gallery] = await db.select().from(schema.projectMedia).where(and(eq(schema.projectMedia.projectId, projectId), eq(schema.projectMedia.mediaId, asset.id)));
  expect(gallery.caption?.en).toBe("Project gallery caption");
  await screenshot(page, "project-gallery");

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
