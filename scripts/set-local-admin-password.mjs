import { execFileSync } from "node:child_process";
import { webcrypto } from "node:crypto";

const ITERATIONS = 100000;
const SALT_BYTES = 16;
const KEY_BYTES = 32;

const username = process.argv[2];
const password = process.argv[3];

if (!username || !password) {
  console.error("Usage: node scripts/set-local-admin-password.mjs <username> <password>");
  process.exit(1);
}

function toBase64(bytes) {
  return Buffer.from(bytes).toString("base64");
}

async function hashPassword(password) {
  const salt = webcrypto.getRandomValues(new Uint8Array(SALT_BYTES));
  const keyMaterial = await webcrypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(password),
    { name: "PBKDF2" },
    false,
    ["deriveBits"],
  );
  const bits = await webcrypto.subtle.deriveBits(
    { name: "PBKDF2", hash: "SHA-256", salt, iterations: ITERATIONS },
    keyMaterial,
    KEY_BYTES * 8,
  );
  return `pbkdf2_sha256$${ITERATIONS}$${toBase64(salt)}$${toBase64(bits)}`;
}

const hash = await hashPassword(password);
// shell-safe: hash/username contain no quotes
execFileSync(
  "npx",
  [
    "wrangler",
    "d1",
    "execute",
    "gamestore_db",
    "--local",
    "--command",
    `UPDATE admins SET password_hash='${hash}' WHERE username='${username}';`,
  ],
  { stdio: "inherit" },
);
console.log(`Local admin "${username}" password updated.`);
