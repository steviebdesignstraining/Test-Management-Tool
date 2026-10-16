import { prisma } from "@/lib/prisma";
import { json, error } from "@/lib/api-response";
import bcrypt from "bcryptjs";
import { rateLimit, auditLog, getClientIp } from "@/lib/auth";

export async function POST(req: Request) {
  const ip = getClientIp(req);
  const limit = rateLimit(`reset-password:${ip}`, { limit: 5, windowMs: 60 * 1000 });
  if (!limit.allowed) {
    return error("Too many requests. Try again later.", 429);
  }

  try {
    const { token, password } = await req.json();
    if (!token || !password) {
      return error("Token and password are required", 400);
    }

    const reset = await prisma.passwordResetToken.findUnique({ where: { token } });
    if (!reset) {
      return error("Invalid or expired reset token", 404);
    }
    if (reset.expires < new Date()) {
      await prisma.passwordResetToken.delete({ where: { id: reset.id } });
      return error("Reset token has expired", 410);
    }

    const user = await prisma.user.findUnique({ where: { id: reset.userId } });
    if (!user) {
      return error("Account not found", 404);
    }

    const passwordHash = await bcrypt.hash(password, 12);

    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash },
    });
    await prisma.passwordResetToken.delete({ where: { id: reset.id } });

    await auditLog({
      userId: user.id,
      action: "USER.PASSWORD_RESET_COMPLETED",
      entity: "User",
      entityId: user.id,
      metadata: { email: user.email },
      ip,
    });

    return json({ message: "Password reset completed. You can sign in." });
  } catch {
    return error("Password reset failed", 500);
  }
}
