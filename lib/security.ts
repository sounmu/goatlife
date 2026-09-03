import { createHash, createHmac, randomBytes, timingSafeEqual } from "node:crypto";

function pepper() {
  return process.env.TOKEN_PEPPER ?? process.env.ADMIN_SESSION_SECRET ?? "local-development-only";
}

export function randomToken(bytes = 32) {
  return randomBytes(bytes).toString("base64url");
}

export function hashToken(value: string) {
  return createHash("sha256").update(`${pepper()}:${value}`).digest("hex");
}

export function createRecoveryCode() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const bytes = randomBytes(6);
  return Array.from(bytes, (byte) => alphabet[byte % alphabet.length]).join("");
}

export function signValue(value: string) {
  const secret = process.env.ADMIN_SESSION_SECRET ?? "local-development-only";
  const signature = createHmac("sha256", secret).update(value).digest("base64url");
  return `${value}.${signature}`;
}

export function verifySignedValue(signed: string) {
  const separator = signed.lastIndexOf(".");
  if (separator < 1) return null;
  const value = signed.slice(0, separator);
  const expected = signValue(value).slice(separator + 1);
  const actualBuffer = Buffer.from(signed.slice(separator + 1));
  const expectedBuffer = Buffer.from(expected);
  if (actualBuffer.length !== expectedBuffer.length || !timingSafeEqual(actualBuffer, expectedBuffer)) return null;
  return value;
}
