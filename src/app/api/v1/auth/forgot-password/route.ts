export const dynamic = "force-dynamic";
import { prisma } from "@/lib/prisma";
import { json, error } from "@/lib/api-response";
import { generateToken, rateLimit, auditLog, getClientIp } from "@/lib/auth";
import { sendEmail, resetPasswordEmailHtml, resetPasswordEmailText } from "@/lib/email";
import { sanitizeInput, validateEmail } from "@/lib/validation";

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

    const emailCheck = validateEmail(email);
    if (!emailCheck.valid && emailCheck.error) {
      return error("Please enter a valid email address", 400);
    }

    const cleanEmail = sanitizeInput(String(email)).toLowerCase().trim();
    const user = await prisma.user.findUnique({ where: { email: cleanEmail } });
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

    await prisma.passwordResetToken.deleteMany({ where: { userId: user.id } });

    const token = generateToken();
    await prisma.passwordResetToken.create({
      data: {
        identifier: cleanEmail,
        token,
        expires: new Date(Date.now() + RESET_TTL_MS),
        userId: user.id,
      },
    });

    const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3001";
    const emailResult = await sendEmail({
      to: cleanEmail,
      subject: "Reset your password",
      html: resetPasswordEmailHtml(token, baseUrl),
      text: resetPasswordEmailText(token, baseUrl),
    });

    await auditLog({
      userId: user.id,
      action: "USER.PASSWORD_RESET_REQUESTED",
      entity: "User",
      entityId: user.id,
      metadata: { email: cleanEmail, emailSent: emailResult.ok },
      ip,
    });

    return json({
      message: emailResult.ok
        ? "If an account exists, a reset link has been sent."
        : "Reset email could not be sent. SMTP may not be configured.",
      resetSent: emailResult.ok,
      emailError: emailResult.ok ? undefined : emailResult.error,
    });
  } catch {
    return error("Password reset request failed", 500);
  }
}
