import { prisma } from "@/lib/prisma";
import { json, error } from "@/lib/api-response";
import bcrypt from "bcryptjs";
import { createSession, rateLimit, auditLog, getClientIp } from "@/lib/auth";
import { sanitizeInput } from "@/lib/validation";

export async function POST(req: Request) {
  const ip = getClientIp(req);
  const limit = rateLimit(`login:${ip}`, { limit: 5, windowMs: 60 * 1000 });
  if (!limit.allowed) {
    return error("Too many requests. Try again later.", 429);
  }

  try {
    const { email, password, keepSignedIn } = await req.json();

    if (!email || !password) {
      return error("Email and password are required", 400);
    }

    const cleanEmail = sanitizeInput(String(email)).toLowerCase().trim();

    const user = await prisma.user.findUnique({ where: { email: cleanEmail } });
    if (!user || !user.passwordHash) {
      await auditLog({
        action: "USER.LOGIN_FAILED",
        entity: "User",
        metadata: { email: cleanEmail, reason: "invalid_credentials" },
        ip,
      });
      return error("Invalid email or password.", 401);
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      await auditLog({
        userId: user.id,
        action: "USER.LOGIN_FAILED",
        entity: "User",
        entityId: user.id,
        metadata: { email: cleanEmail, reason: "invalid_credentials" },
        ip,
      });
      return error("Invalid email or password.", 401);
    }

    if (!user.emailVerified) {
      await auditLog({
        userId: user.id,
        action: "USER.LOGIN_BLOCKED_UNVERIFIED",
        entity: "User",
        entityId: user.id,
        metadata: { email: cleanEmail },
        ip,
      });
      return error("Please verify your email before signing in.", 403);
    }

    await createSession(user.id, user.role, keepSignedIn === true);

    await auditLog({
      userId: user.id,
      action: "USER.LOGIN",
      entity: "User",
      entityId: user.id,
      metadata: { email: cleanEmail },
      ip,
    });

    return json({
      user: { id: user.id, email: user.email, name: user.name },
    });
  } catch (err) {
    console.error("Login error:", err);
    return error("Login failed", 500);
  }
}
