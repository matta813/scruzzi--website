const { test, expect } = require("@playwright/test");

test("page has no horizontal overflow", async ({ page }) => {
  await page.goto("/");
  const dimensions = await page.evaluate(() => ({
    viewport: document.documentElement.clientWidth,
    content: document.documentElement.scrollWidth,
  }));
  expect(dimensions.content).toBeLessThanOrEqual(dimensions.viewport);
});

test("theme selection survives a reload", async ({ page }) => {
  await page.goto("/");
  const initialTheme = await page.locator("html").getAttribute("data-theme");
  await page.getByRole("button", { name: /Design aktivieren/ }).click();
  const selectedTheme = initialTheme === "dark" ? "light" : "dark";
  await expect(page.locator("html")).toHaveAttribute("data-theme", selectedTheme);
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-theme", selectedTheme);
});

test("mobile menu supports link, outside-click and keyboard dismissal", async ({ page }, testInfo) => {
  test.skip(!testInfo.project.name.startsWith("mobile"), "Mobile navigation only");
  await page.goto("/");
  const toggle = page.locator("#menu-toggle");

  await toggle.click();
  await expect(toggle).toHaveAttribute("aria-expanded", "true");
  await page.locator(".hero-actions").click();
  await expect(toggle).toHaveAttribute("aria-expanded", "false");

  await toggle.click();
  await page.keyboard.press("Escape");
  await expect(toggle).toBeFocused();
  await expect(toggle).toHaveAttribute("aria-expanded", "false");

  await toggle.click();
  await page.getByRole("link", { name: "Skills", exact: true }).click();
  await expect(page).toHaveURL(/#skills$/);
  await expect(toggle).toHaveAttribute("aria-expanded", "false");
});
