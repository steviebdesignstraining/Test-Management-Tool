import { prisma } from "@/lib/prisma";
import { json, error } from "@/lib/api-response";
import { generateToken, rateLimit, auditLog, getClientIp } from "@/lib/auth";
import { sendEmail, resetPasswordEmailHtml, resetPasswordEmailText } from "@/lib/email";

const RESET_TTL_MS = 60 * 60 * 1000; // 1 hour

export async function POST(req: Request) {
  const ip = getClientIp(req);
  const limit = rateLimit(`forgot-password:${ip}`, { limit: 3, windowMs: 60 * 60 * 1000 });
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
      return json({
        message: "If an account exists, a reset link has been sent.",
        resetSent: false,
      });
    }

    if (!user.passwordHash) {
      return json({
        message: "This account has no password set.",
        resetSent: false,
      });
    }

    // Invalidate any existing reset tokens for this user.
    await prisma.passwordResetToken.deleteMany({ where: { userId: user.id } });

    const token = generateToken();
    await prisma.passwordResetToken.create({
      data: {
        identifier: email,
        token,
        expires: new Date(Date.now() + RESET_TTL_MS),
        userId: user.id,
      },
    });

    // Send password reset email (non-blocking).
    const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3001";
    void sendEmail({
      to: email,
      subject: "Reset your password",
      html: resetPasswordEmailHtml(token, baseUrl),
      text: resetPasswordEmailText(token, baseUrl),
    });

    await auditLog({
      userId: user.id,
      action: "USER.PASSWORD_RESET_REQUESTED",
      entity: "User",
      entityId: user.id,
      metadata: { email },
      ip,
    });

    return json({
      message: "If an account exists, a reset link has been sent.",
      resetSent: true,
    });
  } catch {
    return error("Password reset request failed", 500);
  }
}
