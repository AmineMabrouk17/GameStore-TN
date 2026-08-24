# E2E tests (Playwright)

Run against a local dev server (started automatically via `npm run dev` on port 3000):

```bash
npx playwright install chromium   # once
npm run test:e2e
```

## Admin auth

The suite signs in through `POST /api/auth/login`, so the local D1 database must
contain an admin whose password you know. Set one with:

```bash
node scripts/set-local-admin-password.mjs 'pw-playwright-test-2026'
```

Override credentials in CI/other environments with:

- `E2E_ADMIN_USERNAME` (default `admin`)
- `E2E_ADMIN_PASSWORD` (default `pw-playwright-test-2026`)

The session is captured in `.playwright/auth.json` by the `setup` project and is gitignored.

## What is covered

- `responsive.spec.ts` — no horizontal overflow at 320 / 375 / 768 px on the
  storefront, catalog and admin login; header fits; mobile menu navigation;
  compact locale switcher labels on small screens.
- `admin-form.spec.ts` — the "add account" dialog: selects/inputs are tappable,
  controls render at 16px on mobile (prevents iOS auto-zoom), dropdown options
  have an opaque background, selections update form state, and a full
  create → verify → cleanup round-trip.
