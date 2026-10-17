/**
 * Single source of truth for the session-signing secret.
 * Never falls back to a guessable value in production.
 */
export function getAuthSecret(): string {
  const secret = process.env.AUTH_SECRET;
  if (secret && secret.length >= 32) return secret;
  if (process.env.NODE_ENV === "production") {
    throw new Error("AUTH_SECRET must be set to a random value of at least 32 characters.");
  }
  return secret || "dev-only-insecure-secret-do-not-use-in-production";
}
