import { createHmac, timingSafeEqual } from "crypto";

/** Verify GitHub's X-Hub-Signature-256 header against the raw request body. */
export function verifyGithubSignature(rawBody: string, header: string | null, secret: string | undefined): boolean {
  if (!secret || !header?.startsWith("sha256=")) return false;
  const expected = Buffer.from("sha256=" + createHmac("sha256", secret).update(rawBody).digest("hex"));
  const given = Buffer.from(header);
  return expected.length === given.length && timingSafeEqual(expected, given);
}
