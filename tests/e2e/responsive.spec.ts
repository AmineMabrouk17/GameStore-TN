import { expect, type Page, test } from "@playwright/test";

const VIEWPORTS = [320, 375, 768] as const;
const PUBLIC_PATHS = ["/ar", "/ar/catalog", "/ar/admin/login"];

async function horizontalOverflow(page: Page): Promise<number> {
  return page.evaluate(
    () =>
      document.documentElement.scrollWidth -
      document.documentElement.clientWidth,
  );
}

test.describe("responsive layout", () => {
  for (const width of VIEWPORTS) {
    for (const path of PUBLIC_PATHS) {
      test(`no horizontal overflow on ${path} @${width}px`, async ({ page }) => {
        await page.setViewportSize({ width, height: 812 });
        await page.goto(path, { waitUntil: "networkidle" });
        const overflow = await horizontalOverflow(page);
        expect(
          overflow,
          `${path} must not scroll horizontally at ${width}px`,
        ).toBeLessThanOrEqual(0);
      });
    }

    test(`header stays within viewport @${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 812 });
      await page.goto("/ar", { waitUntil: "networkidle" });
      const header = page.locator("header").first();
      await expect(header).toBeVisible();
      const box = await header.boundingBox();
      expect(box?.width ?? Infinity).toBeLessThanOrEqual(width + 1);
    });
  }
});

test.describe("mobile navigation (375px)", () => {
  test.use({ viewport: { width: 375, height: 812 } });

  test("hamburger opens the menu and navigates to the catalog", async ({
    page,
  }) => {
    await page.goto("/ar", { waitUntil: "networkidle" });

    const menuButton = page.getByRole("button", {
      name: /فتح القائمة|القائمة|menu|قائمة/i,
    });
    await expect(menuButton).toBeVisible();

    await menuButton.click();
    const catalogLink = page
      .locator("header nav:not(.hidden)")
      .getByRole("link")
      .filter({ hasText: /المتجر|catalog/i })
      .first();
    await expect(catalogLink).toBeVisible();
    await catalogLink.click();
    await expect(page).toHaveURL(/\/ar\/catalog/);
  });

  test("locale switcher shows compact labels on small screens", async ({
    page,
  }) => {
    await page.goto("/ar", { waitUntil: "networkidle" });
    const arButton = page.getByRole("button", { name: "العربية" });
    const frButton = page.getByRole("button", { name: "Français" });
    await expect(arButton.getByText("AR", { exact: true })).toBeVisible();
    await expect(frButton.getByText("FR", { exact: true })).toBeVisible();
    await expect(arButton.getByText("العربية", { exact: true })).toBeHidden();
    // compact switcher keeps the whole header inside the viewport
    expect(await horizontalOverflow(page)).toBeLessThanOrEqual(0);
  });

  test("catalog filter bar stacks into a single column", async ({ page }) => {
    await page.goto("/ar/catalog", { waitUntil: "networkidle" });
    const searchInput = page.getByPlaceholder(/لوج|search/i);
    const box = await searchInput.boundingBox();
    const viewportWidth = page.viewportSize()?.width ?? 375;
    expect(box?.width ?? Infinity).toBeLessThan(viewportWidth - 24);
    expect(await horizontalOverflow(page)).toBeLessThanOrEqual(0);
  });
});

test.describe("desktop layout (1440px)", () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test("full locale labels are shown on wide screens", async ({ page }) => {
    await page.goto("/ar", { waitUntil: "networkidle" });
    const arButton = page.getByRole("button", { name: "العربية" });
    await expect(arButton.getByText("العربية", { exact: true })).toBeVisible();
    await expect(arButton.getByText("AR", { exact: true })).toBeHidden();
  });

  test("desktop nav links are visible without a hamburger", async ({
    page,
  }) => {
    await page.goto("/ar", { waitUntil: "networkidle" });
    await expect(page.locator("header nav").first().getByRole("link")).toHaveCount(2);
    expect(await horizontalOverflow(page)).toBeLessThanOrEqual(0);
  });
});
