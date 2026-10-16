import { prisma } from "@/lib/prisma";
import { json, error } from "@/lib/api-response";
import { generateToken, rateLimit, auditLog, getClientIp } from "@/lib/auth";
import { sendEmail, verificationEmailHtml, verificationEmailText } from "@/lib/email";

const VERIFY_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

export async function POST(req: Request) {
  const ip = getClientIp(req);
  const limit = rateLimit(`resend-verification:${ip}`, { limit: 3, windowMs: 60 * 60 * 1000 });
  if (!limit.allowed) {
    return error("Too many requests. Try again later.", 429);
  }

  try {
    const { email } = await req.json();
    if (!email) {
      return error("Email is required", 400);
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      // Don't reveal whether an account exists.
      return json({ message: "If an account exists, a verification link has been sent." });
    }
    if (user.emailVerified) {
      return json({ message: "Email is already verified." });
    }

    // Invalidate any existing unverified tokens for this email.
    await prisma.verificationToken.deleteMany({ where: { identifier: email } });

    const token = generateToken();
    await prisma.verificationToken.create({
      data: {
        identifier: email,
        token,
        expires: new Date(Date.now() + VERIFY_TTL_MS),
      },
    });

    // Send verification email (non-blocking).
    const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3001";
    void sendEmail({
      to: email,
      subject: "Verify your email address",
      html: verificationEmailHtml(token, baseUrl),
      text: verificationEmailText(token, baseUrl),
    });

    await auditLog({
      userId: user.id,
      action: "USER.RESEND_VERIFICATION",
      entity: "User",
      entityId: user.id,
      metadata: { email },
      ip,
    });

    return json({
      message: "If an account exists, a verification link has been sent.",
    });
  } catch {
    return error("Resend verification failed", 500);
  }
}
