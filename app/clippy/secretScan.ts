import { createHash } from "node:crypto";

/**
 * Test-only helper. The repo is public, so tests that guard against leaking
 * private strings (phone number, ATLAS sponsors and repo names) keep only
 * SHA-256 digests of the lowercased strings, never the strings themselves.
 */
export type SecretDigest = { length: number; sha256: string };

export const SECRET_DIGESTS: readonly SecretDigest[] = [
  // Max's phone number (digits only).
  { length: 8, sha256: "40ce6d975ab9685bd47fe592d64e39e0090d1aa76f5e1e771081d237721e4032" },
  // ATLAS sponsor names.
  { length: 10, sha256: "1247357f8c2097cb6e28f5ce00a5b1f39232f38d8d5496aeef416b608ea66e0c" },
  { length: 7, sha256: "345c7c3cc3c193adde4634d4bf0e483cf94ed79cce2a1c5d6fbff0ce8ad78396" },
  // ATLAS team repo names.
  { length: 9, sha256: "7d61933ba84685f97aff13b08967e7ccaecd219766e08a0ed90ed256f8da56fb" },
  { length: 15, sha256: "3974a218745545a049194a7e03b6af02f14e115154c7063781818144f9c04ff6" },
  { length: 15, sha256: "33496a9f78b6a3f21c84a23a99bcd6abba73d8fe0271a635624db15c59dfdddf" },
];

const sha256 = (s: string) => createHash("sha256").update(s, "utf8").digest("hex");

function scan(text: string, digests: readonly SecretDigest[], found: Set<string>) {
  const lengths = new Set(digests.map((d) => d.length));
  const wanted = new Set(digests.map((d) => d.sha256));
  for (const len of lengths) {
    for (let i = 0; i + len <= text.length; i++) {
      const h = sha256(text.slice(i, i + len));
      if (wanted.has(h)) found.add(h);
    }
  }
}

/**
 * Returns the digests whose (NFC, lowercased) preimage appears anywhere in
 * `text`, checking every substring window of each digest's length. The text
 * is also scanned with all non-digits removed, so a number split by spaces
 * or dashes is still caught.
 */
export function findSecrets(
  text: string,
  digests: readonly SecretDigest[] = SECRET_DIGESTS,
): string[] {
  const normalized = text.normalize("NFC").toLowerCase();
  const found = new Set<string>();
  scan(normalized, digests, found);
  scan(normalized.replace(/\D+/g, ""), digests, found);
  return [...found];
}

/** Any phone-number-like run of 8+ digits (separators allowed). */
export const PHONE_LIKE = /\+?\d(?:[\s().-]?\d){7,}/;
