import { expect, test as setup } from "@playwright/test";

const stateFile = ".playwright/auth.json";

setup("authenticate as admin", async ({ request }) => {
  const username = process.env.E2E_ADMIN_USERNAME ?? "admin";
  const password = process.env.E2E_ADMIN_PASSWORD ?? "pw-playwright-test-2026";

  const res = await request.post("/api/auth/login", {
    data: { username, password },
  });
  if (res.status() !== 200) {
    throw new Error(
      `Admin login failed with status ${res.status()}. Seed the local DB and set the local admin password before running e2e tests. See tests/e2e/README.md.`,
    );
  }
  await expect(res).toBeOK();

  await request.storageState({ path: stateFile });
});
