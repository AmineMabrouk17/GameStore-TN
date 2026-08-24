const PBKDF2_ITERATIONS = 100000;
const SALT_BYTES = 16;
const KEY_BYTES = 32;
const HASH_NAME = "SHA-256";
const ALGORITHM_ID = "pbkdf2_sha256";
const MAX_ITERATIONS = 10000000;

function toBase64(bytes: Uint8Array): string {
  let binary = "";
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i] as number);
  }
  return btoa(binary);
}

function fromBase64(value: string): Uint8Array<ArrayBuffer> | null {
  try {
    const binary = atob(value);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes;
  } catch {
    return null;
  }
}

async function deriveKey(
  password: string,
  salt: Uint8Array<ArrayBuffer>,
  iterations: number
): Promise<Uint8Array> {
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(password),
    { name: "PBKDF2" },
    false,
    ["deriveBits"]
  );
  const bits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", hash: HASH_NAME, salt, iterations },
    keyMaterial,
    KEY_BYTES * 8
  );
  return new Uint8Array(bits);
}

export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(SALT_BYTES));
  const key = await deriveKey(password, salt, PBKDF2_ITERATIONS);
  return `${ALGORITHM_ID}$${PBKDF2_ITERATIONS}$${toBase64(salt)}$${toBase64(key)}`;
}

export async function verifyPassword(
  password: string,
  storedHash: string
): Promise<boolean> {
  try {
    const parts = storedHash.split("$");
    if (parts.length !== 4) return false;

    const [algorithm, iterationsRaw, saltB64, keyB64] = parts;
    if (algorithm !== ALGORITHM_ID) return false;

    const iterations = Number.parseInt(iterationsRaw ?? "", 10);
    if (
      !Number.isInteger(iterations) ||
      iterations < 1 ||
      iterations > MAX_ITERATIONS
    ) {
      return false;
    }

    const salt = fromBase64(saltB64 ?? "");
    const expected = fromBase64(keyB64 ?? "");
    if (!salt || !expected || salt.length === 0 || expected.length === 0) {
      return false;
    }

    const derived = await deriveKey(password, salt, iterations);
    if (derived.length !== expected.length) return false;

    let diff = 0;
    for (let i = 0; i < derived.length; i++) {
      diff |= (derived[i] as number) ^ (expected[i] as number);
    }
    return diff === 0;
  } catch {
    return false;
  }
}
