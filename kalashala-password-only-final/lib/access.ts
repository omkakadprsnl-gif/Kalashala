import crypto from "crypto";

const COOKIE_NAME = "kalashala_access";

export function hasValidAccessToken(
  token: string | undefined
) {
  const secret =
    process.env.KALASHALA_ACCESS_SECRET;

  if (!token || !secret) {
    return false;
  }

  const parts = token.split(".");

  if (parts.length !== 2) {
    return false;
  }

  const [expiresAtString, signature] = parts;

  const expiresAt = Number(expiresAtString);

  if (!Number.isFinite(expiresAt)) {
    return false;
  }

  if (Date.now() > expiresAt) {
    return false;
  }

  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(expiresAtString)
    .digest("hex");

  if (signature.length !== expectedSignature.length) {
    return false;
  }

  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}

export function accessCookieName() {
  return COOKIE_NAME;
}