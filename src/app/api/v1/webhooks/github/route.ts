export const dynamic = "force-dynamic";
import { json, error } from "@/lib/api-response";
import { prisma } from "@/lib/prisma";
import { verifyGithubSignature } from "@/lib/github-signature";

export async function POST(req: Request) {
  try {
    const signature = req.headers.get("x-hub-signature-256") || req.headers.get("x-hub-signature");
    const body = await req.text();
    const secret = process.env.GITHUB_WEBHOOK_SECRET;
    if (secret && signature) {
      const valid = verifyGithubSignature(secret, body, signature);
      if (!valid) return error("Invalid signature", 401);
    }
    // Minimal: ignore payloads
    return json({ ok: true });
  } catch {
    return error("Webhook processing failed", 400);
  }
}
