import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

// Opens the home page and waits until the boot screen has dissolved.
async function openHome(page: Page) {
  await page.goto("/");
  await expect(page.locator(".preloader")).toHaveCount(0, { timeout: 15_000 });
}

test("page has no serious accessibility violations", async ({ page }) => {
  await openHome(page);
  await page.waitForTimeout(1800); // let the intro scramble settle
  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations.filter(({ impact }) => ["critical", "serious"].includes(impact ?? ""))).toEqual([]);
});

test("page has no horizontal overflow", async ({ page }) => {
  await openHome(page);
  const dimensions = await page.evaluate(() => ({
    viewport: document.documentElement.clientWidth,
    content: document.documentElement.scrollWidth,
  }));
  expect(dimensions.content).toBeLessThanOrEqual(dimensions.viewport);
});

test("document has one main heading, language and structured data", async ({ page }) => {
  await openHome(page);
  await expect(page.locator("html")).toHaveAttribute("lang", "de");
  await expect(page.locator("h1")).toHaveCount(1);
  const jsonLd = await page.locator('script[type="application/ld+json"]').textContent();
  expect(JSON.parse(jsonLd ?? "{}")["@type"]).toBe("Person");
  await expect(page.locator('meta[property="og:image"]')).toHaveAttribute("content", /social-preview\.png$/);
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", "https://scruzzi.com");
});

test("portfolio links to source and public work samples", async ({ page }) => {
  await openHome(page);
  for (const href of [
    "https://github.com/matta813/scruzzi--website",
    "https://github.com/matta813/velora-dns",
    "https://github.com/matta813/PGSentinel",
    "https://github.com/matta813/THE-OTHER-PLAYER",
  ]) {
    await expect(page.locator(`a[href="${href}"]`).first()).toBeAttached();
  }
});

test("operations switch the detail view", async ({ page }) => {
  await openHome(page);
  const stage = page.locator("#ops-stage");
  await expect(stage.getByRole("heading", { level: 3 })).toHaveText("Zwei-Node-Proxmox-Cluster");
  const button = page.getByRole("button", { name: /Netzwerk & DNS/ }).first();
  await button.click();
  await expect(stage.getByRole("heading", { level: 3 })).toHaveText("Segmentiertes Netzwerk");
  await expect(button).toHaveAttribute("aria-pressed", "true");
});

test("menu supports link, outside-click and keyboard dismissal", async ({ page }) => {
  await openHome(page);
  const toggle = page.locator("[aria-controls='nav-panel']");

  await toggle.click();
  await expect(page.locator("#nav-panel")).toBeVisible();
  await page.mouse.click(20, 600);
  await expect(toggle).toHaveAttribute("aria-expanded", "false");

  await toggle.click();
  await page.keyboard.press("Escape");
  await expect(toggle).toBeFocused();
  await expect(toggle).toHaveAttribute("aria-expanded", "false");

  await toggle.click();
  await page.locator("#nav-panel").getByRole("link", { name: "Skills" }).click();
  await expect(toggle).toHaveAttribute("aria-expanded", "false");
  await expect(page.locator("#skills")).toBeInViewport();
});

test("health endpoint and security headers", async ({ request }) => {
  const health = await request.get("/health");
  expect(health.status()).toBe(200);
  expect(await health.text()).toBe('{"status": "ok"}');

  const home = await request.get("/");
  const headers = home.headers();
  expect(headers["content-security-policy"]).toContain("script-src 'self' 'nonce-");
  expect(headers["content-security-policy"]).toContain("connect-src 'self' https://umami.scruzzi.com");
  expect(await home.text()).toContain('src="https://umami.scruzzi.com/script.js"');
  expect(headers["x-content-type-options"]).toBe("nosniff");
  expect(headers["x-frame-options"]).toBe("DENY");
  expect(headers["strict-transport-security"]).toContain("max-age=");
  expect(headers["x-powered-by"]).toBeUndefined();
});

test("boot screen counts up and then dissolves", async ({ page }) => {
  await page.goto("/");
  const loader = page.locator(".preloader");
  await expect(loader).toBeVisible();
  await expect(loader).toContainText("%");
  await expect(loader).toHaveCount(0, { timeout: 15_000 });
  await expect(page.locator("html")).not.toHaveClass(/is-loading/);
});

test("unknown routes render the custom 404 page", async ({ page }) => {
  const response = await page.goto("/does-not-exist");
  expect(response?.status()).toBe(404);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Diese Route läuft ins Leere.");
});

test("crawler files are served", async ({ request }) => {
  expect(await (await request.get("/robots.txt")).text()).toContain("Sitemap: https://scruzzi.com/sitemap.xml");
  expect(await (await request.get("/sitemap.xml")).text()).toContain("<loc>https://scruzzi.com/</loc>");
  expect((await request.get("/social-preview.png")).status()).toBe(200);
});
