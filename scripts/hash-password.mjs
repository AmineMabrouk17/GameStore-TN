import { webcrypto } from "node:crypto";

const ITERATIONS = 100000;
const SALT_BYTES = 16;
const KEY_BYTES = 32;

const password = process.argv[2];

if (!password) {
  console.error("Usage: npm run hash:password -- <password>");
  process.exit(1);
}

function toBase64(bytes) {
  return Buffer.from(bytes).toString("base64");
}

const salt = webcrypto.getRandomValues(new Uint8Array(SALT_BYTES));
const keyMaterial = await webcrypto.subtle.importKey(
  "raw",
  new TextEncoder().encode(password),
  { name: "PBKDF2" },
  false,
  ["deriveBits"]
);
const key = await webcrypto.subtle.deriveBits(
  { name: "PBKDF2", hash: "SHA-256", salt, iterations: ITERATIONS },
  keyMaterial,
  KEY_BYTES * 8
);

console.log(
  `pbkdf2_sha256$${ITERATIONS}$${toBase64(salt)}$${toBase64(new Uint8Array(key))}`
);
