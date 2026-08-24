import { expect, test } from "@playwright/test";

const ADD_BUTTON = "زيد حساب";

async function openAddAccountDialog(page: import("@playwright/test").Page) {
  await page.goto("/ar/admin/dashboard", { waitUntil: "networkidle" });
  await page.getByRole("button", { name: ADD_BUTTON }).click();
  const dialog = page.locator('[role="dialog"]');
  await expect(dialog).toBeVisible();
  // categories arrive via client-side fetch — wait until the picker is populated
  await expect(dialog.locator("#category option").first()).toBeAttached({
    timeout: 10_000,
  });
  return dialog;
}

test.describe("add-account form — input selection", () => {
  test.use({ viewport: { width: 375, height: 812 }, hasTouch: true });

  test("selects and inputs are reachable and tappable on mobile", async ({
    page,
  }) => {
    const dialog = await openAddAccountDialog(page);

    for (const id of ["category", "currency", "status"]) {
      const select = dialog.locator(`#${id}`);
      await expect(select).toBeVisible();
      await expect(select).toBeEnabled();

      // a tap must move focus to the select (native picker opens from focus)
      await select.tap();
      expect(
        await select.evaluate((el) => el === document.activeElement),
        `#${id} should receive focus when tapped`,
      ).toBe(true);
    }

    const price = dialog.locator("#price");
    await price.tap();
    await price.fill("42.5");
    await expect(price).toHaveValue("42.5");
  });

  test("form controls render at 16px on mobile so iOS does not auto-zoom", async ({
    page,
  }) => {
    const dialog = await openAddAccountDialog(page);

    const sizes = await dialog
      .locator("select, input:not([type=checkbox]), textarea")
      .evaluateAll((els) => els.map((el) => getComputedStyle(el).fontSize));

    expect(sizes.length).toBeGreaterThan(0);
    for (const size of sizes) {
      expect(Number.parseFloat(size)).toBeGreaterThanOrEqual(16);
    }
  });

  test("dropdown options are readable (opaque background)", async ({
    page,
  }) => {
    const dialog = await openAddAccountDialog(page);

    const optionStyles = await dialog
      .locator("#category option")
      .evaluateAll((opts) =>
        opts.map((o) => getComputedStyle(o).backgroundColor),
      );

    expect(optionStyles.length).toBeGreaterThan(0);
    for (const bg of optionStyles) {
      // transparent options are invisible in several browser/OS combos
      expect(bg).not.toBe("rgba(0, 0, 0, 0)");
    }
  });

  test("category, currency and status selections update the form state", async ({
    page,
  }) => {
    const dialog = await openAddAccountDialog(page);

    const category = dialog.locator("#category");
    const categoryCount = await category.locator("option").count();
    if (categoryCount > 1) {
      const before = await category.inputValue();
      await category.selectOption({ index: 1 });
      expect(
        await category.inputValue(),
        "picking another category must update the form state",
      ).not.toBe(before);
    }

    await dialog.locator("#currency").selectOption("EUR");
    await expect(dialog.locator("#currency")).toHaveValue("EUR");

    await dialog.locator("#status").selectOption("RESERVED");
    await expect(dialog.locator("#status")).toHaveValue("RESERVED");

    // featured checkbox toggles both ways
    const featured = dialog.getByRole("checkbox");
    await featured.check();
    await expect(featured).toBeChecked();
    await featured.uncheck();
    await expect(featured).not.toBeChecked();
  });

  test("typing keeps focus in the field (no re-click after each keystroke)", async ({
    page,
  }) => {
    const dialog = await openAddAccountDialog(page);
    const title = dialog.locator("#title_fr");

    await title.click();
    await page.keyboard.type("FIFA 2026 account", { delay: 40 });

    await expect(title).toHaveValue("FIFA 2026 account");
    await expect(title).toBeFocused();
  });

  test("creating an account end-to-end works from the form", async ({
    request,
    page,
  }) => {
    const dialog = await openAddAccountDialog(page);
    const stamp = Date.now();

    await dialog.locator("#title_ar").fill(`حساب اختبار ${stamp}`);
    await dialog.locator("#title_fr").fill(`Compte test ${stamp}`);
    await dialog.locator("#price").fill("25");
    await dialog.getByRole("button", { name: "سجّل" }).click();

    await expect(dialog).toBeHidden({ timeout: 15_000 });

    // the new product is served by the public API
    const res = await request.get(`/api/products?q=${stamp}&pageSize=5`);
    expect(res.status()).toBe(200);
    const data = await res.json();
    expect(data.total).toBeGreaterThan(0);

    // cleanup so the local dataset stays deterministic
    const created = data.items.find((p: { title_fr: string }) =>
      p.title_fr.includes(String(stamp)),
    );
    if (created) {
      const del = await request.delete(`/api/admin/products/${created.id}`);
      expect([200, 204]).toContain(del.status());
    }
  });
});
